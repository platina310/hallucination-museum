// 방 2 · 환각의 방 (검수대)
// 도슨트의 설명을 한 건씩 통과시키거나 반려한다. 라운드마다 검수 규칙이 하나씩 늘어난다.
import { useEffect, useRef, useState } from 'react'
import { judgeInspection } from '../api'
import type { RoomStats } from '../game/progress'
import { ROUNDS } from '../mock/room2'
import Artwork from './Artwork'
import { Coach, Mission } from './Guide'
import Portrait, { Figure } from './Portrait'
import type { Face } from './Portrait'

const MAX_WARNINGS = 3

const HINTS = [
  '출처 이름이 붙어 있다고 사실은 아닙니다. 기록 카드를 펼쳐 한 줄씩 대조하세요.',
  '2라운드부터는 실제 카드를 대면서 카드에 없는 말을 섞습니다. 낱말 하나하나를 확인하세요.',
  '3라운드에서는 오래된 기록과 최근 기록이 어긋납니다. 카드에 적힌 연도를 보고 최근 것을 따르세요. 그림 오른쪽 아래 서명 옆 숫자도 보세요.',
]

type Decision = 'pass' | 'reject'

// 전시실에서 살펴볼 곳. 기록 카드는 여기저기 흩어져 있고, 다 찾아야 검수를 시작할 수 있다.
const SPOTS = [
  { label: '그림 옆 명판', note: '명판 뒤에 서류가 한 장 꽂혀 있어요.', icon: 'M6 10h28v20H6zM11 17h18M11 23h12' },
  { label: '안내 데스크 서류철', note: '서류철 맨 위에 놓인 종이예요.', icon: 'M5 12h12l3 4h15v16H5zM10 22h20M10 27h14' },
  { label: '액자 뒤 꼬리표', note: '액자 뒤에 꼬리표가 매달려 있어요. …액자 뒤가 왜 따뜻하죠.', icon: 'M8 20l10-10h16v20H18zM26 16a2 2 0 1 0 .1 0M20 2v9' },
  { label: '벽 안내판', note: '안내판 구석에 종이가 덧붙어 있어요.', icon: 'M5 6h30v24H5zM10 13h20M10 19h20M10 25h12M20 30v8' },
]

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
  const [foundCards, setFoundCards] = useState<string[]>(solvedBefore ? ROUNDS[ROUNDS.length - 1].cards.map((c) => c.label) : [])
  const [look, setLook] = useState<{ title: string; text: string; card?: { label: string; text: string }; fresh?: boolean } | null>(null)
  const [cur, setCur] = useState(0) // 지금 보고 있는 설명
  // 제출 결과를 장면 위에 도장으로 잠깐 찍는다
  const [burst, setBurst] = useState<{ text: string; bad: boolean } | null>(null)
  const burstTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(burstTimer.current), [])
  function stamp(text: string, bad: boolean) {
    setBurst({ text, bad })
    clearTimeout(burstTimer.current)
    burstTimer.current = setTimeout(() => setBurst(null), 1800)
  }
  const [calm, setCalm] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  const current = ROUNDS[round]
  const rules = ROUNDS.slice(0, round + 1).map((r) => r.newRule)
  const allDecided = current.claims.every((c) => decisions[c.id] !== undefined)
  const allFound = current.cards.every((c) => foundCards.includes(c.label))
  const claim = current.claims[Math.min(cur, current.claims.length - 1)]

  function inspect(i: number) {
    const card = current.cards[i]
    const fresh = !foundCards.includes(card.label)
    if (fresh) setFoundCards((prev) => [...prev, card.label])
    setLook({ title: SPOTS[i].label, text: SPOTS[i].note, card, fresh })
  }
  const failed = warnings >= MAX_WARNINGS && !solved
  const locked = solved || failed
  const step = solved ? 4 : round + 1

  function decide(id: number, d: Decision) {
    if (locked || !allFound) return
    setDecisions((prev) => ({ ...prev, [id]: d }))
    // 처리하면 아직 안 본 다음 설명으로 넘어간다
    const next = current.claims.findIndex((c, i) => i > cur && decisions[c.id] === undefined && c.id !== id)
    if (next >= 0) setCur(next)
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
          stamp('검수 완료!', false)
          setFeedback('전부 맞게 처리했습니다. 루미가 조용히 문을 엽니다.')
          onSolved({ tries: used, hints })
        } else {
          setGood(true)
          stamp('통과!', false)
          setFeedback(`${round + 1}라운드 통과. 다음 작품이 올라옵니다. 규칙이 하나 늘었습니다.`)
          setRound(round + 1)
          setDecisions({})
          setOpened([])
          setFoundCards([])
          setLook(null)
          setCur(0)
        }
      } else {
        const w = warnings + 1
        setWarnings(w)
        setGood(false)
        stamp('경고장!', true)
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
    setFoundCards([])
    setLook(null)
    setCur(0)
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
  if (!allFound && !solved && !failed) coach = '전시실을 살펴 이 작품의 기록 카드를 먼저 다 찾으세요. 카드 없이는 루미의 말을 확인할 수 없습니다.'
  if (solved) coach = '검수 완료. 출처는 이름이 아니라 내용으로, 그리고 최근 기록으로 확인합니다.'
  else if (failed) coach = "'처음부터 다시'를 눌러 1라운드부터 다시 검수하세요."
  else if (!good && feedback !== '') coach = '틀린 건이 있습니다. 지금까지 나온 규칙을 위에서부터 하나씩 모든 설명에 적용해 보세요.'
  else if (!allFound) coach = '새 작품이 걸렸습니다. 이 작품의 기록 카드를 다시 찾아야 합니다.'
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

          {/* 전시실: 그림 주변을 살펴 기록 카드를 찾는다 */}
          <div className={calm ? 'gallery calm' : 'gallery'}>
            <span className="gallery-tube" aria-hidden="true" />
            {/* 그림 옆에 루미가 서서 설명한다. 표정은 상황에 따라 바뀐다 */}
            <div className="gallery-stage">
              <Artwork index={round} />
              <div className={burst ? 'gallery-lumi jolt' : 'gallery-lumi'}>
                <Figure who="lumi" face={face} />
              </div>
            </div>
            <p className="gallery-mood">{mood}</p>
            {burst && <span className={burst.bad ? 'burst' : 'burst ok'}>{burst.text}</span>}
            <div className="gallery-objs" role="group" aria-label="전시실에서 살펴볼 곳">
              {current.cards.map((c, i) => {
                const got = foundCards.includes(c.label)
                return (
                  <button key={`${round}-${i}`} type="button" className={got ? 'obj done' : 'obj'} onClick={() => inspect(i)}>
                    <svg viewBox="0 0 40 40" aria-hidden="true">
                      <path d={SPOTS[i].icon} />
                    </svg>
                    <span>
                      {got ? '✓ ' : ''}
                      {SPOTS[i].label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="scene-bar">
            <span>
              <b>전시실</b> <span className="muted">기록 카드 {current.cards.filter((c) => foundCards.includes(c.label)).length} / {current.cards.length}</span>
            </span>
            <button type="button" className="toggle" aria-pressed={calm} onClick={() => setCalm((v) => !v)}>
              깜빡임 끄기
            </button>
          </div>
          <div className="scene-look" role="status">
            {look ? (
              <>
                <p>
                  <b>{look.title}</b> {look.text}
                </p>
                {look.card && (
                  <div className={look.fresh ? 'found-card fresh' : 'found-card'}>
                    <span className="mono">{look.fresh ? '기록 카드 획득' : '이미 챙긴 카드'}</span>
                    <b>{look.card.label}</b>
                    <span>{look.card.text}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="muted">그림 주변을 눌러 살펴보세요. 이 작품의 기록 카드가 흩어져 있어요.</p>
            )}
          </div>

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


          {/* 검수: 루미의 설명을 한 건씩 넘겨 보며 통과시키거나 반려한다 */}
          <div className="dlg" role="status">
            <span className="dlg-name">
              도슨트 루미 · 설명 {cur + 1}/{current.claims.length}
            </span>
            <p className="stmt">{claim.text}</p>
            <p className="dlg-cite">
              <span className="chip src">루미가 댄 출처: {claim.cite}</span>
              {decisions[claim.id] && <span className={decisions[claim.id] === 'reject' ? 'pill need' : 'pill ok'}>{decisions[claim.id] === 'reject' ? '반려함' : '통과시킴'}</span>}
            </p>
          </div>
          <div className="choices" role="group" aria-label="이 설명 처리">
            <div className="stmt-nav">
              <button type="button" className="toggle" onClick={() => setCur((c) => (c + current.claims.length - 1) % current.claims.length)}>
                ◀ 앞 설명
              </button>
              <span className="mono">
                처리 {Object.keys(decisions).length}/{current.claims.length}
              </span>
              <button type="button" className="toggle" onClick={() => setCur((c) => (c + 1) % current.claims.length)}>
                다음 설명 ▶
              </button>
            </div>
            <div className="act-row">
              <button type="button" className="act" disabled={locked || !allFound} onClick={() => decide(claim.id, 'pass')}>
                통과
              </button>
              <button type="button" className="act present" disabled={locked || !allFound} onClick={() => decide(claim.id, 'reject')}>
                반려
              </button>
            </div>
            {!allFound && !locked && <p className="choices-q">기록 카드를 다 찾아야 검수할 수 있어요.</p>}
            <ol className="claim-list">
              {current.claims.map((c, i) => (
                <li key={`${round}-${c.id}`}>
                  <button type="button" className={i === cur ? 'now' : undefined} onClick={() => setCur(i)}>
                    <span className="mono">{i + 1}</span>
                    <span className="t">{c.text}</span>
                    <span className="d">{decisions[c.id] === 'reject' ? '반려' : decisions[c.id] === 'pass' ? '통과' : '미처리'}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

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
            <p>전시실에서 찾은 원본 기록입니다. 눌러서 펼칩니다.{!allFound && ` 아직 못 찾은 카드가 ${current.cards.length - current.cards.filter((c) => foundCards.includes(c.label)).length}장 있습니다.`}</p>
            <div className="cards">
              {current.cards.filter((c) => foundCards.includes(c.label)).map((c) => {
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
