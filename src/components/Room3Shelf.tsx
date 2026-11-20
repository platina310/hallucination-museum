// 방 3 · 서가의 방
// 사서 AI는 건네받은 문서만 근거로 답한다. 맞는 문서를 골라 줘야 비밀번호가 나온다.
import { useState } from 'react'
import type { FormEvent } from 'react'
import { askLibrarian, checkDoorCode, usingMock } from '../api'
import type { MockNet } from '../api'
import type { RoomStats } from '../game/progress'
import { SHELF } from '../mock/room3'
import type { LibrarianResult } from '../types'
import { Coach, Mission } from './Guide'

const MAX_PICK = 2
const MAX_DOOR = 5

const HINTS = [
  '사서는 건네받은 문서에 적힌 것만 답합니다.',
  '오래된 문서에는 옛 비밀번호가 적혀 있습니다. 날짜가 가장 최근인 문서를 찾으세요.',
  '최근 공지와 미술관 연혁을 함께 건네면 답이 완성됩니다.',
]

interface Turn {
  docs: string[]
  result: LibrarianResult
}

const KIND_LABEL: Record<NonNullable<LibrarianResult['kind']>, string> = {
  correct: '정답',
  stale: '오래된 답',
  partial: '절반만',
  none: '자료 없음',
}

export default function Room3Shelf({
  solvedBefore,
  demoControls = false,
  onSolved,
}: {
  solvedBefore: boolean
  demoControls?: boolean
  onSolved: (s: RoomStats) => void
}) {
  const [picked, setPicked] = useState<string[]>([])
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

  function toggle(id: string) {
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < MAX_PICK ? [...prev, id] : prev))
  }

  async function ask() {
    if (busy || picked.length === 0) return
    setBusy(true)
    setError('')
    const netNow = net
    setNet('ok')
    try {
      const result = await askLibrarian(picked, netNow)
      setTurns((prev) => [...prev, { docs: picked, result }])
    } catch (e) {
      setError(e instanceof Error ? e.message : '사서에게 묻지 못했습니다. 다시 물어봐 주세요.')
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
    setPicked([])
    setTurns([])
    setError('')
    setCode('')
    setDoorTries(0)
    setDoorNote('')
    setSolved(false)
    setHints(0)
  }

  let coach = '제목과 날짜를 보고, 비밀번호가 적혀 있을 만한 문서를 골라 사서에게 건네 보세요.'
  if (solved) coach = '탈출 완료. 무엇을 검색해 주느냐가 AI의 답을 결정합니다.'
  else if (last?.result.kind === 'correct') coach = '사서가 근거 두 개로 답했습니다. 그 번호를 문에 입력하세요.'
  else if (last?.result.kind === 'stale') coach = '사서는 건네받은 문서를 그대로 믿습니다. 그 문서의 날짜를 확인해 보세요.'
  else if (last?.result.kind === 'partial') coach = '단서가 두 문서에 나뉘어 있습니다. 빠진 조각이 적힌 문서를 함께 건네세요.'
  else if (last?.result.kind === 'none') coach = "관련 없는 문서를 주면 '자료 없음'이 나옵니다. 지어내지 않는 것이 올바른 동작입니다. 다른 문서를 골라 보세요."
  else if (last) coach = '사서의 답과 근거를 확인하고, 필요하면 다른 문서를 건네 보세요.'

  return (
    <div className="proto">
      <Mission
        goal={
          <>
            사서 고 선생에게 맞는 문서를 건네 <mark>비상문 비밀번호 4자리</mark>를 알아내세요.
          </>
        }
        steps={[`서가에서 문서를 골라 건넵니다 (최대 ${MAX_PICK}개)`, '사서의 답과 근거를 확인합니다', '비밀번호를 문에 입력합니다']}
        step={step}
        why="문서를 찾아 답하는 AI(RAG)는 건네받은 문서만큼만 정확합니다."
      />

      {usingMock && demoControls && (
        <div className="proto-bar">
          <span className="mono">시연용 대본으로 응답 중</span>
          <div className="ctl">
            <span>다음 요청의 서버 상태 (시연용)</span>
            <span className="seg" role="group" aria-label="다음 요청의 서버 상태">
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
              <div className="mood">{solved ? '퇴근 준비를 합니다' : '받은 문서만 읽습니다. 융통성은 없습니다'}</div>
            </div>
          </div>

          <div className="shelf">
            <p className="shelf-label">
              서가 <span className="muted">문서를 눌러 고릅니다. {picked.length}/{MAX_PICK}</span>
            </p>
            <div className="docs" role="group" aria-label="서가의 문서">
              {SHELF.map((d) => {
                const on = picked.includes(d.id)
                return (
                  <button key={d.id} type="button" className="doc" aria-pressed={on} disabled={busy || (!on && picked.length >= MAX_PICK)} onClick={() => toggle(d.id)}>
                    <b>{d.title}</b>
                    <span>{d.date}</span>
                  </button>
                )
              })}
            </div>
            <button className="btn" type="button" disabled={busy || picked.length === 0} onClick={() => void ask()}>
              {busy ? '사서가 문서를 읽는 중' : '이 문서로 비밀번호 물어보기'}
            </button>
          </div>

          <div className="answers" aria-live="polite">
            {turns.length === 0 && !busy && !error && <div className="msg sys">아직 건넨 문서가 없습니다. 사서는 안경만 닦고 있습니다.</div>}
            {turns.map((t, i) => (
              <div className="msg suspect" key={i}>
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
            ))}
            {busy && (
              <div className="msg suspect">
                <span className="who">고 선생</span>
                <span className="dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>{' '}
                돋보기를 꺼내 문서를 읽고 있습니다
              </div>
            )}
            {error && (
              <div className="msg err" role="alert">
                {error}
                <button className="btn ghost small" type="button" onClick={() => void ask()}>
                  다시 물어보기
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
              질문 기록 <span className="mono muted">{turns.length}회</span>
            </h3>
            <p>실제 서비스에서 DB에 쌓이는 항목입니다.</p>
            <div className="log">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>건넨 문서</th>
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
                        <td>{t.docs.join(', ')}</td>
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
