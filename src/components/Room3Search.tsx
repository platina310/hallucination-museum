// 방 3 · 서가의 방 (검색창)
// 검색어로 문서를 찾으면 앞의 3건만 사서에게 전달된다. 사서는 그 문서만 근거로 답한다.
import { useState } from 'react'
import type { FormEvent } from 'react'
import { checkDoorCode, searchLibrary, usingMock } from '../api'
import type { MockNet } from '../api'
import type { RoomStats } from '../game/progress'
import { DOC_COUNT, TOP_K } from '../mock/room3'
import type { SearchResult } from '../types'
import { Coach, Mission } from './Guide'

const MAX_DOOR = 5
const MAX_QUERY = 40

const HINTS = [
  `사서에게는 검색 결과 중 앞의 ${TOP_K}건만 전달됩니다. 순서는 오래된 문서부터입니다.`,
  "비밀번호가 바뀌었다면 최근 문서에 '변경'이라는 말이 있을 겁니다.",
  '사서가 모른다고 한 낱말을 그대로 검색해 보세요. 예: 개관',
]

interface Turn {
  query: string
  result: SearchResult
}

const KIND_LABEL: Record<NonNullable<SearchResult['kind']>, string> = {
  correct: '정답',
  stale: '오래된 답',
  partial: '절반만',
  none: '자료 없음',
}

