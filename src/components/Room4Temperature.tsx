// 방 4 · 온도의 방 (보존실)
// 조절기 AI에게 같은 질문을 세 번 던지며 temperature를 돌려 본다.
// 기록 자물쇠는 맞는 숫자가, 창작 자물쇠는 서로 다른 제목 세 개가 있어야 열린다.
import { useEffect, useRef, useState } from 'react'
import { askTemperature, checkRecord, usingMock } from '../api'
import type { RoomStats } from '../game/progress'
import { QUESTIONS } from '../mock/room4'
import type { TempKind, TempResult } from '../mock/room4'
import { Coach, Mission } from './Guide'

const HINTS = [
  '온도를 0에 두고 보존 온도를 물어보세요. 세 번 다 같은 답이 나옵니다. 그 답을 기록 자물쇠에 넣어 보세요.',
  '같은 답이 반복된다고 맞는 답은 아닙니다. 조절기는 점검표를 받은 적이 없습니다. 보존실 서랍을 열어 보세요.',
  '창작 자물쇠는 서로 다른 제목 세 개를 원합니다. 온도 0에서는 같은 제목만 나옵니다. 1 안팎으로 올려 보세요. 한 번에 안 되면 다시 묻거나 조금 더 올리세요.',
]

const SPOTS = [
  {
    id: 'drawer',
    label: '보존실 서랍',
    note: '서랍 안쪽에 코팅된 종이가 붙어 있어요.',
    card: { label: '보존 점검표 (2026년 11월)', text: "작품 '새벽 등대'는 컬러 사진 인화지라 저온 보존. 적정 보존 온도 13도, 습도 40%. 조절기에는 아직 입력하지 않음." },
    icon: 'M5 12h30v18H5zM5 21h30M17 16h6M17 26h6',
  },
  {
    id: 'memo',
    label: '조절기 옆 쪽지',
    note: '전임 보존 담당이 붙여 둔 쪽지예요.',
    card: { label: '쪽지', text: '"다이얼은 답의 온도. 낮추면 얌전해지고 올리면 수다스러워짐. 얌전하다고 맞는 건 아님. 세 번씩 물어볼 것."' },
    icon: 'M8 6h24v22l-8 8H8zM24 36v-8h8M13 14h14M13 20h10',
  },
  {
    id: 'locks',
    label: '문 옆 자물쇠 안내판',
    note: '자물쇠가 두 개 달려 있어요.',
    card: { label: '자물쇠 안내', text: '기록 자물쇠: 이 방 작품의 보존 온도를 숫자로 입력. 창작 자물쇠: 낱말 "빛"이 들어간, 서로 다른 전시 제목 세 개를 한 번에 걸 것.' },
    icon: 'M11 18h18v16H11zM15 18v-5a5 5 0 0 1 10 0v5M20 24v5',
  },
]

// 모델 이름을 화면에 적을 말로 바꾼다 (gemini-3.1-flash-lite → Gemini 3.1 Flash-Lite)
const modelName = (id?: string) =>
  id ? id.replace(/^gemini-/, 'Gemini ').replace(/-(\w)/g, (_, c: string) => ` ${c.toUpperCase()}`).replace('Flash Lite', 'Flash-Lite') : 'Gemini'

type Mood = 'stiff' | 'easy' | 'dizzy'
const moodOf = (t: number): Mood => (t <= 0.3 ? 'stiff' : t < 1.5 ? 'easy' : 'dizzy')
const MOOD_TEXT: Record<Mood, string> = {
  stiff: '꼿꼿합니다. 가장 그럴듯한 답 하나만 고릅니다',
  easy: '느긋합니다. 그럴듯한 답 사이에서 골라 말합니다',
  dizzy: '들떠 있습니다. 덜 그럴듯한 답까지 집어 듭니다',
}

