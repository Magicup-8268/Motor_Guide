import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

test('maxon highlight includes every officially identified catalogue motor with its published type', async () => {
  const vite = await createServer({appType:'custom',server:{middlewareMode:true}})
  try {
    const { maxonMotorFor } = await vite.ssrLoadModule('/src/data/motorManufacturer.ts')
    const { motors } = await vite.ssrLoadModule('/src/data/motors.ts')
    const { comparisonRowsFor } = await vite.ssrLoadModule('/src/App.tsx')
    const hits = motors.filter(maxonMotorFor)
    assert.equal(hits.length, 29)
    for (const model of ['XH430-V350-R','XD540-T270-R','XW540-T260-R','MX-28T/R','MX-64T/R','MX-106T/R']) {
      const product = motors.find(p => p.model === model)
      assert.equal(maxonMotorFor(product)?.type, '코어리스', model)
    }
    for (const [model, type] of [
      ['PH54-200-S500-R', 'BLDC'], ['PH54-100-S500-R', 'BLDC'],
      ['PH42-020-S300-R', '코어리스'],
      ['PM54-060-S250-R', 'BLDC'], ['PM54-040-S250-R', 'BLDC'],
      ['PM42-010-S260-R', '코어리스'],
      ['H54-200-S500-R', 'BLDC'],
    ]) {
      const product = motors.find(p => p.model === model)
      const motor = product && maxonMotorFor(product)
      assert.equal(motor?.type, type, model)
      assert.ok(motor?.sourceUrl.startsWith('https://emanual.robotis.com/docs/en/dxl/'), model)
      assert.ok(comparisonRowsFor([product]).some(row => row.label === '내장 모터 제조사' && row.values[0].includes(type)), model)
    }
    for (const model of ['EX-106+', 'RX-28', 'RX-64']) {
      const product = motors.find(p => p.model === model)
      const motor = product && maxonMotorFor(product)
      assert.equal(motor?.type, '코어리스', model)
      assert.ok(motor?.sourceUrl.startsWith('https://emanual.robotis.com/docs/kr/dxl/'), model)
      assert.ok(comparisonRowsFor([product]).some(row => row.label === '내장 모터 제조사' && row.values[0].includes('코어리스')), model)
    }
    for (const model of ['MX-12W','XM430-W350-T/R','XC330-T181-T','XL330-M288-T','L54-50-S500-R','YM070-210-M001-RH','RX-10','RX-24F','XH999-W999-R']) {
      assert.equal(maxonMotorFor({brand:'ROBOTIS',model}), undefined, model)
    }
    assert.equal(maxonMotorFor({brand:'Kinco',model:'XH430-V350-R'}),undefined)
    console.log('maxon verified catalogue entries:', hits.map(p=>p.model).join(', '))
  } finally { await vite.close() }
})
