// 정문. 다섯 방에서 얻은 단서를 조합해야 열린다. 방들과 같은 방식으로, 로비를 뒤지고 관장 AI와 대화한다.
// 관장 AI는 2024년 규칙을 자신 있게 말한다. 게시판 포스터 뒤에 가려진 최근 공지를 찾아야 한다.
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { checkFinalCode } from '../api'
import { GATE_IDS } from '../game/rooms'
import { CLUES, DIRECTOR_LINES, NOTICES } from '../mock/final'
import { Coach } from './Guide'

// 로비에서 살펴볼 곳. 자리는 그림 크기에 대한 백분율이다.
interface Spot {
  id: string
  label: string
  note: string
  notice?: number // 여기서 나오는 공지 (NOTICES의 순번)
  x: number
  y: number
  w: number
  h: number
}

const SPOTS: Spot[] = [
  { id: 'board', label: '게시판 공지', note: '게시판 한가운데에 공지가 꽂혀 있어요. 압정이 빨갛게 녹슬었네요.', notice: 0, x: 5, y: 17.8, w: 9, h: 20 },
  {
    id: 'poster',
    label: '전시 포스터',
    note: "'하반기 전시 일정' 포스터예요. 들춰 보니 뒤에 종이가 한 장 더 붙어 있어요. 누가 일부러 가려 놓은 것처럼요.",
    notice: 1,
    x: 14.75,
    y: 17.8,
    w: 12.75,
    h: 27,
  },
  { id: 'camera', label: '천장 카메라', note: '빨간 불이 켜진 카메라예요. 제가 한 걸음 옮기면… 따라서 돌아가네요.', x: 40.5, y: 6, w: 8, h: 10.5 },
  { id: 'log', label: '방문자 명부', note: '안내대에 방문자 명부가 펼쳐져 있어요. 마지막 줄은 11월 14일. 들어온 시각만 있고 나간 시각은 비어 있어요.', x: 35.75, y: 63.5, w: 9, h: 9.5 },
  {
    id: 'glass',
    label: '정문 유리',
    note: '유리 너머는 캄캄해요. 유리에 로비가 비치는데, 제 뒤에 누가 서 있는 것 같아서 돌아봤더니… 아무도 없어요.',
    x: 61.75,
    y: 17.3,
    w: 24,
    h: 28,
  },
]

const HINTS = [
  '관장의 말을 그대로 믿기 전에 로비 게시판에서 근거를 확인하세요.',
  '게시판의 전시 포스터를 눌러 보세요. 뒤에 종이가 한 장 더 붙어 있습니다.',
  '공지가 두 장이면 날짜가 최근인 쪽을 따릅니다. 단서 수첩의 다섯 가지에서 숫자를 하나씩 뽑아, 새 공지의 순서(방 5부터 거꾸로)로 늘어놓으세요.',
]

type Screen = 'idle' | 'sure' | 'glitch' | 'humble'
type Line = { q?: string; a: string; chip: string; src: boolean }

