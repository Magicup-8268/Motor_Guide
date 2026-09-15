import { useEffect, useRef, useState } from 'react'
import { resolveProduct } from '../data/productSelections'
import { brandCatalogs } from '../data/motors'
import { mergeProjects, parseProjectFile, projectFileLimit, projectLimit, projectStorageKey, serializeProjects, validateProject, type ProjectConditions, type SelectionProject } from '../utils/projectSelections'

function readProjects() {
  const raw = localStorage.getItem(projectStorageKey)
  return raw ? parseProjectFile(raw) : []
}
function errorText(error: unknown) { return error instanceof Error ? error.message : '저장 공간 또는 파일 접근을 확인하세요.' }
function conditionSummary(c: ProjectConditions) {
  const modes = { all: '전체', exact: '정확히', range: '범위', minimum: '이상', unknown: '미공개' }
  const watts = c.ratedPowerFilter
  const protocolNames = { all:'전체', ethercat:'EtherCAT',canopen:'CANopen',modbus:'Modbus RTU',profinet:'Profinet',pulse:'Pulse / I/O',ttl:'TTL',rs485:'RS-485',uart:'UART' }
  return `정격 출력: ${modes[watts.mode]}${['all','unknown'].includes(watts.mode) ? '' : ` ${watts.from}${watts.mode === 'range' ? `–${watts.to}` : ''} W`} · 전원: ${c.directoryVoltage === 'all' ? '전체' : c.directoryVoltage === '220v' ? '220 V AC' : c.directoryVoltage.replace('v',' V DC')} · 통신: ${protocolNames[c.directoryProtocol]}${c.operatingPoint.enabled ? ` · ${c.operatingPoint.speed} rpm / 연속 ${c.operatingPoint.torque} Nm (예비 검토)` : ''}`
}

