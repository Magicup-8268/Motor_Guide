import test from 'node:test'
import assert from 'node:assert/strict'
import { performance } from 'node:perf_hooks'
import { createServer } from 'vite'

test('project snapshots validate, round-trip, merge without overwrites and bound untrusted files', async () => {
  const vite = await createServer({ appType: 'custom', server: { middlewareMode: true, hmr: false } })
  try {
    const { validateProject, parseProjectFile, serializeProjects, mergeProjects } = await vite.ssrLoadModule('/src/utils/projectSelections.ts')
    const conditions = { query: '750W', activeBrandId:'kinco', categoryId:'all', familyId:'all', robotisLineup:'current', powerFloor:0,
      ratedPowerFilter:{mode:'exact',from:'750',to:''}, allBrands:true, resultBrand:'all', operatingPoint:{enabled:false,speed:'',torque:'',includeUnknown:true}, directoryVoltage:'48v',directoryProtocol:'ethercat' }
    const p = { id:'saved-1', name:'이송축', note:'검토 메모 <script>literal</script>', savedAt:'2026-09-15T12:00:00.000Z', conditions,
      models:[{id:'kinco-sample',model:'검증용 모터',brand:'Kinco',drive:'family:model'}] }
    assert.deepEqual(parseProjectFile(serializeProjects([p])), [p])
    assert.equal(validateProject({...p,models:[]}).models.length,0)
    const merged = mergeProjects([p], [{...p,note:'overwrite attempt'},{...p,id:'saved-2'}])
    assert.equal(merged.added,1); assert.equal(merged.skipped,1); assert.equal(merged.projects[1].note,p.note)
    const file = projects => JSON.stringify({format:'magicup-selection-projects',version:1,projects})
    for (const bad of ['', 'null', '[]', '{}', file([p,p]), file([{...p,models:[...p.models,...p.models]}]), file([{...p,id:'__proto__'}]), file([{...p,models:[{...p.models[0],id:'constructor'}]}]), file([{...p,name:' '}]), file([{...p,note:'x'.repeat(2001)}]), file([{...p,savedAt:'invalid'}]), file([{...p,conditions:{...conditions,directoryVoltage:'240v'}}]), file([{...p,conditions:{...conditions,allBrands:'yes'}}]), file([{...p,conditions:{...conditions,ratedPowerFilter:{mode:'range',from:'750',to:'100'}}}]), file([{...p,conditions:{...conditions,operatingPoint:{enabled:true,speed:'-1',torque:'1',includeUnknown:true}}}]), ' '.repeat(2097153)]) {
      assert.throws(() => parseProjectFile(bad))
    }
    const hundred = Array.from({length:100}, (_,i)=>({...p,id:`project-${i}`,note:'메모'.repeat(1000)}))
    assert.throws(()=>mergeProjects(hundred,[p]))
    const unknown = {...p,models:[{...p.models[0],id:'catalog-removed-model'}]}
    assert.equal(parseProjectFile(file([unknown]))[0].models[0].id,'catalog-removed-model')
    const serialized=serializeProjects(hundred), start=performance.now()
    for(let i=0;i<300;i++)parseProjectFile(serialized)
    console.log('R06 100 full-note records bytes:',new TextEncoder().encode(serialized).length,'300 parses ms:',performance.now()-start)
  } finally { await vite.close() }
})
