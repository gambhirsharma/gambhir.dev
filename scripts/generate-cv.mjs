import { createWriteStream, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import PDFDocument from 'pdfkit'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = resolve(root, 'resume.json')
const outputPath = resolve(root, 'public/cv.pdf')
const resume = JSON.parse(readFileSync(sourcePath, 'utf8'))

validateResume(resume)

const colors = {
  ink: '#1f2937',
  muted: '#596579',
  accent: '#0f766e',
  rule: '#cbd5e1',
}

const doc = new PDFDocument({
  autoFirstPage: false,
  bufferPages: true,
  compress: true,
  info: {
    Title: `${resume.basics.name} — Curriculum Vitae`,
    Author: resume.basics.name,
    Subject: resume.basics.label,
    Keywords: resume.skills.flatMap(skill => skill.keywords).join(', '),
    CreationDate: new Date('2000-01-01T00:00:00.000Z'),
    ModDate: new Date('2000-01-01T00:00:00.000Z'),
  },
  margins: { top: 28, right: 36, bottom: 28, left: 36 },
  size: 'LETTER',
})

const output = createWriteStream(outputPath)
doc.pipe(output)

let y = 0
const left = 36
const right = 576
const width = right - left
const bottom = 764

addPage(false)
drawHeader()
drawSummary()
drawSection('Work Experience')
for (const role of resume.work)
  drawEntry(role.name, role.position, role.location, dateRange(role), role.summary, role.url)

drawSection('Education')
for (const item of resume.education)
  drawEntry(item.institution, item.area, item.studyType, dateRange(item), item.summary, item.url)

drawSection('Projects')
for (const project of resume.projects) {
  const stack = `Tech Stack: ${project.keywords.join(', ')}`
  drawEntry(project.name, '', '', '', `${project.description}\n${stack}`, project.url)
}

drawSection('Skills')
for (const skill of resume.skills)
  drawLabelledLine(skill.name, skill.keywords.join(', '))

drawSection('Open Source Contributions')
drawContributions(resume.contributions)

const range = doc.bufferedPageRange()
for (let index = range.start; index < range.start + range.count; index++) {
  doc.switchToPage(index)
  doc.font('Helvetica').fontSize(6.5).fillColor(colors.muted)
  doc.text(`${resume.basics.name}  •  ${resume.basics.url}`, left, 756, { lineBreak: false })
  doc.text(`${index + 1} / ${range.count}`, left, 756, { align: 'right', lineBreak: false, width })
}

doc.end()

await new Promise((resolvePromise, reject) => {
  output.on('finish', resolvePromise)
  output.on('error', reject)
})

console.log(`Generated ${outputPath}`)

function validateResume(data) {
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

  if (errors.length)
    throw new Error(`Invalid resume.json:\n- ${errors.join('\n- ')}`)
}

function addPage(continued = true) {
  doc.addPage()
  y = 28

  if (continued) {
    doc.font('Helvetica-Bold').fontSize(9).fillColor(colors.ink)
    doc.text(`${resume.basics.name} — ${resume.basics.label}`, left, y, { width })
    y += 16
    doc.moveTo(left, y).lineTo(right, y).lineWidth(0.6).strokeColor(colors.rule).stroke()
    y += 8
  }
}

function ensureSpace(height) {
  if (y + height > bottom)
    addPage()
}

function drawHeader() {
  doc.font('Helvetica-Bold').fontSize(22).fillColor(colors.ink)
  doc.text(resume.basics.name, left, y, { align: 'center', width })
  y = doc.y + 1

  doc.font('Helvetica').fontSize(10).fillColor(colors.accent)
  doc.text(resume.basics.label, left, y, { align: 'center', width })
  y = doc.y + 6

  const location = [resume.basics.location.city, resume.basics.location.countryCode].filter(Boolean).join(', ')
  const contacts = [
    { text: resume.basics.email, link: `mailto:${resume.basics.email}` },
    { text: resume.basics.phone, link: `tel:${resume.basics.phone.replaceAll(' ', '')}` },
    { text: location },
    { text: displayUrl(resume.basics.url), link: resume.basics.url },
    ...resume.basics.profiles.map(profile => ({ text: profile.network, link: profile.url })),
  ]
  drawInlineLinks(contacts)
  y += 8
  doc.moveTo(left, y).lineTo(right, y).lineWidth(0.8).strokeColor(colors.accent).stroke()
  y += 7
}

function drawInlineLinks(items) {
  doc.font('Helvetica').fontSize(7.6)
  const separator = '  •  '
  const totalWidth = items.reduce((sum, item) => sum + doc.widthOfString(item.text), 0)
    + doc.widthOfString(separator) * (items.length - 1)
  let x = left + Math.max(0, (width - totalWidth) / 2)

  for (const [index, item] of items.entries()) {
    doc.fillColor(item.link ? colors.accent : colors.muted)
    doc.text(item.text, x, y, { link: item.link, lineBreak: false, underline: Boolean(item.link) })
    x += doc.widthOfString(item.text)
    if (index < items.length - 1) {
      doc.fillColor(colors.rule).text(separator, x, y, { lineBreak: false })
      x += doc.widthOfString(separator)
    }
  }
  y += 10
}

function drawSummary() {
  doc.font('Helvetica').fontSize(8.1).fillColor(colors.ink)
  doc.text(resume.basics.summary, left, y, { align: 'justify', lineGap: 0.8, width })
  y = doc.y + 2
}

function drawSection(title) {
  ensureSpace(24)
  y += 3
  doc.font('Helvetica-Bold').fontSize(10.5).fillColor(colors.ink)
  doc.text(title, left, y, { lineBreak: false })
  const titleWidth = doc.widthOfString(title)
  const lineY = y + 7
  doc.moveTo(left + titleWidth + 8, lineY).lineTo(right, lineY).lineWidth(0.6).strokeColor(colors.rule).stroke()
  y += 15
}

function drawEntry(title, subtitle, meta, dates, body, url) {
  doc.font('Helvetica').fontSize(7.8)
  const bodyHeight = doc.heightOfString(body, { lineGap: 0.5, width })
  ensureSpace(25 + bodyHeight)

  const startY = y
  doc.font('Helvetica-Bold').fontSize(8.7).fillColor(colors.ink)
  doc.text(title, left, y, { link: url, lineBreak: false, underline: Boolean(url) })
  if (dates) {
    doc.font('Helvetica').fontSize(7.5).fillColor(colors.muted)
    doc.text(dates, left, y, { align: 'right', lineBreak: false, width })
  }
  y = startY + 10.5

  if (subtitle || meta) {
    doc.font('Helvetica-Oblique').fontSize(7.5).fillColor(colors.muted)
    doc.text(subtitle, left, y, { lineBreak: false })
    doc.text(meta, left, y, { align: 'right', lineBreak: false, width })
    y += 9.5
  }

  doc.font('Helvetica').fontSize(7.8).fillColor(colors.ink)
  doc.text(body, left, y, { lineGap: 0.5, width })
  y = doc.y + 4
}

function drawLabelledLine(label, text) {
  doc.font('Helvetica').fontSize(7.6)
  const labelText = `${label}: `
  const labelWidth = doc.widthOfString(labelText)
  const height = doc.heightOfString(text, { width: width - labelWidth })
  ensureSpace(height + 4)

  doc.font('Helvetica-Bold').fillColor(colors.ink).text(labelText, left, y, { continued: true, lineBreak: false })
  doc.font('Helvetica').text(text, { width: width - labelWidth })
  y = doc.y + 2
}

function drawContributions(items) {
  const gap = 18
  const columnWidth = (width - gap) / 2
  const rowHeight = 12
  ensureSpace(Math.ceil(items.length / 2) * rowHeight)

  items.forEach((item, index) => {
    const column = index % 2
    const row = Math.floor(index / 2)
    const x = left + column * (columnWidth + gap)
    doc.font('Helvetica').fontSize(7.6).fillColor(colors.accent)
    doc.text(item.name, x, y + row * rowHeight, {
      link: item.url,
      lineBreak: false,
      underline: true,
      width: columnWidth,
    })
  })
  y += Math.ceil(items.length / 2) * rowHeight
}

function dateRange(item) {
  if (!item.startDate && !item.endDate)
    return ''

  return [formatDate(item.startDate), item.endDate ? formatDate(item.endDate) : 'Present']
    .filter(Boolean)
    .join(' – ')
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

function displayUrl(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}
