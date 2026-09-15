// A bounded, text-only comparison workbook. No API, temporary runtime or network dependency.
const encoder = new TextEncoder()
const xml = (value: string) => value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return (crc ^ 0xffffffff) >>> 0
}

function storedZip(files: Record<string, string>) {
  const entries = Object.entries(files).map(([name, content]) => ({ name: encoder.encode(name), data: encoder.encode(content) }))
  const size = entries.reduce((sum, file) => sum + 30 + file.name.length + file.data.length + 46 + file.name.length, 22)
  const bytes = new Uint8Array(size)
  const view = new DataView(bytes.buffer)
  let offset = 0
  const records: { file: typeof entries[number]; start: number; crc: number }[] = []
  for (const file of entries) {
    const start = offset
    const crc = crc32(file.data)
    view.setUint32(offset, 0x04034b50, true)
    view.setUint16(offset + 4, 20, true)
    view.setUint32(offset + 14, crc, true)
    view.setUint32(offset + 18, file.data.length, true)
    view.setUint32(offset + 22, file.data.length, true)
    view.setUint16(offset + 26, file.name.length, true)
    bytes.set(file.name, offset + 30)
    bytes.set(file.data, offset + 30 + file.name.length)
    offset += 30 + file.name.length + file.data.length
    records.push({ file, start, crc })
  }
  const directoryStart = offset
  for (const { file, start, crc } of records) {
    view.setUint32(offset, 0x02014b50, true)
    view.setUint16(offset + 4, 20, true)
    view.setUint16(offset + 6, 20, true)
    view.setUint32(offset + 16, crc, true)
    view.setUint32(offset + 20, file.data.length, true)
    view.setUint32(offset + 24, file.data.length, true)
    view.setUint16(offset + 28, file.name.length, true)
    view.setUint32(offset + 42, start, true)
    bytes.set(file.name, offset + 46)
    offset += 46 + file.name.length
  }
  view.setUint32(offset, 0x06054b50, true)
  view.setUint16(offset + 8, entries.length, true)
  view.setUint16(offset + 10, entries.length, true)
  view.setUint32(offset + 12, offset - directoryStart, true)
  view.setUint32(offset + 16, directoryStart, true)
  return bytes
}

export function buildComparisonXlsx(headers: string[], rows: string[][]): Uint8Array<ArrayBuffer> {
  if (headers.length < 2 || headers.length > 4 || rows.length > 100 || rows.some(row => row.length !== headers.length)) {
    throw new Error('비교표는 1–3개 제품, 최대 100개 항목을 지원합니다.')
  }
  if ([headers, ...rows].some(row => row.some(cell => typeof cell !== 'string' || cell.length > 32767))) throw new Error('잘못된 비교표 값입니다.')
  const lastColumn = String.fromCharCode(64 + headers.length)
  const cell = (value: string, column: number, row: number, style: number) =>
    `<c r="${String.fromCharCode(65 + column)}${row}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${xml(value)}</t></is></c>`
  const data = [
    `<row r="1" ht="38" customHeight="1">${cell('선택 모델 비교', 0, 1, 2)}</row>`,
    ...[headers, ...rows].map((values, index) => `<row r="${index + 3}" ht="${index ? 76 : 40}" customHeight="1">${values.map((value, column) => cell(value, column, index + 3, index ? 0 : 1)).join('')}</row>`),
  ].join('')
  return storedZip({
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
    '_rels/.rels': '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    'xl/workbook.xml': '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="선택 모델 비교" sheetId="1" r:id="rId1"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels': '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
    'xl/styles.xml': '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Malgun Gothic"/><color rgb="FF000000"/></font><font><b/><sz val="12"/><name val="Malgun Gothic"/><color rgb="FF000000"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF00F629"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left style="thick"><color rgb="FF000000"/></left><right style="thick"><color rgb="FF000000"/></right><top style="thick"><color rgb="FF000000"/></top><bottom style="thick"><color rgb="FF000000"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>',
    'xl/worksheets/sheet1.xml': `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="3" topLeftCell="A4" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="1" width="30" customWidth="1"/><col min="2" max="${headers.length}" width="52" customWidth="1"/></cols><sheetData>${data}</sheetData><mergeCells count="1"><mergeCell ref="A1:${lastColumn}1"/></mergeCells></worksheet>`,
  })
}
