import { createWriteStream, existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import PDFDocument from 'pdfkit'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = resolve(root, 'resume.json')
const outputPath = resolve(root, 'public/cv.pdf')
const resume = JSON.parse(readFileSync(sourcePath, 'utf8'))

validateResume(resume)

const profileImage = resume.basics.image
  ? await sharp(resolve(root, resume.basics.image))
    .resize(256, 256, { fit: 'cover', position: 'centre' })
    .jpeg({ chromaSubsampling: '4:4:4', quality: 88 })
    .toBuffer()
  : null

const colors = {
  ink: '#111111',
  accent: '#0093b8',
  link: '#075fd5',
}

const doc = new PDFDocument({
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

const left = 18
const right = 594
const width = right - left
const bottom = 774
let y = 0

addPage(false)
drawHeader()
drawSummary()

drawSection('Work Experience')
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
    dates: dateRange(item),
    meta: item.studyType,
    subtitle: item.area,
    title: item.institution,
    url: item.url,
  })
}

drawSection('Projects')
for (const project of resume.projects)
  drawProject(project)

drawSection('Skills')
for (const skill of resume.skills)
  drawSkill(skill)

drawSection('Open Source Contribution')
drawContributions(resume.contributions)

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

  if (data.basics?.image && !existsSync(resolve(root, data.basics.image)))
    errors.push(`basics.image does not exist: ${data.basics.image}`)

  if (errors.length)
    throw new Error(`Invalid resume.json:\n- ${errors.join('\n- ')}`)
}

function addPage(continued = true) {
  doc.addPage()
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

  const location = [resume.basics.location.city, resume.basics.location.countryCode].filter(Boolean).join(', ')
  const profiles = Object.fromEntries(resume.basics.profiles.map(profile => [profile.network, profile]))
  const contacts = [
    { icon: 'email', link: `mailto:${resume.basics.email}`, text: resume.basics.email },
    { icon: 'phone', link: `tel:${resume.basics.phone.replaceAll(' ', '')}`, text: resume.basics.phone },
    { icon: 'location', text: location },
    { icon: 'website', link: resume.basics.url, text: displayUrl(resume.basics.url) },
    { icon: 'github', link: profiles.GitHub?.url },
    { icon: 'linkedin', link: profiles.LinkedIn?.url },
    { icon: 'x', link: profiles.X?.url },
    { icon: 'codepen', link: profiles.CodePen?.url },
  ]

  drawContactRow(contacts, 65, photoX - 14)
  y = 88
  doc.moveTo(left, y).lineTo(right, y).lineWidth(0.8).strokeColor(colors.accent).stroke()
  y += 7
}

function drawContactRow(items, rowY, maxX) {
  doc.font('Helvetica').fontSize(8.7)
  let x = left

  for (const [index, item] of items.entries()) {
    const iconWidth = 10
    const textWidth = item.text ? doc.widthOfString(item.text) : 0
    const itemWidth = iconWidth + (item.text ? 4 + textWidth : 2)
    if (x + itemWidth > maxX)
      break

    const itemX = x
    drawContactIcon(item.icon, x, rowY + 1)
    x += iconWidth

    if (item.text) {
      x += 3
      doc.fillColor(item.link ? colors.link : colors.ink)
      doc.text(item.text, x, rowY, {
        lineBreak: false,
        underline: Boolean(item.link),
      })
      x += textWidth
    }

    if (item.link)
      doc.link(itemX - 1, rowY - 1, itemWidth + 2, 11, item.link)

    if (index < items.length - 1) {
      x += 7
      doc.moveTo(x, rowY - 1).lineTo(x, rowY + 10).lineWidth(0.55).strokeColor(colors.accent).stroke()
      x += 7
    }
  }
}

