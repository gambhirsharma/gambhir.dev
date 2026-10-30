// Checks every domain, subdomain, short link, and email address listed in
// .github/link-check/targets.json and reports status + latency for each.
// Run locally with `node scripts/check-links.mjs`; the scheduled workflow
// in .github/workflows/link-check.yml runs the same thing.
import { execFile } from 'node:child_process'
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolveMx, resolveTxt } from 'node:dns/promises'
import { connect } from 'node:net'
import process from 'node:process'
import { promisify } from 'node:util'

const run = promisify(execFile)
const config = JSON.parse(await readFile('.github/link-check/targets.json', 'utf8'))
const outDir = process.env.LINK_CHECK_OUT ?? 'link-check-report'
const userAgent = 'gambhir.dev-link-check (+https://github.com/gambhirsharma/gambhir.dev)'

// Compare URLs without caring about a `www.` prefix or a trailing slash, since
// the apex domain redirects to www and hosts disagree on trailing slashes.
function normalize(url) {
  try {
    const u = new URL(url)
    return `${u.protocol}//${u.host.replace(/^www\./, '')}${u.pathname.replace(/\/+$/, '')}${u.search}`.toLowerCase()
  }
  catch {
    return url
  }
}

async function readShortLinks() {
  if (!config.redirectsFile)
    return []
  const text = await readFile(config.redirectsFile, 'utf8').catch(() => '')
  return text.split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map((line) => {
      const [from, to] = line.split(/\s+/)
      return {
        url: new URL(from, config.redirectsBase).href,
        expect: new URL(to, config.redirectsBase).href,
        group: 'Short links',
      }
    })
}

async function checkUrl(target) {
  const args = ['-sS', '-o', '/dev/null', '-L', '--max-redirs', '10', '-m', String(config.timeoutSec), '-A', userAgent, '-w', '%{json}', target.url]
  let stdout = ''
  try {
    ({ stdout } = await run('curl', args))
  }
  catch (error) {
    // curl still prints the write-out JSON when the request itself fails.
    stdout = error.stdout ?? ''
  }

  let info = {}
  try {
    info = JSON.parse(stdout)
  }
  catch {}

  const status = info.http_code ?? 0
  const finalUrl = info.url_effective ?? target.url
  const ms = s => Math.round((s ?? 0) * 1000)
  const accept = target.accept ?? []
  const okStatus = (status >= 200 && status < 300) || accept.includes(status) || config.extraAccept?.includes(status)

  let problem = null
  if (!status)
    problem = info.errormsg || 'no response'
  else if (!okStatus)
    problem = `HTTP ${status}`
  else if (target.expect && normalize(finalUrl) !== normalize(target.expect))
    problem = `ended at ${finalUrl}, expected ${target.expect}`

  const totalMs = ms(info.time_total)
  return {
    group: target.group ?? 'Domains',
    name: target.url,
    status,
    finalUrl,
    redirects: info.num_redirects ?? 0,
    dnsMs: ms(info.time_namelookup),
    tlsMs: ms(info.time_appconnect),
    ttfbMs: ms(info.time_starttransfer),
    totalMs,
    result: problem ? 'fail' : totalMs > config.slowMs ? 'slow' : 'ok',
    note: problem ?? '',
  }
}

// Talk just enough SMTP to ask the mail server whether it accepts mail for
// the address, then hang up without sending anything.
function probeSmtp(host, address, timeoutMs = 15000) {
  return new Promise((resolve) => {
    const socket = connect(25, host)
    const steps = ['EHLO link-check.gambhir.dev', 'MAIL FROM:<>', `RCPT TO:<${address}>`]
    let buffer = ''
    let finished = false
    const done = (result) => {
      if (finished)
        return
      finished = true
      socket.end('QUIT\r\n')
      socket.destroy()
      resolve(result)
    }
    socket.setTimeout(timeoutMs, () => done({ ok: null, note: `could not reach ${host}:25 (outbound SMTP is often blocked on CI runners)` }))
    socket.on('error', err => done({ ok: null, note: `could not reach ${host}:25 (${err.code})` }))
    socket.on('data', (chunk) => {
      buffer += chunk
      // Wait for the last line of a (possibly multi-line) reply: "250 ok", not "250-ok".
      const lines = buffer.split('\r\n').filter(Boolean)
      const last = lines.at(-1) ?? ''
      if (!/^\d{3} /.test(last))
        return
      buffer = ''
      const code = Number(last.slice(0, 3))
      if (code >= 400)
        return done({ ok: false, note: `${host} replied: ${last}` })
      const next = steps.shift()
      if (next)
        socket.write(`${next}\r\n`)
      else
        done({ ok: true, note: `${host} accepts mail for ${address}` })
    })
  })
}

