import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { writeFile } from 'node:fs/promises'

test('exact selections, numeric search, brake comparison and offline XLSX', async () => {
  const vite = await createServer({ appType: 'custom', server: { middlewareMode: true } })
  try {
    const selections = await vite.ssrLoadModule('/src/data/productSelections.ts')
    const filters = await vite.ssrLoadModule('/src/utils/selectionFilters.ts')
    const { matchesQuery, comparisonRowsFor } = await vite.ssrLoadModule('/src/App.tsx')
    const { buildComparisonXlsx } = await vite.ssrLoadModule('/src/utils/comparisonXlsx.ts')
    const { checkedDocument } = await vite.ssrLoadModule('/vite.config.ts')
    await assert.rejects(checkedDocument(new Response('<html>Access denied</html>')))
    await assert.rejects(checkedDocument(new Response('x', {headers:{'content-length':String(129*1024*1024)}})))
    assert.equal((await checkedDocument(new Response('%PDF-1.7 test'))).length, 13)
    const products = selections.selectionProducts
    assert.equal(products.length, 303)
    assert.equal(new Set(products.map(p => p.id)).size, products.length)
    const fastech = products.filter(p => p.brand === 'FASTECH')
    assert.equal(fastech.length, 53)
    for (const product of fastech) {
      assert.equal(selections.resolveProduct(product.id), product)
      assert.deepEqual(selections.expandProducts([product]), [product])
      const restored = new URL(`http://localhost/?model=${encodeURIComponent(product.id)}`).searchParams.get('model')
      assert.equal(selections.resolveProduct(restored).model, product.model)
      const voltage = product.specs.ratedVoltage
      if (/^24\s*VDC/.test(voltage)) assert.equal(filters.supportsSelectionVoltage(product, '48v'), false, product.model)
      if (/^48\s*VDC/.test(voltage)) assert.equal(filters.supportsSelectionVoltage(product, '24v'), false, product.model)
    }
    const fixture = value => ({ ...products[0], model: 'test', summary: '', tags: [], features: [], specs: { ratedTorque: value } })
    assert.deepEqual(matchesQuery([fixture(1), fixture(10), fixture(0.1)], '1.0 Nm').map(p => p.specs.ratedTorque), [1])
    const powerFixture = value => ({ ...fixture(0), specs: { ratedPower: value } })
    assert.deepEqual(matchesQuery([powerFixture(50), powerFixture(750), powerFixture(1050)], '50 w').map(p => p.specs.ratedPower), [50])
    assert.equal(matchesQuery([powerFixture(1000)], '1 kW').length, 1)
    assert.equal(matchesQuery([powerFixture(1000)], '1,000 W').length, 1)
    const rs = fastech.find(p => p.specs.protocols.includes('RS-485'))
    assert.equal(matchesQuery([rs], 'RS485').length, 1)
    const steppers = products.filter(p => p.brand === 'Kinco' && p.categoryId === 'stepper')
    assert.equal(steppers.length, 20)
    assert.ok(steppers.every(p => filters.selectionCapabilityValue(p) > 0))
    const brakes = products.filter(p => p.categoryId === 'brake')
    for (const brake of brakes) {
      const rows = comparisonRowsFor([brake])
      assert.ok(rows.some(r => r.label.includes('정지 마찰') && r.values[0].includes('Nm')))
      assert.ok(rows.some(r => r.label.startsWith('전류') && r.values[0].includes('A')))
    }
    const sample = [fastech[0], brakes[0]]
    const rows = comparisonRowsFor(sample).map(r => [r.label, ...r.values])
    const bytes = buildComparisonXlsx(['항목', ...sample.map(p => p.model)], rows)
    assert.deepEqual([...bytes.slice(0, 4)], [80, 75, 3, 4])
    assert.throws(() => buildComparisonXlsx([], []))
    assert.throws(() => buildComparisonXlsx(['항목','a','b','c','d'], []))
    await writeFile('OUTPUT/comparison_test_20260915_R01.xlsx', bytes)
    const start = performance.now()
    for (let i = 0; i < 300; i++) matchesQuery(products, '24V RS485')
    console.log(`303 products; 300 searches: ${(performance.now()-start).toFixed(1)} ms; XLSX: ${bytes.length} bytes`)
  } finally { await vite.close() }
})