// 벽에 붙은 조절기. 화면의 얼굴과 다이얼 바늘이 온도에 따라 바뀐다
function Device({ t, mood, busy }: { t: number; mood: Mood; busy: boolean }) {
  const angle = -120 + (t / 2) * 240
  return (
    <svg viewBox="0 0 320 220" role="img" aria-label={`조절기 모락. 다이얼 ${t.toFixed(1)}`} className="device">
      <rect x="20" y="14" width="280" height="192" rx="14" fill="#dfe6ea" stroke="#18202b" strokeWidth="3" />
      <rect x="38" y="32" width="150" height="100" rx="8" fill="#0f1a22" stroke="#18202b" strokeWidth="3" />
      <g stroke="#7fe0c0" strokeWidth="4" strokeLinecap="round" fill="none" className={busy ? 'device-face busy' : 'device-face'}>
        {mood === 'dizzy' ? (
          <>
            <path d="M74 64l14 14M88 64l-14 14M138 64l14 14M152 64l-14 14" />
            <path d="M84 106q8-10 16 0t16 0 16 0" />
          </>
        ) : (
          <>
            <path d={mood === 'stiff' ? 'M72 72h18M136 72h18' : 'M72 74q9-10 18 0M136 74q9-10 18 0'} />
            <path d={mood === 'stiff' ? 'M92 106h42' : 'M90 100q23 16 46 0'} />
          </>
        )}
      </g>
      <text x="113" y="150" textAnchor="middle" fontSize="13" fontFamily="var(--f-mono)" fill="#18202b">
        조절기 모락
      </text>
      <circle cx="244" cy="86" r="44" fill="#f8f9f6" stroke="#18202b" strokeWidth="3" />
      {[0, 0.5, 1, 1.5, 2].map((v) => {
        const a = ((-120 + (v / 2) * 240 - 90) * Math.PI) / 180
        return <line key={v} x1={244 + Math.cos(a) * 34} y1={86 + Math.sin(a) * 34} x2={244 + Math.cos(a) * 42} y2={86 + Math.sin(a) * 42} stroke="#18202b" strokeWidth="2.5" />
      })}
      <g transform={`rotate(${angle} 244 86)`} className="device-needle">
        <line x1="244" y1="86" x2="244" y2="52" stroke="#bf2f1b" strokeWidth="5" strokeLinecap="round" />
      </g>
      <circle cx="244" cy="86" r="6" fill="#18202b" />
      <text x="208" y="150" fontSize="11" fontFamily="var(--f-mono)" fill="#4f5b68">
        0
      </text>
      <text x="272" y="150" fontSize="11" fontFamily="var(--f-mono)" fill="#4f5b68">
        2
      </text>
      <text x="244" y="182" textAnchor="middle" fontSize="20" fontWeight="700" fontFamily="var(--f-mono)" fill="#18202b">
        {t.toFixed(1)}
      </text>
      <rect x="38" y="166" width="150" height="22" rx="4" fill="#c9d3d9" stroke="#18202b" strokeWidth="2" />
      <rect x="40" y="168" width={Math.max(4, (t / 2) * 146)} height="18" rx="3" fill={mood === 'dizzy' ? '#bf2f1b' : mood === 'easy' ? '#d9a514' : '#2b6f9c'} />
    </svg>
  )
}

interface LogRow {
  kind: TempKind
  t: number
  distinct: number
  engine: string
}

