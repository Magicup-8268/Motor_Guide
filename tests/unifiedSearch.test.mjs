import test from 'node:test'
import assert from 'node:assert/strict'
import { performance } from 'node:perf_hooks'
import { createServer } from 'vite'

test('unified manufacturers and operating point screening never certify stall/holding/aggregate data', async () => {
  const vite = await createServer({ appType: 'custom', server: { middlewareMode: true } })
  try {
    const { operatingPointStatus: status, matchesOperatingPoint: match, operatingPointError } = await vite.ssrLoadModule('/src/utils/operatingPoint.ts')
    const { filterDirectoryProducts: filter } = await vite.ssrLoadModule('/src/App.tsx')
    const { selectionProducts: products } = await vite.ssrLoadModule('/src/data/productSelections.ts')
    const point = { enabled: true, speed: '25', torque: '1', includeUnknown: true }
    const p = specs => ({ categoryId: 'ac-servo', specs })
    assert.equal(status(p({ ratedSpeed: 25, ratedTorque: 1 }), point).status, 'candidate')
    assert.equal(status(p({ ratedSpeed: 3000, ratedTorque: 2, ratedPowerOptions: [400,750] }), point).status, 'review')
    assert.equal(status(p({ maxSpeed: 20 }), point).status, 'excluded')
    assert.equal(status(p({ maxTorque: 0.5 }), point).status, 'excluded')
    assert.equal(status(p({ maxSpeed: 20, maxSpeedText: '20 rpm (12V), 30 rpm (24V)' }), point).status, 'review')
    assert.equal(status(p({ ratedSpeed: 30, ratedTorque: 10, torqueBasis: '스톨 토크' }), point).status, 'review')
    assert.equal(status({ categoryId: 'stepper', specs: { holdingTorque: 10, maxSpeed: 3000 } }, point).status, 'review')
    assert.equal(match(p({}), { ...point, includeUnknown: false }), false)
    assert.equal(match({categoryId:'brake',specs:{}}, point), false)
    for (const speed of ['', '0', '-25', 'Infinity', 'bad']) {
      assert.ok(operatingPointError({ ...point, speed })); assert.equal(match(p({}), { ...point, speed }), false)
    }
    const xm = products.find(p=>p.model==='XM540-W270-T')
    assert.ok(xm); assert.equal(status(xm, point).status, 'review')
    const c = { categoryId:'all',familyId:'all',usesTorque:false,powerFloor:0,ratedPowerFilter:{mode:'all',from:'',to:''},directoryVoltage:'all',directoryProtocol:'all',operatingPoint:{...point,enabled:false},query:'' }
    assert.equal(filter(products,c).length,303)
    assert.equal(new Set(filter(products,c).map(p=>p.brand)).size,6)
    const watts = filter(products,{...c,ratedPowerFilter:{mode:'exact',from:'100',to:''}})
    assert.ok(new Set(watts.map(p=>p.brand)).size>=2)
    const restricted = filter(products,{...c,operatingPoint:{...point,includeUnknown:false}})
    assert.ok(restricted.length>0)
    assert.ok(restricted.every(p=>status(p,point).status==='candidate'))
    const start=performance.now()
    for(let i=0;i<3000;i++)filter(products,{...c,operatingPoint:point})
    console.log('R04 303 products x 3000 searches ms:',performance.now()-start,'rated candidates:',restricted.length,'100W:',watts.length)
  } finally {await vite.close()}
})