export default function Room3Search({
  solvedBefore,
  demoControls = false,
  onSolved,
}: {
  solvedBefore: boolean
  demoControls?: boolean
  onSolved: (s: RoomStats) => void
}) {
  // 첫 검색어는 미리 넣어 둔다. 누르기만 하면 시작된다.
  const [query, setQuery] = useState('비상문 비밀번호')
  const [turns, setTurns] = useState<Turn[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [net, setNet] = useState<MockNet>('ok')
  const [code, setCode] = useState('')
  const [doorTries, setDoorTries] = useState(0)
  const [doorNote, setDoorNote] = useState('')
  const [solved, setSolved] = useState(solvedBefore)
  const [hints, setHints] = useState(0)

  const last = turns.length > 0 ? turns[turns.length - 1] : undefined
  const doorLocked = solved || doorTries >= MAX_DOOR
  const step = solved ? 4 : last?.result.kind === 'correct' ? 3 : turns.length > 0 ? 2 : 1

  async function search(e?: FormEvent) {
    e?.preventDefault()
    const q = query.trim()
    if (busy || q === '') return
    setBusy(true)
    setError('')
    const netNow = net
    setNet('ok')
    try {
      const result = await searchLibrary(q, netNow)
      setTurns((prev) => [...prev, { query: q, result }])
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색하지 못했습니다. 다시 검색해 주세요.')
    } finally {
      setBusy(false)
    }
  }

  async function tryDoor(e: FormEvent) {
    e.preventDefault()
    if (doorLocked || code.trim() === '') return
    try {
      const r = await checkDoorCode(code)
      const used = doorTries + 1
      setDoorTries(used)
      setCode('')
      if (r.correct) {
        setSolved(true)
        setDoorNote('철컥. 비상문이 열립니다.')
        onSolved({ tries: turns.length + used, hints })
      } else if (used >= MAX_DOOR) {
        setDoorNote("입력 기회를 다 썼습니다. 경보가 울리기 직전입니다. '처음부터 다시'를 눌러 주세요.")
      } else {
        setDoorNote(`${r.note} 남은 기회 ${MAX_DOOR - used}번.`)
      }
    } catch (err) {
      setDoorNote(err instanceof Error ? err.message : '입력하지 못했습니다. 다시 눌러 주세요.')
    }
  }

  function reset() {
    if (busy) return
    setQuery('비상문 비밀번호')
    setTurns([])
    setError('')
    setCode('')
    setDoorTries(0)
    setDoorNote('')
    setSolved(false)
    setHints(0)
  }

  let coach = "검색창의 '검색해서 물어보기'를 눌러 보세요. 사서는 검색된 문서만 읽고 답합니다."
  if (solved) coach = '탈출 완료. 무엇이 검색되느냐가 AI의 답을 결정합니다.'
  else if (last?.result.kind === 'correct') coach = '사서가 근거 두 개로 답했습니다. 그 번호를 문에 입력하세요.'
  else if (last?.result.kind === 'stale')
    coach = `사서는 자신 있게 답했지만 문서 날짜를 보세요. 검색 결과는 오래된 것부터 ${TOP_K}건만 전달됩니다. 최근 문서에만 있을 낱말을 더해 보세요.`
  else if (last?.result.kind === 'partial') coach = '빠진 조각이 있습니다. 사서가 받은 문서에 없다고 한 그것을 검색어로 넣어 보세요.'
  else if (last?.result.kind === 'none') coach = "관련 문서가 잡히지 않았습니다. '자료 없음'은 지어내지 않은 올바른 답입니다. 다른 낱말로 검색하세요."
  else if (last) coach = '사서의 답과 근거 문서를 확인하고, 검색어를 바꿔 보세요.'

  return (
    <div className="proto">
      <Mission
        goal={
          <>
            문서 {DOC_COUNT}건이 든 서가를 검색해 <mark>비상문 비밀번호 4자리</mark>를 알아내세요.
          </>
        }
        steps={['검색어를 넣어 문서를 찾습니다', `전달된 ${TOP_K}건과 사서의 답을 확인하고 검색어를 다듬습니다`, '비밀번호를 문에 입력합니다']}
        step={step}
        why="문서를 찾아 답하는 AI(RAG)는 검색된 문서만큼만 정확합니다."
      />

      {usingMock && demoControls && (
        <div className="proto-bar">
          <span className="mono">시연용 대본으로 응답 중</span>
          <div className="ctl">
            <span>다음 검색의 서버 상태 (시연용)</span>
            <span className="seg" role="group" aria-label="다음 검색의 서버 상태">
              {(['ok', 'slow', 'error'] as const).map((v) => (
                <button key={v} type="button" aria-pressed={net === v} onClick={() => setNet(v)}>
                  {v === 'ok' ? '정상' : v === 'slow' ? '느림' : '오류'}
                </button>
              ))}
            </span>
          </div>
        </div>
      )}

      <div className="proto-body">
        <div className="room">
          <div className="suspect-bar">
            <span className="avatar" aria-hidden="true">
              고
            </span>
            <div className="suspect-now">
              <b>고 선생</b> <span className="muted">AI 사서</span>
              <div className="mood">{solved ? '퇴근 준비를 합니다' : `검색된 문서 ${TOP_K}건만 읽습니다. 융통성은 없습니다`}</div>
            </div>
          </div>

          <form className="search" onSubmit={(e) => void search(e)}>
            <label htmlFor="search-input" className="shelf-label">
              서가 검색 <span className="muted">문서 {DOC_COUNT}건. 제목은 검색해야 보입니다</span>
            </label>
            <div className="search-row">
              <input
                id="search-input"
                type="search"
                autoComplete="off"
                enterKeyHint="search"
                maxLength={MAX_QUERY}
                placeholder="찾을 낱말"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="btn" type="submit" disabled={busy || query.trim() === ''}>
                {busy ? '찾는 중' : '검색해서 물어보기'}
              </button>
            </div>
          </form>

          <div className="answers" aria-live="polite">
            {turns.length === 0 && !busy && !error && <div className="msg sys">아직 검색한 것이 없습니다. 사서는 안경만 닦고 있습니다.</div>}
            {turns.map((t, i) => (
              <div className="turn" key={i}>
                <div className="retrieved">
                  <p>
                    <b>"{t.query}"</b> 검색 결과 {t.result.found}건
                    {t.result.found > t.result.docs.length && (
                      <>
                        {' '}
                        중 앞의 {t.result.docs.length}건만 전달됨. <span className="cut">나머지 {t.result.found - t.result.docs.length}건은 잘림</span>
                      </>
                    )}
                  </p>
                  {t.result.docs.length > 0 && (
                    <ul>
                      {t.result.docs.map((d) => (
                        <li key={d.id}>
                          {d.title} <span className="mono">{d.date}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="msg suspect">
                  <span className="who">고 선생 · {i + 1}번째 답</span>
                  {t.result.reply}
                  <div className="meta">
                    {t.result.sources.length > 0 ? (
                      t.result.sources.map((s) => (
                        <span className="chip src" key={s.id}>
                          근거: {s.label}
                        </span>
                      ))
                    ) : (
                      <span className="chip nosrc">근거 없음: 받은 문서에 없는 내용</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {busy && (
              <div className="msg suspect">
                <span className="who">고 선생</span>
                <span className="dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>{' '}
                서가를 뒤지고 돋보기를 꺼냅니다
              </div>
            )}
            {error && (
              <div className="msg err" role="alert">
                {error}
                <button className="btn ghost small" type="button" onClick={() => void search()}>
                  다시 검색하기
                </button>
              </div>
            )}
          </div>

          <Coach text={coach} hints={HINTS} opened={hints} onOpen={() => setHints((h) => Math.min(h + 1, HINTS.length))} done={solved} />
        </div>

        <aside className="side">
          <div className={last?.result.kind === 'correct' && !solved ? 'side-evidence ready' : 'side-evidence'}>
            <h3>비상문</h3>
            <p>비밀번호 4자리를 입력하면 문이 열립니다. 기회는 {MAX_DOOR}번입니다.</p>
            <form className="submit" onSubmit={(e) => void tryDoor(e)}>
              <label htmlFor="door-input" className="sr-only">
                비밀번호 4자리
              </label>
              <input
                id="door-input"
                className="code-input"
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                placeholder="0000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              />
              <button className="btn" type="submit" disabled={doorLocked}>
                문 열기
              </button>
            </form>
            <div className={solved ? 'verdict good' : 'verdict bad'} role="status">
              {doorNote}
            </div>
          </div>
          <div>
            <h3>
              검색 기록 <span className="mono muted">{turns.length}회</span>
            </h3>
            <p>실제 서비스에서 DB에 쌓이는 항목입니다.</p>
            <div className="log">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>검색어</th>
                    <th>결과</th>
                  </tr>
                </thead>
                <tbody>
                  {turns.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="muted">
                        대출 기록이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    turns.map((t, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{t.query}</td>
                        <td>{t.result.kind ? KIND_LABEL[t.result.kind] : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <button className="btn ghost small gap-top" type="button" onClick={reset} disabled={busy}>
              처음부터 다시
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
