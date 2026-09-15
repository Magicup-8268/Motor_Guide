import test from 'node:test'
import assert from 'node:assert/strict'
import { performance } from 'node:perf_hooks'
import { createServer } from 'vite'

test('rated W filters: exact, inclusive range, minimum, unknown, invalid and catalogue scan', async () => {
  const vite = await createServer({ appType: 'custom', server: { middlewareMode: true } })
  try {
    const { matchesRatedPower: match, matchingRatedPowers, powerFilterError } = await vite.ssrLoadModule('/src/data/ratedPowerFilter.ts')
    const { selectionProducts } = await vite.ssrLoadModule('/src/data/productSelections.ts')
    const series = { categoryId: 'integrated', specs: { ratedPowerOptions: [400, 750, 1000] } }
    const filter = (mode, from = '', to = '') => ({ mode, from, to })
    assert.equal(match(series, filter('exact', '500')), false)
    assert.equal(match(series, filter('exact', '750')), true)
    assert.deepEqual(matchingRatedPowers(series, filter('range', '400', '750')), [400, 750])
    assert.equal(match(series, filter('minimum', '1000')), true)
    assert.equal(match(series, filter('minimum', '1001')), false)
    assert.equal(match({ categoryId: 'stepper', specs: { ratedPower: 12.5 } }, filter('exact', '12.5')), true)
    const unpublished = { categoryId: 'integrated', specs: { selectionMaxPower: 1000, powerRange: '100–1000W', ratedVoltage: '24V', ratedCurrent: 10, maxTorque: 10 } }
    assert.equal(match(unpublished, filter('exact', '240')), false)
    assert.equal(match(unpublished, filter('minimum', '100')), false)
    assert.equal(match(unpublished, filter('unknown')), true)
    assert.equal(match({ categoryId: 'brake', specs: { ratedPower: 50 } }, filter('unknown')), false)
    for (const f of [filter('exact'), filter('exact', '-1'), filter('exact', '0'), filter('minimum', 'Infinity'), filter('range', '750', '400'), filter('range', '100')]) {
      assert.ok(powerFilterError(f)); assert.equal(match(series, f), false)
    }
    const start = performance.now()
    for (let i = 0; i < 3000; i++) selectionProducts.filter(p => match(p, filter('range', '100', '750')))
    console.log('Catalogue:', selectionProducts.length, '3000 scans ms:', performance.now() - start)
    for (const brand of new Set(selectionProducts.map(p => p.brand))) {
      const products = selectionProducts.filter(p => p.brand === brand)
      assert.equal(products.filter(p => match(p, filter('all'))).length, products.length)
      console.log(brand, 'exact400:', products.filter(p => match(p, filter('exact', '400'))).length, 'unknown:', products.filter(p => match(p, filter('unknown'))).length)
    }
  } finally { await vite.close() }
})
