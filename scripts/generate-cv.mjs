import { createWriteStream, existsSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import process from 'node:process'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import PDFDocument from 'pdfkit'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const basePath = resolve(root, 'resume.json')
const variantsDir = resolve(root, 'cv-variants')
const publicDir = resolve(root, 'public')
const lucide = JSON.parse(readFileSync(createRequire(import.meta.url).resolve('@iconify/json/json/lucide.json'), 'utf8'))
const contactIcons = {
  email: 'mail',
  phone: 'phone',
  location: 'map-pin',
  website: 'globe',
  github: 'github',
  linkedin: 'linkedin',
  x: 'twitter',
  codepen: 'codepen',
}

const colors = {
  ink: '#111111',
  accent: '#0093b8',
  link: '#075fd5',
  muted: '#444444',
}

const left = 18
const right = 594
const width = right - left
const bottom = 774

// Rendering state, reset for every CV that is generated.
let resume
let doc
let profileImage
let y = 0
let pageCount = 0

const base = JSON.parse(readFileSync(basePath, 'utf8'))
const variantNames = existsSync(variantsDir)
  ? readdirSync(variantsDir).filter(file => file.endsWith('.json')).map(file => file.slice(0, -5)).sort()
  : []

// `pnpm cv:build` builds everything; `pnpm cv:build fullstack mlops` builds only the named variants
// (`base` refers to resume.json itself).
const requested = process.argv.slice(2)
for (const name of requested) {
  if (name !== 'base' && !variantNames.includes(name))
    throw new Error(`Unknown CV variant "${name}". Available: base, ${variantNames.join(', ') || '(none)'}`)
}
const targets = requested.length ? requested : ['base', ...variantNames]

for (const name of targets) {
  if (name === 'base') {
    await renderCv(base, resolve(publicDir, 'cv.pdf'), 'resume.json')
    continue
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name))
    throw new Error(`Variant file name must be kebab-case: cv-variants/${name}.json`)
  const patch = JSON.parse(readFileSync(resolve(variantsDir, `${name}.json`), 'utf8'))
  await renderCv(applyVariant(base, patch), resolve(publicDir, `cv-${name}.pdf`), `cv-variants/${name}.json`)
}

// When building everything, delete PDFs of variants whose source file was removed.
if (!requested.length) {
  for (const file of readdirSync(publicDir)) {
    const match = file.match(/^cv-(.+)\.pdf$/)
    if (match && !variantNames.includes(match[1])) {
      rmSync(resolve(publicDir, file))
      console.log(`Removed stale public/${file}`)
    }
  }
}

/**
 * Applies a variant on top of resume.json using JSON Merge Patch (RFC 7386):
 * objects merge recursively, arrays and other values replace, `null` deletes a key.
 * Additionally, a string inside a top-level section array (work, education, projects,
 * contributions, skills) picks the base entry with that name, so variants can select
 * and reorder entries without copying them.
 */
function applyVariant(source, patch) {
  const result = mergePatch(source, patch)
  for (const section of ['work', 'education', 'projects', 'contributions', 'skills']) {
    if (!Array.isArray(patch[section]))
      continue
    result[section] = patch[section].map((entry) => {
      if (typeof entry !== 'string')
        return entry
      const found = source[section]?.find(item => (item.name ?? item.institution) === entry)
      if (!found)
        throw new Error(`Variant references unknown ${section} entry "${entry}"`)
      return structuredClone(found)
    })
  }
  return result
}