async function checkEmail(address) {
  const domain = address.split('@')[1]
  const started = performance.now()
  const problems = []
  const notes = []

  const mx = await resolveMx(domain).catch(() => [])
  if (!mx.length)
    problems.push('no MX records')
  else
    notes.push(`MX: ${mx.sort((a, b) => a.priority - b.priority).map(r => r.exchange).join(', ')}`)

  const txt = (await resolveTxt(domain).catch(() => [])).map(r => r.join(''))
  if (!txt.some(r => r.startsWith('v=spf1')))
    problems.push('no SPF record')

  const dmarc = (await resolveTxt(`_dmarc.${domain}`).catch(() => [])).map(r => r.join(''))
  if (!dmarc.some(r => r.startsWith('v=DMARC1')))
    problems.push('no DMARC record')

  if (mx.length) {
    const smtp = await probeSmtp(mx[0].exchange, address)
    if (smtp.ok === false)
      problems.push(smtp.note)
    else
      notes.push(smtp.note)
  }

  const totalMs = Math.round(performance.now() - started)
  return {
    group: 'Email',
    name: address,
    status: null,
    finalUrl: '',
    redirects: 0,
    dnsMs: null,
    tlsMs: null,
    ttfbMs: null,
    totalMs,
    result: problems.length ? 'fail' : 'ok',
    note: [...problems, ...notes].join('; '),
  }
}

const targets = [...config.urls, ...await readShortLinks()]
const results = [
  ...await Promise.all(targets.map(checkUrl)),
  ...await Promise.all((config.emails ?? []).map(checkEmail)),
]

const icon = { ok: '✅', slow: '🐢', fail: '❌' }
const time = value => value == null ? '—' : `${value} ms`
const failed = results.filter(r => r.result === 'fail')
const slow = results.filter(r => r.result === 'slow')

let md = `## Domains, short links & email\n\n`
md += `${results.length} checked · ${failed.length} failing · ${slow.length} slow (> ${config.slowMs} ms)\n`
for (const group of [...new Set(results.map(r => r.group))]) {
  md += `\n### ${group}\n\n| | Target | Status | DNS | TLS | TTFB | Total | Notes |\n|---|---|---|---|---|---|---|---|\n`
  for (const r of results.filter(r => r.group === group)) {
    const via = r.redirects ? `→ ${r.finalUrl}` : ''
    // A request that never got a response has no meaningful timings.
    const t = r.status === 0 ? () => '—' : time
    md += `| ${icon[r.result]} | ${r.name} | ${r.status || '—'} | ${t(r.dnsMs)} | ${t(r.tlsMs)} | ${t(r.ttfbMs)} | ${t(r.totalMs)} | ${[r.note, via].filter(Boolean).join(' ')} |\n`
  }
}

await mkdir(outDir, { recursive: true })
await writeFile(`${outDir}/targets.json`, `${JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2)}\n`)
await writeFile(`${outDir}/targets.md`, md)
if (process.env.GITHUB_STEP_SUMMARY)
  await appendFile(process.env.GITHUB_STEP_SUMMARY, md)
if (process.env.GITHUB_OUTPUT)
  await appendFile(process.env.GITHUB_OUTPUT, `failed=${failed.length > 0}\n`)

console.log(md)
process.exitCode = failed.length ? 1 : 0
