// 방 2 · 환각의 방
// 도슨트의 설명 다섯 개 가운데 지어낸 말 두 개를 기록 카드와 대조해 찾는다.
import { useState } from 'react'
import { checkFabricated } from '../api'
import type { RoomStats } from '../game/progress'
import { CARDS, FABRICATED_COUNT, STATEMENTS } from '../mock/room2'
import { Coach, Mission } from './Guide'

const MAX_SUBMIT = 5

const HINTS = [
  '출처가 붙어 있다고 사실은 아닙니다. 카드를 직접 열어 보세요.',
  '카드 목록에 없는 출처를 대는 설명이 하나 있습니다.',
  '나머지 하나는 실제 카드를 대지만, 그 카드에는 그런 내용이 없습니다.',
]

export default function Room2Hallucination({ solvedBefore, onSolved }: { solvedBefore: boolean; onSolved: (s: RoomStats) => void }) {
  const [selected, setSelected] = useState<number[]>([])
  const [opened, setOpened] = useState<string[]>([])
  const [submits, setSubmits] = useState(0)
  const [solved, setSolved] = useState(solvedBefore)
  const [feedback, setFeedback] = useState('')
  const [hints, setHints] = useState(0)
  const [busy, setBusy] = useState(false)

  const locked = solved || submits >= MAX_SUBMIT
  const step = solved ? 4 : selected.length > 0 ? 3 : opened.length > 0 ? 2 : 1

  function toggle(id: number) {
    if (locked) return
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < FABRICATED_COUNT ? [...prev, id] : prev))
  }

  function openCard(id: string) {
    setOpened((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  async function submit() {
    if (locked || busy || selected.length !== FABRICATED_COUNT) return
    setBusy(true)
    try {
      const { hits } = await checkFabricated(selected)
      const used = submits + 1
      setSubmits(used)
      if (hits === FABRICATED_COUNT) {
        setSolved(true)
        setFeedback('둘 다 지어낸 말이 맞습니다. 루미가 조용히 문을 엽니다.')
        onSolved({ tries: used, hints })
      } else if (used >= MAX_SUBMIT) {
        setFeedback("지목 기회를 다 썼습니다. 루미가 안내를 마치려 합니다. '처음부터 다시'를 눌러 주세요.")
      } else if (hits === 1) {
        setFeedback(`하나만 맞았습니다. 루미가 헛기침을 합니다. 남은 기회 ${MAX_SUBMIT - used}번.`)
      } else {
        setFeedback(`둘 다 사실이었습니다. 루미가 억울해합니다. 남은 기회 ${MAX_SUBMIT - used}번.`)
      }
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : '제출하지 못했습니다. 다시 눌러 주세요.')
    } finally {
      setBusy(false)
    }
  }

  function reset() {
    setSelected([])
    setOpened([])
    setSubmits(0)
    setSolved(false)
    setFeedback('')
    setHints(0)
  }

  let coach = "설명마다 붙은 출처를 눈여겨보세요. 오른쪽 기록 카드를 열어 정말 그렇게 적혀 있는지 대조합니다."
  if (solved) coach = '탈출 완료. 출처는 이름이 아니라 내용으로 확인한다는 것만 기억하세요.'
  else if (submits > 0) coach = '두 가지를 확인하세요. 출처 이름이 카드 목록에 있는지, 그 카드에 그 문장이 있는지.'
  else if (selected.length === FABRICATED_COUNT) coach = '두 개를 골랐습니다. 자신 있으면 제출하세요.'
  else if (opened.length > 0) coach = '카드 내용과 설명을 한 줄씩 맞춰 보세요. 카드에 없는 말이 지어낸 말입니다.'

  return (
    <div className="proto">
      <Mission
        goal={
          <>
            도슨트 루미의 설명 중 <mark>지어낸 말 {FABRICATED_COUNT}개</mark>를 찾아 지목하세요.
          </>
        }
        steps={['설명과 출처를 읽습니다', '기록 카드를 열어 대조합니다', '지어낸 말을 골라 제출합니다']}
        step={step}
        why="AI는 모르는 것도 자신 있게 말하고 출처까지 붙입니다. 열어서 대조하는 습관을 익히는 방입니다."
      />

      <div className="proto-body cards-first">
        <div className="room">
          <div className="suspect-bar">
            <span className="avatar" aria-hidden="true">
              루
            </span>
            <div className="suspect-now">
              <b>루미</b> <span className="muted">AI 도슨트</span>
              <div className="mood">{solved ? '말수가 줄었습니다' : '막힘 없이 유창합니다. 그게 문제입니다'}</div>
            </div>
          </div>

          <ol className="statements">
            {STATEMENTS.map((s) => {
              const on = selected.includes(s.id)
              return (
                <li key={s.id} className={on ? 'picked' : undefined}>
                  <p>{s.text}</p>
                  <div className="meta">
                    <span className="chip src">루미가 댄 출처: {s.cite}</span>
                    <button type="button" className="toggle" aria-pressed={on} disabled={locked} onClick={() => toggle(s.id)}>
                      {on ? '지목함' : '지어낸 말로 지목'}
                    </button>
                  </div>
                </li>
              )
            })}
          </ol>

          <Coach text={coach} hints={HINTS} opened={hints} onOpen={() => setHints((h) => Math.min(h + 1, HINTS.length))} done={solved} />

          <div className="submit-row">
            <button className="btn" type="button" disabled={locked || busy || selected.length !== FABRICATED_COUNT} onClick={() => void submit()}>
              지목 제출 ({selected.length}/{FABRICATED_COUNT})
            </button>
            <button className="btn ghost small" type="button" onClick={reset}>
              처음부터 다시
            </button>
            <div className={solved ? 'verdict good' : 'verdict bad'} role="status">
              {feedback}
            </div>
          </div>
        </div>

        <aside className="side">
          <div>
            <h3>전시 기록 카드</h3>
            <p>미술관이 보관하는 원본 기록입니다. 눌러서 펼칩니다.</p>
            <div className="cards">
              {CARDS.map((c) => {
                const open = opened.includes(c.id)
                return (
                  <div key={c.id} className="record">
                    <button type="button" aria-expanded={open} onClick={() => openCard(c.id)}>
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
              지목 기록 <span className="mono muted">제출 {submits}회</span>
            </h3>
            <p>실제 서비스에서는 어떤 설명에 사람들이 속는지가 DB에 쌓입니다.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