export function ProjectShelf({ conditions, models, onRestore }: { conditions: ProjectConditions; models: SelectionProject['models']; onRestore: (project: SelectionProject) => string }) {
  const [initial] = useState(() => { try { return { projects: readProjects(), error: '' } } catch(error) { return { projects: [], error: `기존 저장 자료를 읽지 못했습니다. 덮어쓰지 않습니다. ${errorText(error)}` } } })
  const [projects, setProjects] = useState<SelectionProject[]>(initial.projects)
  const [name, setName] = useState(''), [note, setNote] = useState(''), [message, setMessage] = useState(initial.error)
  const [deleteId, setDeleteId] = useState<string | null>(null), [busy, setBusy] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const shelf = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    const openFromHash = () => { if (location.hash === '#projects' && shelf.current) shelf.current.open = true }
    const sync = (event: StorageEvent) => { if (event.key === projectStorageKey || event.key === null) { try { setProjects(readProjects()) } catch(error) { setMessage(errorText(error)) } } }
    openFromHash(); window.addEventListener('hashchange', openFromHash); window.addEventListener('storage', sync)
    return () => { window.removeEventListener('hashchange', openFromHash); window.removeEventListener('storage', sync) }
  }, [])
  // ponytail: bounded local snapshots (100); no account/server sync. File backup transfers between devices.
  function commit(change: (current: SelectionProject[]) => SelectionProject[]) {
    const next = change(readProjects())
    localStorage.setItem(projectStorageKey, serializeProjects(next))
    setProjects(next)
  }
  function save() {
    try {
      const project = validateProject({ id: `project-${Date.now()}-${Math.random().toString(36).slice(2)}`, name, note, savedAt: new Date().toISOString(), conditions, models })
      commit(current => mergeProjects(current, [project]).projects)
      setMessage(`“${project.name}” 새 기록 저장 완료 · ${models.length}개 제품. 기존 기록은 유지됩니다.`)
    } catch(error) { setMessage(`저장하지 못했습니다. ${errorText(error)}`) }
  }
  function backup() {
    try {
      const raw = serializeProjects(readProjects())
      const url = URL.createObjectURL(new Blob([raw], { type: 'application/json;charset=utf-8' }))
      const link = document.createElement('a')
      link.href = url; link.download = `Magicup-Projects-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
      document.body.append(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
      setMessage('백업 다운로드를 요청했습니다. 메모가 포함된 파일이므로 안전하게 보관하세요.')
    } catch(error) { setMessage(`백업 실패: ${errorText(error)}`) }
  }
  async function restoreFile(file: File) {
    setBusy(true)
    try {
      if (file.size > projectFileLimit) throw new Error('파일 크기는 2 MB 이하여야 합니다.')
      const incoming = parseProjectFile(await file.text())
      let added = 0, skipped = 0
      commit(current => { const result = mergeProjects(current, incoming); added = result.added; skipped = result.skipped; return result.projects })
      setMessage(`복원 완료: ${added}개 추가, 같은 ID ${skipped}개 건너뜀. 기존 기록은 덮어쓰지 않았습니다.`)
    } catch(error) { setMessage(`복원하지 못했습니다. 기존 자료는 유지됩니다. ${errorText(error)}`) }
    finally { setBusy(false); if (fileInput.current) fileInput.current.value = '' }
  }
  return <details className="project-shelf" id="projects" ref={shelf}>
    <summary>프로젝트별 선정함 <span>{projects.length} / {projectLimit}개</span></summary>
    <p>비교함의 최대 3개 제품·선택 드라이브·검색 조건·메모를 새 기록으로 저장합니다. 제품 없이 검색 조건만 저장할 수도 있습니다.</p>
    <p>이 브라우저·주소에만 저장됩니다. 기기 변경·브라우저 데이터 삭제 전에 백업하세요. 불러온 사양은 현재 카탈로그 기준이며 구매 적합 판정이 아닙니다.</p>
    <form onSubmit={event => { event.preventDefault(); save() }}>
      <label>프로젝트 이름<input value={name} onChange={event => setName(event.target.value)} maxLength={80} required placeholder="예: 포장기 이송축" /></label>
      <label>선정 메모<textarea value={note} onChange={event => setNote(event.target.value)} maxLength={2000} rows={3} placeholder="선정 이유·장착 조건·확인할 항목" /></label>
      <p>저장할 제품: {models.length ? models.map(m => `${m.brand} ${m.model}${m.drive ? ` (드라이브: ${m.drive})` : ' (드라이브 선택 없음)'}`).join(' / ') : '없음 · 검색 조건만 저장'}</p>
      <div className="project-actions"><button type="submit" disabled={busy}>현재 선정안 새 기록 저장</button><button type="button" onClick={backup} disabled={busy}>선정함 파일 백업</button><button type="button" onClick={() => fileInput.current?.click()} disabled={busy}>{busy ? '복원 중…' : '백업 파일 가져오기'}</button></div>
      <input type="file" ref={fileInput} accept=".json,application/json" hidden aria-label="선정함 백업 파일" onChange={event => { const file = event.target.files?.[0]; if(file) void restoreFile(file) }} />
    </form>
    <p role="status" className="project-message">{message}</p>
    <div className="project-list">{projects.map(project => <article key={project.id}>
      <h3>{project.name}</h3><time dateTime={project.savedAt}>{new Date(project.savedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} KST</time>
      <p className="project-note">{project.note || '메모 없음'}</p>
      <ul>{project.models.map(model => <li key={model.id}>{model.brand} · {model.model}{!resolveProduct(model.id) && ' · 현재 카탈로그 없음'}<br />드라이브: {model.drive ?? '선택 없음'}</li>)}</ul>
      <p>검색어: {project.conditions.query || '없음'} · 범위: {project.conditions.allBrands ? '전체 제조사' : brandCatalogs.find(brand => brand.id === project.conditions.activeBrandId)?.name}</p>
      <p>{conditionSummary(project.conditions)}</p>
      <div className="project-actions"><button type="button" onClick={() => { setName(project.name); setNote(project.note); setMessage(onRestore(project)) }}>불러오기 · {project.name}</button>
        {deleteId === project.id ? <><button type="button" onClick={() => { try { commit(current => current.filter(p => p.id !== project.id)); setDeleteId(null); setMessage('선택 기록을 삭제했습니다. 다른 기록은 유지됩니다.') } catch(error) { setMessage(errorText(error)) } }}>삭제 확정 · {project.name}</button><button type="button" onClick={() => setDeleteId(null)}>삭제 취소</button></> : <button type="button" onClick={() => setDeleteId(project.id)}>삭제 · {project.name}</button>}</div>
    </article>)}</div>
  </details>
}
