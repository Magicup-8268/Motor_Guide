import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('expanded comparison reuses the table, bounds text size, and restores scrolling', async () => {
  const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const css = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8')
  assert.match(app, /dialog\.showModal\(\)/)
  assert.match(app, /document\.body\.style\.overflow = previousOverflow/)
  assert.match(app, /Math\.max\(16, size - 2\)/)
  assert.match(app, /Math\.min\(28, size \+ 2\)/)
  assert.match(app, /onCancel=\{\(\) => setExpanded\(false\)\}/)
  assert.equal((app.match(/<table className="compare-table"/g) || []).length, 1)
  assert.match(css, /\.compare-tray-expanded \.compare-table thead th \{ position: sticky; top: 0/)
  assert.match(css, /tbody th \{ position: sticky; left: 0/)
})