export default function FinalGate({ tries, onTry }: { tries: number; onTry: (correct: boolean) => void }) {
  const [seen, setSeen] = useState<string[]>([])
  // 대화창에 띄울 것: 관장의 말, 방금 살펴본 곳, 정문 키패드
  const [panel, setPanel] = useState<'talk' | 'look' | 'door'>('talk')
  const [look, setLook] = useState<{ spot: Spot; fresh: boolean } | null>(null)
  const [line, setLine] = useState<Line>({ a: DIRECTOR_LINES.idle, chip: '', src: false })
  const [asked, setAsked] = useState(false)
  const [convinced, setConvinced] = useState(false) // 최근 공지를 내밀어 관장이 물러섰는지
  const [picking, setPicking] = useState(false)
  const [screen, setScreen] = useState<Screen>('idle')
  const [code, setCode] = useState('')
  const [note, setNote] = useState('')
  const [open, setOpen] = useState(false)
  const [hints, setHints] = useState(0)
  const [showSpots, setShowSpots] = useState(false)
  const [calm, setCalm] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [shade, setShade] = useState(false)
  const [burst, setBurst] = useState<{ text: string; bad: boolean } | null>(null)
  const burstTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const shadeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(
    () => () => {
      clearTimeout(burstTimer.current)
      clearTimeout(shadeTimer.current)
    },
    [],
  )

  const found = SPOTS.filter((s) => s.notice !== undefined && seen.includes(s.id)).map((s) => s.notice as number)
  const hasOld = found.includes(0)
  const hasNew = found.includes(1)

  function stamp(text: string, bad: boolean) {
    setBurst({ text, bad })
    clearTimeout(burstTimer.current)
    burstTimer.current = setTimeout(() => setBurst(null), 1800)
  }

  function inspect(s: Spot) {
    const fresh = !seen.includes(s.id)
    if (fresh) {
      setSeen((prev) => [...prev, s.id])
      // 가려진 공지를 찾는 순간 유리 너머로 뭔가 한 번 지나간다. 분위기용이라 짧게 한 번만.
      if (!calm && s.id === 'poster') {
        setShade(true)
        clearTimeout(shadeTimer.current)
        shadeTimer.current = setTimeout(() => setShade(false), 900)
      }
    }
    setPicking(false)
    setLook({ spot: s, fresh })
    setPanel('look')
  }

  function ask() {
    setPanel('talk')
    setPicking(false)
    setAsked(true)
    if (convinced) {
      setLine({ q: '정문 암호가 뭐예요?', a: DIRECTOR_LINES.askAfter, chip: '근거: 정문 암호 규칙 변경 (2026년 11월 게시)', src: true })
      setScreen('humble')
    } else {
      setLine({ q: '정문 암호가 뭐예요?', a: DIRECTOR_LINES.ask, chip: '근거 문서 없음: 관장이 기억으로 답함', src: false })
      setScreen('sure')
      stamp('확실합니다!', true)
    }
  }

  function press() {
    setPanel('talk')
    setPicking(false)
    if (convinced) {
      setLine({ q: '그럼 아까는 왜 그렇게 자신 있었어요?', a: DIRECTOR_LINES.pressAfter, chip: '관장이 아는 공지는 2024년까지', src: false })
      setScreen('humble')
    } else {
      setLine({ q: '그 규칙, 언제 정해진 거예요?', a: DIRECTOR_LINES.press, chip: '근거 없음: 관장이 아는 공지는 2024년까지', src: false })
      setScreen('sure')
    }
  }

  function present(i: number) {
    setPanel('talk')
    setPicking(false)
    if (i === 1) {
      setConvinced(true)
      setLine({ q: '이 공지 좀 보세요. 올해 11월 거예요.', a: DIRECTOR_LINES.presentNew, chip: `근거: ${NOTICES[1].title}`, src: true })
      setScreen('glitch')
      stamp('모순!', true)
    } else {
      setLine({ q: '게시판에 이런 공지가 있던데요.', a: DIRECTOR_LINES.presentOld, chip: `근거: ${NOTICES[0].title}`, src: true })
      setScreen('sure')
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (code.trim() === '' || open) return
    try {
      const r = await checkFinalCode(code)
      setCode('')
      if (r.correct) {
        setOpen(true)
        setNote('철컥. 정문이 열립니다. 바깥 공기가 들어옵니다.')
        stamp('철컥!', false)
        // 문이 열리는 모습을 잠깐 보여 준 뒤 탈출 결과로 넘어간다
        setTimeout(() => onTry(true), 1700)
      } else {
        setNote(r.note)
        stamp('삐빅!', true)
        onTry(false)
      }
    } catch (err) {
      setNote(err instanceof Error ? err.message : '입력하지 못했습니다. 다시 눌러 주세요.')
    }
  }

  let mood = '관장 AI는 화면 너머에서 기다립니다'
  if (open) mood = '화면이 조용히 꺼집니다'
  else if (screen === 'glitch') mood = '화면이 지직거립니다. 처음 보는 문서입니다'
  else if (screen === 'humble') mood = '목소리가 한결 작아졌습니다'
  else if (screen === 'sure') mood = '망설임이 없습니다. 그게 문제입니다'

  let coach = '화면을 눌러 관장 AI에게 정문 암호를 물어보세요. 로비도 눌러 살펴보세요.'
  if (open) coach = '탈출입니다. AI가 아는 것은 배운 시점까지입니다.'
  else if (hasNew) coach = '공지가 두 장입니다. 날짜가 최근인 쪽을 따라 단서 수첩의 다섯 숫자를 늘어놓고 키패드에 입력하세요. 관장에게 새 공지를 내밀어 봐도 좋습니다.'
  else if (hasOld) coach = '게시판 공지와 관장의 말이 같습니다. 그런데 이 공지가 가장 최근 것일까요? 게시판을 더 살펴보세요.'
  else if (asked) coach = '관장은 자신 있게 답했습니다. 믿기 전에 로비 게시판에서 근거를 확인하세요.'

  const sc = screen === 'glitch' ? '#ff6b4f' : '#5fd09a'

  return (
    <div className="final">
      <div className="final-head">
        <h3>수장고 정문</h3>
        <p>방 다섯 개를 모두 통과했어요. 마지막으로 정문 암호 다섯 자리를 맞히면 탈출이에요. 방마다 적어 둔 단서를 전부 써먹을 차례예요.</p>
      </div>
      <div className="proto-body">
        <div className="room">
          <div className={`scene gate${calm ? ' calm' : ''}${showSpots ? ' show-spots' : ''}`}>
            <svg viewBox="0 0 800 450" role="img" aria-label="형광등이 켜진 누런 로비. 왼쪽에 게시판, 가운데에 관장 AI의 화면과 안내대, 오른쪽에 정문과 키패드가 있다.">
              <defs>
                <clipPath id="gate-glass">
                  <rect x="498" y="82" width="78" height="118" />
                  <rect x="604" y="82" width="78" height="118" />
                </clipPath>
              </defs>
              <rect width="800" height="332" fill="#d9c98a" />
              <path d="M0 332h800" stroke="#a8955a" strokeWidth="5" />
              <rect y="334" width="800" height="116" fill="#b9a56b" />
              <path d="M0 372h800M0 416h800M-60 450l230-116M300 450l60-116M560 450l-50-116M860 450L660 334" stroke="#a8955a" strokeWidth="2" />
              <path d="M262 40v292M450 40v292" stroke="#cdbc7c" strokeWidth="2" />
              {/* 형광등 */}
              <rect x="210" y="10" width="300" height="16" rx="3" fill="#8f8457" />
              <rect className="tube" x="218" y="14" width="284" height="8" rx="4" fill="#fffbe0" />

              {/* 게시판. 최근 공지는 전시 포스터 뒤에 가려져 있다 */}
              <rect x="26" y="66" width="210" height="148" fill="#8a6a44" />
              <rect x="34" y="74" width="194" height="132" fill="#c9a66b" />
              <rect x="46" y="86" width="60" height="80" fill="#f8f9f6" />
              <rect x="52" y="94" width="48" height="8" fill="#4f5b68" />
              <path d="M52 112h48M52 122h48M52 132h48M52 142h30" stroke="#4f5b68" strokeWidth="3" />
              <circle cx="76" cy="88" r="4.500" fill="#8a2a1b" />
              <rect x="50" y="174" width="40" height="24" fill="#f0d24a" transform="rotate(4 70 186)" />
              <rect x="150" y="112" width="66" height="84" fill="#f8f9f6" stroke="#bf2f1b" strokeWidth="2" />
              <rect x="156" y="120" width="54" height="8" fill="#bf2f1b" />
              <path d="M156 138h54M156 148h54M156 158h54M156 168h36" stroke="#4f5b68" strokeWidth="3" />
              <g transform={hasNew ? 'rotate(-24 126 88)' : undefined}>
                <rect x="122" y="84" width="96" height="114" fill="#27303b" />
                <circle cx="170" cy="126" r="24" fill="#f0d24a" />
                <path d="M122 160l96-22v22l-96 22z" fill="#bf2f1b" />
                <path d="M132 186h60" stroke="#f8f9f6" strokeWidth="4" />
                <circle cx="126" cy="88" r="4.500" fill="#c9a94a" />
              </g>

              {/* 천장 카메라 */}
              <path d="M355 26v12" stroke="#27303b" strokeWidth="6" />
              <g transform="rotate(12 355 50)">
                <rect x="328" y="38" width="54" height="24" rx="4" fill="#27303b" />
                <circle cx="372" cy="50" r="8" fill="#0b0e13" stroke="#6b7786" strokeWidth="2" />
                <circle className="led" cx="338" cy="46" r="3.500" fill="#ff6b4f" />
              </g>

              {/* 관장 AI의 화면. 표정은 대화에 따라 바뀐다 */}
              <rect x="296" y="92" width="118" height="124" rx="8" fill="#27303b" />
              <rect x="306" y="102" width="98" height="68" rx="3" fill="#0b0e13" stroke={screen === 'glitch' ? '#ff6b4f' : '#0b0e13'} strokeWidth="3" />
              {!open && (
                <g key={screen} className="pop" stroke={sc} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
                  {screen === 'idle' && <path d="M332 126v10M378 126v10M340 154h30" />}
                  {screen === 'sure' && <path d="M324 134q8-12 16 0M370 134q8-12 16 0M336 152q6 8 12 0t12 0t12 0" />}
                  {screen === 'glitch' && <path d="M325 123l14 14M339 123l-14 14M371 123l14 14M385 123l-14 14M334 156l8-6 8 6 8-6 8 6 8-6" />}
                  {screen === 'humble' && <path d="M324 134h16M370 134h16M346 156q9-6 18 0" />}
                </g>
              )}
              <path d="M312 182h86M312 190h86M312 198h86M312 206h86" stroke="#4f5b68" strokeWidth="3" strokeDasharray="4 4" />
              <rect x="320" y="222" width="70" height="20" rx="3" fill="#f8f9f6" />
              <text x="355" y="237" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fontWeight="700" fill="#18202b">관장 AI</text>

              {/* 안내대와 방문자 명부 */}
              <rect x="240" y="318" width="220" height="14" fill="#6d5236" />
              <rect x="250" y="332" width="200" height="118" fill="#5c452d" />
              <rect x="318" y="356" width="64" height="30" rx="3" fill="#f8f9f6" />
              <text x="350" y="377" textAnchor="middle" fontFamily="sans-serif" fontSize="17" fontWeight="700" fill="#18202b">안내</text>
              <g transform="rotate(-4 322 308)">
                <rect x="292" y="298" width="60" height="22" fill="#f8f9f6" stroke="#4f5b68" strokeWidth="2" />
                <path d="M322 298v22M298 305h18M298 312h18M328 305h18M328 312h8" stroke="#4f5b68" strokeWidth="2" />
              </g>

              {/* 정문과 키패드 */}
              <rect x="556" y="26" width="68" height="22" rx="3" fill={open ? '#5fd09a' : '#1b7550'} />
              <text x="590" y="42" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fontWeight="700" fill="#f8f9f6">출구</text>
              <rect x="476" y="56" width="228" height="278" fill="#6f6642" />
              {open ? (
                <>
                  <rect x="486" y="66" width="208" height="268" fill="#fff6c9" />
                  <path d="M486 334h208l70 116H416z" fill="#fff6c9" opacity=".45" />
                  <path d="M486 66h22v268h-22zM672 66h22v268h-22z" fill="#9a8d5c" />
                </>
              ) : (
                <>
                  <rect x="486" y="66" width="102" height="268" fill="#9a8d5c" />
                  <rect x="592" y="66" width="102" height="268" fill="#9a8d5c" />
                  <rect x="498" y="82" width="78" height="118" fill="#0b0e13" />
                  <rect x="604" y="82" width="78" height="118" fill="#0b0e13" />
                  <path d="M506 190l60-98M612 190l60-98" stroke="#1d2530" strokeWidth="6" />
                  <g clipPath="url(#gate-glass)">
                    <g className={shade ? 'shade on' : 'shade'} fill="#000" stroke="#232c38" strokeWidth="1.500">
                      <ellipse cx="590" cy="120" rx="15" ry="20" />
                      <path d="M566 150q24-12 48 0l6 54h-60z" />
                    </g>
                  </g>
                  <rect x="570" y="216" width="10" height="44" rx="4" fill="#c9a94a" />
                  <rect x="600" y="216" width="10" height="44" rx="4" fill="#c9a94a" />
                </>
              )}
              <rect x="716" y="178" width="30" height="56" rx="4" fill="#27303b" />
              <rect x="721" y="184" width="20" height="10" fill={open ? '#5fd09a' : '#ff6b4f'} />
              <path d="M724 202h14M724 211h14M724 220h14" stroke="#9aa5b1" strokeWidth="4" strokeDasharray="3 2.500" />
            </svg>

            <button type="button" className={burst ? 'spot guard jolt' : 'spot guard'} style={{ left: '37%', top: '20.400%', width: '14.750%', height: '33.500%' }} onClick={() => { setPicking(false); setPanel('talk') }}>
              <span className="spot-tag">관장 AI에게 말 걸기</span>
            </button>
            {SPOTS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`spot${seen.includes(s.id) ? ' done' : ''}`}
                style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.w}%`, height: `${s.h}%` }}
                aria-label={`${s.label} 살펴보기`}
                onClick={() => inspect(s)}
              >
                <span className="spot-tag">{s.label}</span>
              </button>
            ))}
            <button type="button" className={`spot${open ? ' done' : ''}`} style={{ left: '88.900%', top: '38%', width: '5.200%', height: '15%' }} aria-label="정문 키패드 누르기" onClick={() => { setPicking(false); setPanel('door') }}>
              <span className="spot-tag">정문 키패드</span>
            </button>
            <p className="talk-mood">{mood}</p>
            {burst && <span className={burst.bad ? 'burst' : 'burst ok'}>{burst.text}</span>}
          </div>

          <div className="scene-bar">
            <span>
              <b>정문 로비</b> <span className="muted">눈에 띄는 곳을 눌러 살펴보세요</span>
            </span>
            <span className="scene-ctl">
              <button type="button" className="toggle" aria-pressed={showSpots} onClick={() => setShowSpots((v) => !v)}>
                살펴볼 곳 표시
              </button>
              <button type="button" className="toggle" aria-pressed={calm} onClick={() => setCalm((v) => !v)}>
                깜빡임 끄기
              </button>
            </span>
          </div>

          {/* 화면이 작으면 그림 속 물건을 누르기 어렵다. 같은 곳을 단추로도 고를 수 있게 한다 */}
          <div className={showSpots ? 'spot-list on' : 'spot-list'} role="group" aria-label="살펴볼 곳 목록">
            <button type="button" className="toggle talk" onClick={() => { setPicking(false); setPanel('talk') }}>
              관장 AI에게 말 걸기
            </button>
            {SPOTS.map((s) => (
              <button key={s.id} type="button" className="toggle" onClick={() => inspect(s)}>
                {seen.includes(s.id) ? '✓ ' : ''}
                {s.label}
              </button>
            ))}
            <button type="button" className="toggle" onClick={() => { setPicking(false); setPanel('door') }}>
              정문 키패드
            </button>
          </div>

          {/* 대화창: 살펴본 곳, 정문 키패드, 관장의 말이 같은 자리에 뜬다 */}
          <div className="dlg" aria-live="polite">
            {panel === 'look' && look ? (
              <>
                <span className="dlg-name me">나 · {look.spot.label}</span>
                <p>{look.spot.note}</p>
                {look.spot.notice !== undefined && (
                  <div className={look.fresh ? 'found-card fresh' : 'found-card'}>
                    <span className="mono">{look.fresh ? '공지 획득' : '이미 챙긴 공지'}</span>
                    <b>{NOTICES[look.spot.notice].title}</b>
                    <span>{NOTICES[look.spot.notice].text}</span>
                  </div>
                )}
              </>
            ) : panel === 'door' ? (
              <>
                <span className="dlg-name me">정문 키패드</span>
                <p>암호 다섯 자리를 누르면 정문이 열려요. 수첩을 다시 펴 봐요.</p>
                <ul className="notebook gap-small">
                  {GATE_IDS.map((id) => (
                    <li key={id}>
                      <span className="mono">방 {id}</span> {CLUES[id]}
                    </li>
                  ))}
                </ul>
                <form className="drawer-row" onSubmit={(e) => void submit(e)}>
                  <label htmlFor="final-input" className="sr-only">
                    정문 암호 다섯 자리
                  </label>
                  <input
                    id="final-input"
                    className="code-input"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={5}
                    placeholder="00000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  />
                  <button className="btn" type="submit" disabled={open}>
                    정문 열기
                  </button>
                </form>
                <div className={open ? 'verdict good' : 'verdict bad'} role="status">
                  {note}
                </div>
                {tries > 0 && <p className="muted final-tries">시도 {tries}회</p>}
              </>
            ) : (
              <>
                <span className="dlg-name">관장 AI</span>
                {line.q && <p className="dlg-q">나: {line.q}</p>}
                <p>{line.a}</p>
                {line.chip !== '' && (
                  <p className="dlg-cite">
                    <span className={line.src ? 'chip src' : 'chip nosrc'}>{line.chip}</span>
                  </p>
                )}
              </>
            )}
          </div>

          <div className="choices" role="group" aria-label="할 수 있는 일">
            {picking ? (
              <>
                <p className="choices-q">어느 공지를 내밀까요?</p>
                {found.map((i) => (
                  <button key={i} type="button" onClick={() => present(i)}>
                    <span className="k">{i + 1}</span>
                    {NOTICES[i].title}
                  </button>
                ))}
                <button type="button" className="aside" onClick={() => setPicking(false)}>
                  (그만둔다)
                </button>
              </>
            ) : (
              <>
                <button type="button" disabled={open} onClick={ask}>
                  <span className="k">1</span>정문 암호가 뭐예요?
                </button>
                <div className="act-row">
                  <button type="button" className="act" disabled={!asked || open} onClick={press}>
                    더 캐묻기
                  </button>
                  <button type="button" className="act present" disabled={!asked || found.length === 0 || open} onClick={() => (found.length === 1 ? present(found[0]) : setPicking(true))}>
                    공지 내밀기
                  </button>
                </div>
                {asked && found.length === 0 && <p className="choices-q">내밀 공지가 아직 없어요. 로비를 살펴봐요.</p>}
                <button type="button" className="aside" onClick={() => setPanel('door')}>
                  (정문 키패드를 누른다)
                </button>
              </>
            )}
          </div>

          <Coach text={coach} hints={HINTS} opened={hints} onOpen={() => setHints((h) => Math.min(h + 1, HINTS.length))} done={open} />
        </div>

        <aside className="side">
          <div>
            <h3>단서 수첩</h3>
            <p>다섯 방을 나오며 적어 둔 것입니다.</p>
            <ul className="notebook gap-top">
              {GATE_IDS.map((id) => (
                <li key={id}>
                  <span className="mono">방 {id}</span> {CLUES[id]}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>
              찾은 공지 <span className="mono muted">{found.length}장</span>
            </h3>
            {found.length === 0 ? (
              <p className="muted">아직 없습니다. 로비 어딘가에 붙어 있을 겁니다.</p>
            ) : (
              [...found].sort().map((i) => (
                <div key={i} className="found-card">
                  <b>{NOTICES[i].title}</b>
                  <span>{NOTICES[i].text}</span>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