function mergePatch(target, patch) {
  if (!isPlainObject(patch))
    return structuredClone(patch)
  const result = isPlainObject(target) ? structuredClone(target) : {}
  for (const [key, value] of Object.entries(patch)) {
    if (value === null)
      delete result[key]
    else
      result[key] = mergePatch(result[key], value)
  }
  return result
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

async function renderCv(data, outputPath, sourceLabel) {
  validateResume(data, sourceLabel)
  resume = data
  y = 0
  pageCount = 0

  profileImage = resume.basics.image
    ? await sharp(resolve(root, resume.basics.image))
      .resize(256, 256, { fit: 'cover', position: 'centre' })
      .jpeg({ chromaSubsampling: '4:4:4', quality: 88 })
      .toBuffer()
    : null

  doc = new PDFDocument({
    autoFirstPage: false,
    compress: true,
    info: {
      Title: `${resume.basics.name} — Curriculum Vitae`,
      Author: resume.basics.name,
      Subject: resume.basics.label,
      Keywords: resume.skills.flatMap(skill => skill.keywords).join(', '),
      CreationDate: new Date('2000-01-01T00:00:00.000Z'),
      ModDate: new Date('2000-01-01T00:00:00.000Z'),
    },
    margins: { top: 18, right: 18, bottom: 18, left: 18 },
    size: 'LETTER',
  })

  const output = createWriteStream(outputPath)
  doc.pipe(output)

  addPage(false)
  drawHeader()
  drawSummary()

  drawSection('Experience')
  for (const role of resume.work) {
    drawEntry({
      body: role.summary,
      dates: dateRange(role),
      meta: role.location,
      subtitle: role.position,
      title: role.name,
      url: role.url,
    })
  }

  drawSection('Education')
  for (const item of resume.education) {
    drawEntry({
      body: item.summary,
      dates: [item.location, dateRange(item)].filter(Boolean).join(' • '),
      meta: item.studyType,
      subtitle: item.area,
      title: item.institution,
      url: item.url,
    })
  }

  drawSection('Projects')
  for (const project of resume.projects)
    drawProject(project)

  drawSection('Open Source Contribution')
  drawContributions(resume.contributions)

  drawSection('Skills')
  for (const skill of resume.skills)
    drawSkill(skill)

  const pages = pageCount
  doc.end()

  await new Promise((resolvePromise, reject) => {
    output.on('finish', resolvePromise)
    output.on('error', reject)
  })

  console.log(`Generated ${outputPath.slice(root.length + 1)} from ${sourceLabel} (${pages} page${pages === 1 ? '' : 's'})`)
}

function validateResume(data, sourceLabel) {
  const errors = []
  if (!data.basics?.name)
    errors.push('basics.name is required')
  if (!data.basics?.label)
    errors.push('basics.label is required')
  if (!data.basics?.email)
    errors.push('basics.email is required')

  for (const field of ['work', 'education', 'projects', 'skills', 'contributions']) {
    if (!Array.isArray(data[field]))
      errors.push(`${field} must be an array`)
  }

  if (data.basics?.image && !existsSync(resolve(root, data.basics.image)))
    errors.push(`basics.image does not exist: ${data.basics.image}`)

  if (errors.length)
    throw new Error(`Invalid CV data in ${sourceLabel}:\n- ${errors.join('\n- ')}`)
}

function addPage(continued = true) {
  doc.addPage()
  pageCount++
  y = 18

  if (continued) {
    doc.font('Helvetica-Bold').fontSize(10).fillColor(colors.ink)
    doc.text(resume.basics.name, left, y, { lineBreak: false })
    doc.font('Helvetica').fontSize(8).text(resume.basics.label, left, y + 1, {
      align: 'right',
      lineBreak: false,
      width,
    })
    y += 16
    doc.moveTo(left, y).lineTo(right, y).lineWidth(0.7).strokeColor(colors.accent).stroke()
    y += 8
  }
}

function ensureSpace(height) {
  if (y + height > bottom)
    addPage()
}

function drawHeader() {
  const photoSize = 64
  const photoX = right - photoSize
  const photoY = 18

  doc.font('Helvetica-Bold').fontSize(16.5).fillColor(colors.ink)
  doc.text(resume.basics.name, left, 25, { lineBreak: false })
  doc.font('Helvetica').fontSize(10.2)
  doc.text(resume.basics.label, left, 43, { lineBreak: false })

  // Location is information, not a link, so it sits next to the role instead of in the contact row.
  const location = formatLocation(resume.basics.location)
  if (location) {
    const labelFontSize = 10.2
    let x = left + doc.widthOfString(resume.basics.label) + 8
    doc.circle(x, 43 + labelFontSize * 0.42, 1.1).fillColor(colors.accent).fill()
    x += 8
    drawIcon(contactIcons.location, x, 43 + labelFontSize * 0.42 - 4.5, 9)
    doc.font('Helvetica').fontSize(labelFontSize).fillColor(colors.muted)
    doc.text(location, x + 12, 43, { lineBreak: false })
  }

  if (profileImage) {
    doc.save()
    doc.roundedRect(photoX, photoY, photoSize, photoSize, 7).clip()
    doc.image(profileImage, photoX, photoY, {
      align: 'center',
      cover: [photoSize, photoSize],
      valign: 'center',
    })
    doc.restore()
  }

  const profiles = Object.fromEntries((resume.basics.profiles ?? []).map(profile => [profile.network, profile]))
  const contacts = [
    { icon: 'email', link: `mailto:${resume.basics.email}`, text: resume.basics.email },
    { icon: 'phone', link: resume.basics.phone && `tel:${resume.basics.phone.replaceAll(' ', '')}`, text: resume.basics.phone },
    { icon: 'website', link: resume.basics.url, text: resume.basics.url && displayUrl(resume.basics.url) },
    { icon: 'github', link: profiles.GitHub?.url, text: profiles.GitHub && 'GitHub' },
    { icon: 'linkedin', link: profiles.LinkedIn?.url, text: profiles.LinkedIn && 'LinkedIn' },
    { icon: 'x', link: profiles.X?.url, text: profiles.X && 'X' },
    { icon: 'codepen', link: profiles.CodePen?.url, text: profiles.CodePen && 'CodePen' },
  ].filter(item => item.link || item.text)

  drawContactRow(contacts, 65, photoX - 14)
  y = 88
  doc.moveTo(left, y).lineTo(right, y).lineWidth(0.8).strokeColor(colors.accent).stroke()
  y += 7
}

function drawContactRow(items, rowY, maxX) {
  const fontSize = 8.7
  const iconSize = 9
  // Visual middle of mixed-case Helvetica text drawn at rowY (between x-height and cap height).
  const middle = rowY + fontSize * 0.42
  doc.font('Helvetica').fontSize(fontSize)
  let x = left

  for (const [index, item] of items.entries()) {
    const textWidth = item.text ? doc.widthOfString(item.text) : 0
    const itemWidth = iconSize + (item.text ? 3 + textWidth : 0)
    if (x + itemWidth > maxX)
      break

    const itemX = x
    drawIcon(contactIcons[item.icon], x, middle - iconSize / 2, iconSize)
    x += iconSize

    if (item.text) {
      x += 3
      doc.font('Helvetica').fontSize(fontSize).fillColor(item.link ? colors.link : colors.ink)
      doc.text(item.text, x, rowY, {
        lineBreak: false,
        underline: Boolean(item.link),
      })
      x += textWidth
    }

    if (item.link)
      doc.link(itemX - 1, middle - 6, itemWidth + 2, 12, item.link)

    if (index < items.length - 1) {
      x += 7
      doc.moveTo(x, middle - 5).lineTo(x, middle + 5).lineWidth(0.55).strokeColor(colors.accent).stroke()
      x += 7
    }
  }
}

// Renders a 24x24 Lucide icon (stroke-only path/rect/circle elements) at the given size.
function drawIcon(name, x, iconY, size) {
  const body = lucide.icons[name]?.body
  if (!body)
    return

  const scale = size / 24
  doc.save()
  doc.translate(x, iconY).scale(scale)
  doc.lineWidth(1.9).lineCap('round').lineJoin('round').strokeColor(colors.accent)

  for (const [, tag, attrs] of body.matchAll(/<(path|rect|circle)\b([^>]*)\/>/g)) {
    const attr = key => attrs.match(new RegExp(`\\s${key}="([^"]*)"`))?.[1]
    const num = key => Number(attr(key) ?? 0)
    if (tag === 'path')
      doc.path(attr('d'))
    else if (tag === 'rect')
      doc.roundedRect(num('x'), num('y'), num('width'), num('height'), num('rx'))
    else
      doc.circle(num('cx'), num('cy'), num('r'))
    doc.stroke()
  }

  doc.restore()
}

function drawSummary() {
  doc.font('Helvetica').fontSize(9.3).fillColor(colors.ink)
  doc.text(resume.basics.summary, left, y, { lineGap: 0.5, width })
  y = doc.y + 3
}

function drawSection(title) {
  ensureSpace(22)
  y += 2
  doc.font('Helvetica-Bold').fontSize(9.4).fillColor(colors.accent)
  doc.text(title, left, y, { lineBreak: false })
  y += 12
  doc.moveTo(left, y).lineTo(right, y).lineWidth(0.65).strokeColor(colors.accent).stroke()
  y += 5
}

function drawEntry({ body, dates, meta, subtitle, title, url }) {
  const bodyHeight = textHeight(body, 'Helvetica', 9.3, width, 0.45)
  ensureSpace(26 + bodyHeight)

  doc.font('Helvetica').fontSize(9.3).fillColor(colors.link)
  doc.text(title, left, y, { link: url, lineBreak: false, underline: Boolean(url) })
  if (meta) {
    doc.fillColor(colors.ink).text(meta, left, y, {
      align: 'right',
      lineBreak: false,
      width,
    })
  }
  y += 10.5

  doc.font('Helvetica').fontSize(9.3).fillColor(colors.ink)
  doc.text(subtitle, left, y, { lineBreak: false })
  if (dates) {
    doc.text(dates, left, y, {
      align: 'right',
      lineBreak: false,
      width,
    })
  }
  y += 10.5

  doc.font('Helvetica').fontSize(9.3).fillColor(colors.ink)
  doc.text(body, left, y, { lineGap: 0.45, width })
  y = doc.y + 3
}

function drawProject(project) {
  const stack = `Tech: ${project.keywords.join(', ')}`
  const descriptionHeight = textHeight(project.description, 'Helvetica', 9.3, width, 0.45)
  const stackHeight = textHeight(stack, 'Helvetica', 9.3, width, 0.3)
  ensureSpace(12 + descriptionHeight + stackHeight + 7)

  doc.font('Helvetica').fontSize(9.3).fillColor(colors.link)
  doc.text(project.name, left, y, {
    link: project.url,
    lineBreak: false,
    underline: Boolean(project.url),
  })
  if (project.date) {
    doc.fillColor(colors.ink).text(formatDate(project.date), left, y, {
      align: 'right',
      link: null,
      lineBreak: false,
      underline: false,
      width,
    })
  }
  y += 11

  doc.font('Helvetica').fontSize(9.3).fillColor(colors.ink)
  doc.text(project.description, left, y, { lineGap: 0.45, width })
  y = doc.y + 1
  doc.text(stack, left, y, { lineGap: 0.3, width })
  y = doc.y + 4
}

function drawSkill(skill) {
  const label = `${skill.name}: `
  const value = skill.keywords.join(', ')
  const height = textHeight(`${label}${value}`, 'Helvetica', 9.3, width, 0.2)
  ensureSpace(height + 2)
  doc.fontSize(9.3)

  doc.fillColor(colors.ink).font('Helvetica-Bold').text(label, left, y, { continued: true, lineGap: 0.2, width })
  doc.font('Helvetica').text(value, { lineGap: 0.2 })
  y = doc.y + 1
}

function drawContributions(items) {
  const gap = 18
  const columnWidth = (width - gap) / 2
  const rowHeight = 21
  const rows = Math.ceil(items.length / 2)
  ensureSpace(rows * rowHeight)

  items.forEach((item, index) => {
    const column = index % 2
    const row = Math.floor(index / 2)
    const x = left + column * (columnWidth + gap)
    const itemY = y + row * rowHeight

    doc.font('Helvetica').fontSize(9.3).fillColor(colors.link)
    doc.text(item.name, x, itemY, {
      link: item.url,
      lineBreak: false,
      underline: Boolean(item.url),
    })
    if (item.summary) {
      doc.fillColor(colors.ink).text(item.summary, x, itemY + 10.5, {
        link: null,
        lineBreak: false,
        underline: false,
        width: columnWidth,
      })
    }
  })

  y += rows * rowHeight + 3
}

function textHeight(text, font, size, availableWidth, lineGap) {
  doc.font(font).fontSize(size)
  return doc.heightOfString(text, { lineGap, width: availableWidth })
}

function dateRange(item) {
  if (!item.startDate && !item.endDate)
    return ''

  return [formatDate(item.startDate), item.endDate ? formatDate(item.endDate) : 'Present']
    .filter(Boolean)
    .join(' - ')
}

function formatDate(value) {
  if (!value)
    return ''
  const [year, month] = value.split('-').map(Number)
  if (!month)
    return String(year)
  return new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC', year: 'numeric' })
    .format(new Date(Date.UTC(year, month - 1, 1)))
}

function formatLocation(location) {
  if (!location)
    return ''
  const country = location.countryCode
    ? new Intl.DisplayNames('en', { type: 'region' }).of(location.countryCode)
    : location.country
  return [location.city, country].filter(Boolean).join(', ')
}

function displayUrl(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}