export default function Room4Temperature({ onSolved }: { onSolved: (s: RoomStats) => void }) {
  const [found, setFound] = useState<string[]>([])
  const [look, setLook] = useState<{ title: string; text: string; card: { label: string; text: string }; fresh: boolean } | null>(null)
  const [kind, setKind] = useState<TempKind>('record')
  const [t, setT] = useState(0)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<TempResult | null>(null)
  const [lastTitle, setLastTitle] = useState<TempResult | null>(null)
  const [lastRecord, setLastRecord] = useState<TempResult | null>(null)
  const [log, setLog] = useState<LogRow[]>([])
  const [value, setValue] = useState('')
  const [recordOpen, setRecordOpen] = useState(false)
  const [titleOpen, setTitleOpen] = useState(false)
  const [tries, setTries] = useState(0)
  const [hints, setHints] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [good, setGood] = useState(false)
  const [burst, setBurst] = useState<{ text: string; bad: boolean } | null>(null)
  const burstTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(burstTimer.current), [])
  const [calm, setCalm] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  const solved = recordOpen && titleOpen
  const mood = moodOf(t)
  const askedRecordCold = log.some((l) => l.kind === 'record' && l.t <= 0.3)

  function stamp(text: string, bad: boolean) {
    setBurst({ text, bad })
    clearTimeout(burstTimer.current)
    burstTimer.current = setTimeout(() => setBurst(null), 1800)
  }

  function finish(nextRecord: boolean, nextTitle: boolean, nextTries: number) {
    if (nextRecord && nextTitle) onSolved({ tries: nextTries, hints })
  }

  function inspect(i: number) {
    const s = SPOTS[i]
    const fresh = !found.includes(s.id)
    if (fresh) setFound((p) => [...p, s.id])
    setLook({ title: s.label, text: s.note, card: s.card, fresh })
  }

  async function ask() {
    if (busy) return
    setBusy(true)
    setFeedback('')
    const n = tries + 1
    setTries(n)
    try {
      const r = await askTemperature(kind, t, log.filter((l) => l.kind === kind).length)
      setResult(r)
      if (r.kind === 'title') setLastTitle(r)
      else setLastRecord(r)
      setLog((p) => [...p, { kind: r.kind, t: r.temperature, distinct: r.distinct, engine: r.engine }])
      stamp(r.distinct === 1 ? '셋 다 같음!' : r.distinct === 3 ? '셋 다 다름!' : '둘이 같음!', false)
    } finally {
      setBusy(false)
    }
  }

  async function tryRecord() {
    if (busy || recordOpen || value.trim() === '') return
    setBusy(true)
    const n = tries + 1
    setTries(n)
    try {
      const r = await checkRecord(value)
      if (r.correct) {
        setRecordOpen(true)
        setGood(true)
        setFeedback('철컥. 기록 자물쇠가 열렸습니다. 조절기의 답이 아니라 점검표의 숫자가 맞았습니다.')
        stamp('철컥!', false)
        finish(true, titleOpen, n)
      } else {
        setGood(false)
        // 조절기가 방금 한 답을 그대로 넣었다면 그 점을 짚어 준다
        const echoed = lastRecord?.numbers?.includes(Number(value.replace(/\D/g, '')))
        setFeedback(echoed ? '삐빅. 조절기가 자신 있게 되풀이한 답이라고 맞는 답은 아닙니다. 조절기는 점검표를 받은 적이 없습니다. 보존실 어딘가에 기록이 있습니다.' : r.note)
        stamp('삐빅!', true)
      }
    } finally {
      setBusy(false)
    }
  }

  function hangTitles() {
    if (!lastTitle || titleOpen) return
    const n = tries + 1
    setTries(n)
    if (lastTitle.pass) {
      setTitleOpen(true)
      setGood(true)
      setFeedback('철컥. 창작 자물쇠가 열렸습니다. 서로 다른 제목 세 개가 걸렸습니다.')
      stamp('철컥!', false)
      finish(recordOpen, true, n)
      return
    }
    setGood(false)
    stamp('삐빅!', true)
    if (lastTitle.distinct < 3) setFeedback(`삐빅. 서로 다른 제목이 ${lastTitle.distinct}개뿐입니다. 온도가 낮으면 같은 제목이 되풀이됩니다.`)
    else setFeedback('삐빅. 낱말 "빛"이 빠진 제목이 있습니다. 온도가 너무 높으면 부탁한 조건에서 벗어납니다.')
  }

  const step = solved ? 4 : !askedRecordCold && !recordOpen ? 1 : !recordOpen ? 2 : 3
  let coach = '다이얼을 0에 두고 보존 온도를 세 번 물어보세요. 그다음 다이얼을 올려 다시 물어 답이 어떻게 달라지는지 보세요.'
  if (solved) coach = '탈출 준비 끝. 온도는 답의 다양성을 바꿀 뿐, 맞는 답을 만들어 주지는 않습니다.'
  else if (recordOpen) coach = '이제 창작 자물쇠입니다. 질문을 "전시 제목 짓기"로 바꾸고, 서로 다른 제목 세 개가 나오는 온도를 찾아 거세요.'
  else if (askedRecordCold && !found.includes('drawer')) coach = '조절기는 세 번 다 같은 답을 했습니다. 그런데 조절기는 점검표를 받은 적이 없습니다. 보존실을 뒤져 기록을 찾으세요.'
  else if (found.includes('drawer')) coach = '점검표를 찾았습니다. 조절기의 답과 점검표의 숫자 중 무엇을 기록 자물쇠에 넣어야 할까요?'

  return (
    <div className="proto">
      <Mission
        goal={
          <>
            조절기의 다이얼을 돌려 가며 물어 <mark>자물쇠 두 개</mark>를 여세요.
          </>
        }
        steps={['같은 질문을 세 번 묻기', '기록 자물쇠: 맞는 보존 온도', '창작 자물쇠: 서로 다른 제목 세 개']}
        step={step}
        why="temperature는 AI가 다음 낱말을 고를 때 얼마나 모험할지 정하는 값입니다. 정확한 일과 다양한 일에 맞는 값이 다릅니다."
      />

      <div className="proto-body cards-first">
        <div className="room">
          <div className="suspect-bar">
            <div className="suspect-now">
              <b>모락</b> <span className="muted">보존실 조절기 AI · 다이얼 {t.toFixed(1)}</span>
              <div className="mood" role="status">
                {MOOD_TEXT[mood]}
              </div>
            </div>
            <div className="sound">
              <span className={recordOpen ? 'pill ok' : 'pill plan'}>기록 자물쇠 {recordOpen ? '열림' : '잠김'}</span>
              <span className={titleOpen ? 'pill ok' : 'pill plan'}>창작 자물쇠 {titleOpen ? '열림' : '잠김'}</span>
            </div>
          </div>

          <div className="room-scene">
            <div className={calm ? 'gallery lab calm' : 'gallery lab'}>
              <span className="gallery-tube" aria-hidden="true" />
              <div className="gallery-stage">
                <Device t={t} mood={mood} busy={busy} />
              </div>
              <p className="gallery-mood">{MOOD_TEXT[mood]}</p>
              {burst && <span className={burst.bad ? 'burst' : 'burst ok'}>{burst.text}</span>}
              <div className="gallery-objs" role="group" aria-label="보존실에서 살펴볼 곳">
                {SPOTS.map((s, i) => (
                  <button key={s.id} type="button" className={found.includes(s.id) ? 'obj done' : 'obj'} onClick={() => inspect(i)}>
                    <svg viewBox="0 0 40 40" aria-hidden="true">
                      <path d={s.icon} />
                    </svg>
                    <span>
                      {found.includes(s.id) ? '✓ ' : ''}
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="scene-bar">
              <span>
                <b>보존실</b> <span className="muted">살펴본 곳 {found.length} / {SPOTS.length}</span>
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
                  <div className={look.fresh ? 'found-card fresh' : 'found-card'}>
                    <span className="mono">{look.fresh ? '새로 찾음' : '이미 본 것'}</span>
                    <b>{look.card.label}</b>
                    <span>{look.card.text}</span>
                  </div>
                </>
              ) : (
                <p className="muted">보존실을 눌러 살펴보세요. 조절기가 모르는 기록이 어딘가에 있어요.</p>
              )}
            </div>
          </div>

          <div className="room-act">
            <div className="dial">
              <div className="dial-q" role="group" aria-label="조절기에게 물을 것">
                <button type="button" className="toggle" aria-pressed={kind === 'record'} onClick={() => setKind('record')}>
                  보존 온도 묻기
                </button>
                <button type="button" className="toggle" aria-pressed={kind === 'title'} onClick={() => setKind('title')}>
                  전시 제목 짓기
                </button>
              </div>
              <label className="dial-range">
                <span>
                  다이얼 (temperature) <b className="mono">{t.toFixed(1)}</b>
                </span>
                <input type="range" min={0} max={2} step={0.1} value={t} onChange={(e) => setT(Number(e.target.value))} aria-valuetext={`${t.toFixed(1)}. ${MOOD_TEXT[mood]}`} />
                <span className="dial-ends" aria-hidden="true">
                  <span>0 꼿꼿</span>
                  <span>1</span>
                  <span>2 들뜸</span>
                </span>
              </label>
              <div className="dial-presets" role="group" aria-label="다이얼 빠른 선택">
                {[0, 0.5, 1, 1.5, 2].map((v) => (
                  <button key={v} type="button" className="toggle" aria-pressed={t === v} onClick={() => setT(v)}>
                    {v.toFixed(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="dlg" role="status" aria-busy={busy}>
              <span className="dlg-name">조절기 모락 · 같은 질문 세 번</span>
              <p className="stmt">“{QUESTIONS[kind]}”</p>
              {busy ? (
                <p className="muted">모락이 세 번 답하는 중…</p>
              ) : result && result.kind === kind ? (
                <>
                  <ol className="triple">
                    {result.answers.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ol>
                  <p className="dlg-cite">
                    <span className={result.distinct === 1 ? 'pill plan' : 'pill need'}>
                      {result.distinct === 1 ? '세 답이 모두 같음' : `서로 다른 답 ${result.distinct}개`}
                    </span>
                    <span className="chip">다이얼 {result.temperature.toFixed(1)}</span>
                    <span className="chip">{result.engine === 'gemini' ? `${modelName(result.model)}가 세 번 답함 · 같은지는 코드가 비교` : '대본으로 답함'}</span>
                  </p>
                  {result.engine === 'gemini' && (
                    <p className="model-note muted">
                      이 방만 다이얼(temperature)을 받는 모델이 답해요. 다른 방의 Gemini 3.5 Flash-Lite는 다이얼 값을 무시하거든요.
                    </p>
                  )}
                </>
              ) : (
                <p className="muted">아직 묻지 않았어요. 다이얼을 정하고 아래 단추를 누르세요.</p>
              )}
            </div>
            <div className="choices">
              <button type="button" className="act" disabled={busy || solved} onClick={() => void ask()}>
                세 번 묻기
              </button>
              {!usingMock && <p className="privacy-note">다이얼 값과 답은 분석에 쓰여요.</p>}
            </div>

            <div className="locks">
              <div className={recordOpen ? 'lock open' : 'lock'}>
                <b>기록 자물쇠</b>
                <span className="muted">작품 '새벽 등대'의 보존 온도</span>
                <div className="lock-row">
                  <input inputMode="numeric" maxLength={3} value={value} onChange={(e) => setValue(e.target.value)} placeholder="숫자" aria-label="보존 온도" disabled={recordOpen} />
                  <span>도</span>
                  <button className="btn" type="button" disabled={busy || recordOpen || value.trim() === ''} onClick={() => void tryRecord()}>
                    {recordOpen ? '열림' : '넣어 보기'}
                  </button>
                </div>
              </div>
              <div className={titleOpen ? 'lock open' : 'lock'}>
                <b>창작 자물쇠</b>
                <span className="muted">"빛"이 들어간 서로 다른 제목 세 개</span>
                <div className="lock-row">
                  <span className="lock-titles">{lastTitle ? lastTitle.answers.join(' · ') : '아직 지은 제목 없음'}</span>
                  <button className="btn" type="button" disabled={busy || titleOpen || !lastTitle} onClick={hangTitles}>
                    {titleOpen ? '열림' : '이 세 개 걸기'}
                  </button>
                </div>
              </div>
              <div className={good ? 'verdict good' : 'verdict bad'} role="status">
                {feedback}
              </div>
            </div>

            <Coach className="in-room" text={coach} hints={HINTS} opened={hints} onOpen={() => setHints((h) => Math.min(h + 1, HINTS.length))} done={solved} />
          </div>
        </div>

        <aside className="side">
          {/* 넓은 화면에서는 다음 수 안내를 스크롤을 따라오는 오른쪽 칸 맨 위에 둔다 */}
          <div className="side-coach">
            <Coach text={coach} hints={HINTS} opened={hints} onOpen={() => setHints((h) => Math.min(h + 1, HINTS.length))} done={solved} />
          </div>
          <div>
            <h3>
              실험 기록 <span className="mono muted">{log.length}회</span>
            </h3>
            <p>다이얼을 바꿔 가며 물은 결과입니다. 서로 다른 답이 몇 개였는지 비교해 보세요.</p>
            {log.length > 0 && (
              <table className="fit log-table">
                <thead>
                  <tr>
                    <th>질문</th>
                    <th>다이얼</th>
                    <th>다른 답</th>
                  </tr>
                </thead>
                <tbody>
                  {log.map((l, i) => (
                    <tr key={i}>
                      <td>{l.kind === 'record' ? '보존 온도' : '제목'}</td>
                      <td className="mono">{l.t.toFixed(1)}</td>
                      <td className="mono">{l.distinct} / 3</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div>
            <h3>찾은 기록</h3>
            {found.length === 0 ? (
              <p>아직 없습니다.</p>
            ) : (
              <div className="cards">
                {SPOTS.filter((s) => found.includes(s.id)).map((s) => (
                  <div key={s.id} className="record">
                    <p>
                      <b>{s.card.label}</b>
                      <br />
                      {s.card.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
