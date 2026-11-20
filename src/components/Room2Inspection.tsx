// 방 2 · 환각의 방 (검수대)
// 도슨트의 설명을 한 건씩 통과시키거나 반려한다. 라운드마다 검수 규칙이 하나씩 늘어난다.
import { useState } from 'react'
import { judgeInspection } from '../api'
import type { RoomStats } from '../game/progress'
import { ROUNDS } from '../mock/room2'
import Artwork from './Artwork'
import { Coach, Mission } from './Guide'
import Portrait from './Portrait'
import type { Face } from './Portrait'

const MAX_WARNINGS = 3

const HINTS = [
  '출처 이름이 붙어 있다고 사실은 아닙니다. 기록 카드를 펼쳐 한 줄씩 대조하세요.',
  '2라운드부터는 실제 카드를 대면서 카드에 없는 말을 섞습니다. 낱말 하나하나를 확인하세요.',
  '3라운드에서는 오래된 기록과 최근 기록이 어긋납니다. 카드에 적힌 연도를 보고 최근 것을 따르세요. 그림 오른쪽 아래 서명 옆 숫자도 보세요.',
]

type Decision = 'pass' | 'reject'

export default function Room2Inspection({ solvedBefore, onSolved }: { solvedBefore: boolean; onSolved: (s: RoomStats) => void }) {
  const [round, setRound] = useState(solvedBefore ? ROUNDS.length - 1 : 0)
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})
  const [opened, setOpened] = useState<string[]>([])
  const [submits, setSubmits] = useState(0)
  const [warnings, setWarnings] = useState(0)
  const [solved, setSolved] = useState(solvedBefore)
  const [feedback, setFeedback] = useState('')
  const [good, setGood] = useState(false)
  const [hints, setHints] = useState(0)
  const [busy, setBusy] = useState(false)

  const current = ROUNDS[round]
  const rules = ROUNDS.slice(0, round + 1).map((r) => r.newRule)
  const allDecided = current.claims.every((c) => decisions[c.id] !== undefined)
  const failed = warnings >= MAX_WARNINGS && !solved
  const locked = solved || failed
  const step = solved ? 4 : round + 1

  function decide(id: number, d: Decision) {
    if (locked) return
    setDecisions((prev) => ({ ...prev, [id]: d }))
  }

  function toggleCard(label: string) {
    setOpened((prev) => (prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]))
  }

  async function submit() {
    if (locked || busy || !allDecided) return
    setBusy(true)
    try {
      const rejected = current.claims.filter((c) => decisions[c.id] === 'reject').map((c) => c.id)
      const r = await judgeInspection(round, rejected)
      const used = submits + 1
      setSubmits(used)
      if (r.correct === r.total) {
        if (round === ROUNDS.length - 1) {
          setSolved(true)
          setGood(true)
          setFeedback('전부 맞게 처리했습니다. 루미가 조용히 문을 엽니다.')
          onSolved({ tries: used, hints })
        } else {
          setGood(true)
          setFeedback(`${round + 1}라운드 통과. 다음 작품이 올라옵니다. 규칙이 하나 늘었습니다.`)
          setRound(round + 1)
          setDecisions({})
          setOpened([])
        }
      } else {
        const w = warnings + 1
        setWarnings(w)
        setGood(false)
        setFeedback(
          w >= MAX_WARNINGS
            ? "경고장이 세 장 쌓였습니다. 검수원 자격이 정지됐습니다. '처음부터 다시'를 눌러 주세요."
            : `${r.total}건 중 ${r.correct}건만 맞게 처리했습니다. 어느 건인지는 알려 드리지 않습니다. 경고장 ${w}/${MAX_WARNINGS}.`,
        )
      }
    } catch (e) {
      setGood(false)
      setFeedback(e instanceof Error ? e.message : '제출하지 못했습니다. 다시 눌러 주세요.')
    } finally {
      setBusy(false)
    }
  }

  function reset() {
    setRound(0)
    setDecisions({})
    setOpened([])
    setSubmits(0)
    setWarnings(0)
    setSolved(false)
    setFeedback('')
    setGood(false)
    setHints(0)
  }

  // 루미의 표정. 라운드가 넘어갈수록 유창함이 무너진다
  let face: Face = 'happy'
  let mood = '막힘 없이 유창합니다. 그게 문제입니다'
  if (solved) {
    face = 'confess'
    mood = '말수가 줄었습니다'
  } else if (failed) {
    face = 'smug'
    mood = '경고장을 세어 보며 웃습니다'
  } else if (!good && feedback !== '') {
    face = 'smug'
    mood = '방긋. 속았다는 걸 아는 표정입니다'
  } else if (round === 1) {
    face = 'shaken'
    mood = '말이 조금 빨라졌습니다'
  } else if (round === 2) {
    face = 'sweat'
    mood = '출처를 대는 목소리가 떨립니다'
  }

  let coach = '설명마다 루미가 댄 출처를 보고, 기록 카드를 펼쳐 대조하세요. 규칙에 걸리면 반려, 아니면 통과입니다.'
  if (solved) coach = '검수 완료. 출처는 이름이 아니라 내용으로, 그리고 최근 기록으로 확인합니다.'
  else if (failed) coach = "'처음부터 다시'를 눌러 1라운드부터 다시 검수하세요."
  else if (!good && feedback !== '') coach = '틀린 건이 있습니다. 지금까지 나온 규칙을 위에서부터 하나씩 모든 설명에 적용해 보세요.'
  else if (round === 1) coach = '새 규칙이 생겼습니다. 이제는 실제 카드를 대면서 카드에 없는 말을 섞습니다. 앞의 규칙도 계속 적용됩니다.'
  else if (round === 2) coach = '기록끼리 어긋나는 곳이 있습니다. 카드에 적힌 연도를 비교해 최근 기록을 따르세요.'

  return (
    <div className="proto">
      <Mission
        goal={
          <>
            도슨트 루미의 설명을 검수해 <mark>지어낸 말을 모두 반려</mark>하세요. 세 라운드입니다.
          </>
        }
        steps={['1라운드: 없는 출처를 걸러 냅니다', '2라운드: 카드에 없는 내용을 걸러 냅니다', '3라운드: 오래된 기록을 걸러 냅니다']}
        step={step}
        why="AI는 모르는 것도 자신 있게 말하고 출처까지 붙입니다. 열어서 대조하는 습관을 익히는 방입니다."
      />

      <div className="proto-body cards-first">
        <div className="room">
          <div className="suspect-bar">
            <Portrait who="lumi" face={face} />
            <div className="suspect-now">
              <b>루미</b> <span className="muted">AI 도슨트 · 지금 작품 {current.artwork}</span>
              <div className="mood" role="status">
                {mood}
              </div>
            </div>
            <div className="sound">
              <span className="pill plan">
                {round + 1} / {ROUNDS.length} 라운드
              </span>
              <span className={warnings > 0 ? 'pill need' : 'pill plan'}>
                경고장 {warnings} / {MAX_WARNINGS}
              </span>
            </div>
          </div>

          <Artwork index={round} />

          <div className="rules">
            <p className="shelf-label">검수 규칙</p>
            <ol>
              {rules.map((r, i) => (
                <li key={r}>
                  {r}
                  {i === round && round > 0 && !solved && <span className="todo">새 규칙</span>}
                </li>
              ))}
            </ol>
          </div>

          <ol className="statements">
            {current.claims.map((c) => {
              const d = decisions[c.id]
              return (
                <li key={`${round}-${c.id}`} className={d === 'reject' ? 'picked' : undefined}>
                  <p>{c.text}</p>
                  <div className="meta">
                    <span className="chip src">루미가 댄 출처: {c.cite}</span>
                    <span className="seg" role="group" aria-label={`설명 ${c.id} 처리`}>
                      <button type="button" aria-pressed={d === 'pass'} disabled={locked} onClick={() => decide(c.id, 'pass')}>
                        통과
                      </button>
                      <button type="button" aria-pressed={d === 'reject'} disabled={locked} onClick={() => decide(c.id, 'reject')}>
                        반려
                      </button>
                    </span>
                  </div>
                </li>
              )
            })}
          </ol>

          <Coach text={coach} hints={HINTS} opened={hints} onOpen={() => setHints((h) => Math.min(h + 1, HINTS.length))} done={solved} />

          <div className="submit-row">
            <button className="btn" type="button" disabled={locked || busy || !allDecided} onClick={() => void submit()}>
              {allDecided ? '검수 결과 제출' : `전부 처리해야 제출됩니다 (${Object.keys(decisions).length}/${current.claims.length})`}
            </button>
            <button className="btn ghost small" type="button" onClick={reset}>
              처음부터 다시
            </button>
            <div className={good ? 'verdict good' : 'verdict bad'} role="status">
              {feedback}
            </div>
          </div>
        </div>

        <aside className="side">
          <div>
            <h3>기록 카드 · {current.artwork}</h3>
            <p>미술관이 보관하는 원본 기록입니다. 눌러서 펼칩니다.</p>
            <div className="cards">
              {current.cards.map((c) => {
                const open = opened.includes(c.label)
                return (
                  <div key={`${round}-${c.label}`} className="record">
                    <button type="button" aria-expanded={open} onClick={() => toggleCard(c.label)}>
                      <span>{c.label}</span>
                      <span aria-hidden="true">{open ? '접기' : '펼치기'}</span>
                    </button>
                    {open && <p>{c.text}</p>}
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <h3>
              검수 기록 <span className="mono muted">제출 {submits}회</span>
            </h3>
            <p>실제 서비스에서는 어떤 설명에 사람들이 속는지가 DB에 쌓입니다.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
