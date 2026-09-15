import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

test('maxon highlight follows confirmed ROBOTIS models, never all coreless motors', async () => {
  const vite = await createServer({appType:'custom',server:{middlewareMode:true}})
  try {
    const { maxonSourceFor } = await vite.ssrLoadModule('/src/data/motorManufacturer.ts')
    const { motors } = await vite.ssrLoadModule('/src/data/motors.ts')
    const { comparisonRowsFor } = await vite.ssrLoadModule('/src/App.tsx')
    const hits = motors.filter(maxonSourceFor)
    assert.equal(hits.length, 19)
    for (const model of ['XH430-V350-R','XD540-T270-R','XW540-T260-R','MX-28T/R','MX-64T/R','MX-106T/R']) {
      const product = motors.find(p => p.model === model)
      assert.ok(product && maxonSourceFor(product), model)
      assert.ok(comparisonRowsFor([product]).some(row => row.label === '내장 모터 제조사' && row.values[0].includes('maxon')))
    }
    for (const model of ['MX-12W','XM430-W350-T/R','XC330-T181-T','XL330-M288-T','PH54-200-S500-R','XH999-W999-R']) {
      assert.equal(maxonSourceFor({brand:'ROBOTIS',model}), undefined, model)
    }
    assert.equal(maxonSourceFor({brand:'Kinco',model:'XH430-V350-R'}),undefined)
    console.log('maxon verified catalogue entries:', hits.map(p=>p.model).join(', '))
  } finally { await vite.close() }
})