function drawContactIcon(type, x, iconY) {
  const centerY = iconY + 4
  doc.save().lineWidth(0.65).strokeColor(colors.accent).fillColor(colors.accent)

  if (type === 'email') {
    doc.rect(x, iconY, 8.5, 6.5).stroke()
    doc.moveTo(x, iconY).lineTo(x + 4.25, iconY + 3.5).lineTo(x + 8.5, iconY).stroke()
  }
  else if (type === 'phone') {
    doc.path(`M${x + 1},${iconY} C${x},${iconY + 1.5} ${x + 1.5},${iconY + 5.8} ${x + 6.6},${iconY + 8} C${x + 7.8},${iconY + 8.4} ${x + 8.8},${iconY + 7.2} ${x + 8},${iconY + 6.2} L${x + 6.5},${iconY + 5.2} C${x + 5.8},${iconY + 4.9} ${x + 5.4},${iconY + 6} ${x + 4.7},${iconY + 5.5} C${x + 3.4},${iconY + 4.7} ${x + 2.8},${iconY + 3.8} ${x + 2.4},${iconY + 2.9} C${x + 2.1},${iconY + 2.2} ${x + 3},${iconY + 1.8} ${x + 2.6},${iconY + 1.1} Z`).stroke()
  }
  else if (type === 'location') {
    doc.circle(x + 4.2, iconY + 3.4, 2.8).stroke()
    doc.circle(x + 4.2, iconY + 3.4, 0.8).fill()
    doc.moveTo(x + 1.8, iconY + 4.7).lineTo(x + 4.2, iconY + 8.3).lineTo(x + 6.6, iconY + 4.7).stroke()
  }
  else if (type === 'website') {
    doc.circle(x + 4.3, centerY, 4).stroke()
    doc.ellipse(x + 4.3, centerY, 1.8, 4).stroke()
    doc.moveTo(x + 0.5, centerY).lineTo(x + 8.1, centerY).stroke()
  }
  else if (type === 'linkedin') {
    doc.rect(x + 0.5, iconY, 7.5, 7.5).stroke()
    doc.font('Helvetica-Bold').fontSize(5.5).text('in', x + 2.1, iconY + 1.1, { lineBreak: false })
  }
  else if (type === 'x') {
    doc.font('Helvetica').fontSize(8).text('X', x + 1.4, iconY - 0.5, { lineBreak: false })
  }
  else if (type === 'codepen') {
    doc.moveTo(x + 4.2, iconY).lineTo(x + 8, iconY + 2.3).lineTo(x + 8, iconY + 5.7)
      .lineTo(x + 4.2, iconY + 8).lineTo(x + 0.4, iconY + 5.7).lineTo(x + 0.4, iconY + 2.3).closePath().stroke()
    doc.moveTo(x + 0.5, iconY + 2.4).lineTo(x + 4.2, iconY + 4.6).lineTo(x + 7.9, iconY + 2.4).stroke()
  }
  else {
    doc.circle(x + 4.2, centerY, 4).stroke()
    doc.font('Helvetica-Bold').fontSize(4.8).text('GH', x + 1.1, iconY + 1.4, { lineBreak: false })
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
  y += 4
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
  y = doc.y + 5
}

function drawProject(project) {
  const stack = `Tech Stack: ${project.keywords.join(', ')}`
  const descriptionHeight = textHeight(project.description, 'Helvetica', 9.3, width, 0.45)
  const stackHeight = textHeight(stack, 'Helvetica', 9.3, width, 0.3)
  ensureSpace(12 + descriptionHeight + stackHeight + 7)

  doc.font('Helvetica').fontSize(9.3).fillColor(colors.link)
  doc.text(project.name, left, y, {
    link: project.url,
    lineBreak: false,
    underline: Boolean(project.url),
  })
  y += 11

  doc.font('Helvetica').fontSize(9.3).fillColor(colors.ink)
  doc.text(project.description, left, y, { lineGap: 0.45, width })
  y = doc.y + 4
  doc.text(stack, left, y, { lineGap: 0.3, width })
  y = doc.y + 6
}

function drawSkill(skill) {
  doc.font('Helvetica').fontSize(9.3)
  const label = `${skill.name}: `
  const value = skill.keywords.join(', ')
  const line = `${label}${value}`
  const height = doc.heightOfString(line, { lineGap: 0.2, width })
  ensureSpace(height + 2)

  doc.fillColor(colors.ink).text(line, left, y, { lineGap: 0.2, width })
  y = doc.y + 1
}

function drawContributions(items) {
  const gap = 18
  const columnWidth = (width - gap) / 2
  const rowHeight = 15
  ensureSpace(Math.ceil(items.length / 2) * rowHeight)

  items.forEach((item, index) => {
    const column = index % 2
    const row = Math.floor(index / 2)
    const x = left + column * (columnWidth + gap)
    const separator = item.name.indexOf(':')
    const prefix = separator >= 0 ? item.name.slice(0, separator + 1) : item.name
    const description = separator >= 0 ? item.name.slice(separator + 1) : ''

    doc.font('Helvetica').fontSize(9.3).fillColor(colors.link)
    doc.text(prefix, x, y + row * rowHeight, {
      continued: true,
      link: item.url,
      lineBreak: false,
      underline: true,
      width: columnWidth,
    })
    doc.fillColor(colors.ink).text(description, {
      link: null,
      lineBreak: false,
      underline: false,
    })
  })

  y += Math.ceil(items.length / 2) * rowHeight
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

function displayUrl(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}
