// 방 3 · 서가의 방 (자료실)
// 자료실을 뒤져 검색에 쓸 낱말을 찾고, 사서 고 선생에게 찾아 달라고 한다.
// 검색어로 문서를 찾으면 앞의 3건만 사서에게 전달된다. 사서는 그 문서만 근거로 답한다.
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { checkDoorCode, searchLibrary, usingMock } from '../api'
import type { MockNet } from '../api'
import type { RoomStats } from '../game/progress'
import { DOC_COUNT, TOP_K, pressLine } from '../mock/room3'
import type { SearchResult } from '../types'
import Archive from './Archive'
import type { ArchiveSpot } from './Archive'
import { BookFlip } from './Bookshelf'
import { Coach, Mission } from './Guide'
import Portrait from './Portrait'
import type { Face } from './Portrait'

const MAX_DOOR = 5
const MAX_QUERY = 40
const FLIP_MS = 1100 // 책장 넘기는 그림이 보이는 최소 시간. 움직임 줄이기 설정이면 기다리지 않는다
const BASE_WORDS = ['비상문', '비밀번호'] // 처음부터 아는 낱말

// 자료실에서 살펴볼 곳. 자리는 그림 크기에 대한 백분율이다.
const SPOTS: ArchiveSpot[] = [
  {
    id: 'sticker',
    label: '비상문에 붙은 스티커',
    note: '문에 노란 스티커가 붙어 있어요. "비밀번호 변경됨. 시설 관리 공지 참고." 언제 붙인 건지는 안 적혀 있네요.',
    word: '변경',
    x: 2.5,
    y: 26,
    w: 9,
    h: 14,
  },
  {
    id: 'photo',
    label: '벽에 걸린 사진',
    note: '개관 기념 사진이에요. 연도가 적힌 자리만 바래서 안 보여요. 그런데 사진 속 사람들이… 전부 이쪽을 보고 있네요.',
    word: '개관',
    x: 23.5,
    y: 12.5,
    w: 13.5,
    h: 18,
  },
  {
    id: 'mug',
    label: '머그잔',
    note: '식은 커피예요. 잔 밑에 쪽지가 깔려 있어요. "휴게실 간식 채워 둠." 고 선생도 간식은 먹나 봐요.',
    word: '휴게실',
    x: 16.5,
    y: 62.5,
    w: 5.5,
    h: 10,
  },
  {
    id: 'memo',
    label: '대출대 위 메모',
    note: `고 선생의 근무 수칙이에요. "검색된 문서는 앞에서 ${TOP_K}건까지만 읽을 것. 순서는 오래된 것부터."`,
    memo: `고 선생은 검색된 문서 중 앞의 ${TOP_K}건만 읽는다. 오래된 문서가 앞이다.`,
    x: 38.2,
    y: 63,
    w: 6,
    h: 10,
  },
  {
    id: 'shelf',
    label: '서가',
    note: `문서 ${DOC_COUNT}권이 꽂혀 있는데 책등에 제목이 없어요. 왼쪽이 오래된 문서, 오른쪽이 최근 문서래요. 꺼내는 건 고 선생만 할 수 있대요.`,
    memo: '서가는 왼쪽이 오래된 문서, 오른쪽이 최근 문서다.',
    x: 45,
    y: 30,
    w: 49,
    h: 33,
  },
  {
    id: 'cart',
    label: '반납 수레',
    note: '수레에 대출 카드가 한 장 남아 있어요. 「미술관 연혁」. 책은 벌써 서가에 다시 꽂혔나 봐요.',
    word: '연혁',
    x: 73,
    y: 74,
    w: 19,
    h: 22,
  },
  {
    id: 'aisle',
    label: '서가 사이 통로',
    note: '통로 끝이 안 보여요. 저 안쪽에서 책장 넘기는 소리가 났는데… 고 선생은 여기 있잖아요.',
    x: 94.5,
    y: 12,
    w: 5.5,
    h: 58,
  },
]

const HINTS = [
  `대출대 위 메모를 보세요. 고 선생에게는 검색 결과 중 앞의 ${TOP_K}건만 전달됩니다. 순서는 오래된 문서부터입니다.`,
  '비상문에 붙은 스티커를 보세요. 최근 문서에만 있을 낱말이 적혀 있습니다.',
  "낱말이 많으면 옛 안내문이 다시 끼어듭니다. '변경'과, 고 선생이 모른다고 한 낱말만 남겨 검색해 보세요.",
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

function wordsOf(q: string): string[] {
  return q.split(/\s+/).filter((w) => w !== '')
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
  const [query, setQuery] = useState(BASE_WORDS.join(' '))
  const [turns, setTurns] = useState<Turn[]>([])
  const [cur, setCur] = useState(0) // 지금 보고 있는 답
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [net, setNet] = useState<MockNet>('ok')
  const [code, setCode] = useState('')
  const [doorTries, setDoorTries] = useState(0)
  const [doorNote, setDoorNote] = useState('')
  const [solved, setSolved] = useState(solvedBefore)
  const [hints, setHints] = useState(0)
  const [seen, setSeen] = useState<string[]>(solvedBefore ? SPOTS.map((s) => s.id) : [])
  // 대화창에 띄울 것: 고 선생의 답, 방금 살펴본 곳, 비상문 키패드
  const [panel, setPanel] = useState<'answer' | 'look' | 'door'>('answer')
  const [look, setLook] = useState<{ spot: ArchiveSpot; fresh: boolean } | null>(null)
  const [pressed, setPressed] = useState(false)
  const [showSpots, setShowSpots] = useState(false)
  const [calm, setCalm] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [shade, setShade] = useState(false)
  const [burst, setBurst] = useState<{ text: string; bad: boolean } | null>(null)
  const burstTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const shadeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(
    () => () => {
      clearTimeout(burstTimer.current)
      clearTimeout(shadeTimer.current)
    },
    [],
  )

  const last = turns.length > 0 ? turns[turns.length - 1] : undefined
  const shown = turns.length > 0 ? turns[Math.min(cur, turns.length - 1)] : undefined
  const doorLocked = solved || doorTries >= MAX_DOOR
  const step = solved ? 4 : last?.result.kind === 'correct' ? 3 : turns.length > 0 ? 2 : 1
  const words = [...BASE_WORDS, ...SPOTS.filter((s) => s.word && seen.includes(s.id)).map((s) => s.word as string)]
  const memos = SPOTS.filter((s) => s.memo && seen.includes(s.id)).map((s) => s.memo as string)
  const inQuery = wordsOf(query)

  // 결과를 장면 위에 도장으로 잠깐 찍는다
  function stamp(text: string, bad: boolean) {
    setBurst({ text, bad })
    clearTimeout(burstTimer.current)
    burstTimer.current = setTimeout(() => setBurst(null), 1800)
  }

  function inspect(s: ArchiveSpot) {
    const fresh = !seen.includes(s.id)
    if (fresh) {
      setSeen((prev) => [...prev, s.id])
      // 낱말을 두 번째로 찾을 때 통로에서 뭔가 한 번 지나간다. 분위기용이라 짧게 한 번만.
      const found = SPOTS.filter((x) => x.word && seen.includes(x.id)).length
      if (!calm && s.word && found === 1) {
        setShade(true)
        clearTimeout(shadeTimer.current)
        shadeTimer.current = setTimeout(() => setShade(false), 900)
      }
    }
    setLook({ spot: s, fresh })
    setPanel('look')
  }

  function toggleWord(w: string) {
    const now = wordsOf(query)
    const next = now.includes(w) ? now.filter((x) => x !== w) : [...now, w]
    setQuery(next.join(' ').slice(0, MAX_QUERY))
  }

  function talk() {
    setPanel('answer')
    inputRef.current?.focus()
  }

  async function search(e?: FormEvent) {
    e?.preventDefault()
    const q = query.trim()
    if (busy || q === '') return
    setBusy(true)
    setError('')
    setPanel('answer')
    setPressed(false)
    const netNow = net
    setNet('ok')
    try {
      const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const [result] = await Promise.all([searchLibrary(q, netNow), new Promise((r) => setTimeout(r, still ? 0 : FLIP_MS))])
      setTurns((prev) => [...prev, { query: q, result }])
      setCur(turns.length)
      if (result.kind === 'correct') stamp('근거 둘!', false)
      else if (result.kind === 'stale') stamp('확실합니다!', true)
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
        stamp('철컥!', false)
        setDoorNote('철컥. 비상문이 열립니다.')
        onSolved({ tries: turns.length + used, hints })
      } else if (used >= MAX_DOOR) {
        stamp('삐빅!', true)
        setDoorNote("입력 기회를 다 썼습니다. 경보가 울리기 직전입니다. '처음부터 다시'를 눌러 주세요.")
      } else {
        stamp('삐빅!', true)
        setDoorNote(`${r.note} 남은 기회 ${MAX_DOOR - used}번.`)
      }
    } catch (err) {
      setDoorNote(err instanceof Error ? err.message : '입력하지 못했습니다. 다시 눌러 주세요.')
    }
  }

  function reset() {
    if (busy) return
    setQuery(BASE_WORDS.join(' '))
    setTurns([])
    setCur(0)
    setError('')
    setCode('')
    setDoorTries(0)
    setDoorNote('')
    setSolved(false)
    setHints(0)
    setSeen([])
    setPanel('answer')
    setLook(null)
    setPressed(false)
  }

  // 고 선생의 표정. 받은 문서에 따라 달라진다
  let face: Face = 'calm'
  let mood = `검색된 문서 ${TOP_K}건만 읽습니다. 융통성은 없습니다`
  if (solved) {
    face = 'happy'
    mood = '퇴근 준비를 합니다'
  } else if (busy) {
    face = 'reading'
    mood = '책장을 넘기고 있습니다'
  } else if (last?.result.kind === 'correct') {
    face = 'happy'
    mood = '근거 두 건을 나란히 펴 놓고 뿌듯해합니다'
  } else if (last?.result.kind === 'stale') {
    face = 'sure'
    mood = '자신만만. 문서 날짜는 보지 않았습니다'
  } else if (last?.result.kind === 'partial') {
    face = 'puzzled'
    mood = '갸웃. 받은 문서에 빠진 조각이 있습니다'
  } else if (last?.result.kind === 'none') {
    face = 'puzzled'
    mood = '빈손입니다. 지어내지는 않습니다'
  }

  let coach = "자료실을 눌러 살펴보고, 고 선생에게 '찾아 주세요'를 눌러 보세요. 고 선생은 찾아온 문서만 읽고 답합니다."
  if (solved) coach = '탈출 완료. 무엇이 검색되느냐가 AI의 답을 결정합니다.'
  else if (last?.result.kind === 'correct') coach = "고 선생이 근거 두 개로 답했습니다. '비상문 열기'를 눌러 그 번호를 입력하세요."
  else if (last?.result.kind === 'stale')
    coach = `고 선생은 자신 있게 답했지만 문서 날짜를 보세요. 검색 결과는 오래된 것부터 ${TOP_K}건만 전달됩니다. 최근 문서에만 있을 낱말을 자료실에서 찾아 더해 보세요.`
  else if (last?.result.kind === 'partial')
    coach =
      (last.result.cut?.length ?? 0) > 0
        ? '검색됐지만 잘린 문서가 있습니다. 빠진 조각이 그 안에 있을 수 있습니다. 낱말을 줄여 필요한 문서만 잡히게 해 보세요.'
        : '빠진 조각이 있습니다. 고 선생이 받은 문서에 없다고 한 그것을 검색어로 넣어 보세요.'
  else if (last?.result.kind === 'none') coach = "관련 문서가 잡히지 않았습니다. '자료 없음'은 지어내지 않은 올바른 답입니다. 다른 낱말로 검색하세요."
  else if (last) coach = '고 선생의 답과 근거 문서를 확인하고, 검색어를 바꿔 보세요.'

  const press = shown ? pressLine(shown.result) : undefined

  return (
    <div className="proto">
      <Mission
        goal={
          <>
            문서 {DOC_COUNT}건이 든 서가에서 <mark>비상문 비밀번호 4자리</mark>를 알아내세요.
          </>
        }
        steps={['자료실을 살펴 검색에 쓸 낱말을 찾습니다', `고 선생이 받은 ${TOP_K}건과 답을 확인하고 검색어를 다듬습니다`, '비밀번호를 비상문에 입력합니다']}
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
            <Portrait who="go" face={face} />
            <div className="suspect-now">
              <b>고 선생</b> <span className="muted">AI 사서</span>
              <div className="mood" role="status">
                {mood}
              </div>
            </div>
            <div className="sound">
              <span className="pill plan">검색 {turns.length}회</span>
              <span className={doorTries > 0 && !solved ? 'pill need' : 'pill plan'}>
                문 입력 {doorTries} / {MAX_DOOR}
              </span>
            </div>
          </div>

          {/* 자료실: 방을 눌러 낱말과 단서를 찾는다. 서가는 검색 결과에 따라 바뀐다 */}
          <Archive
            spots={SPOTS}
            seen={seen}
            count={DOC_COUNT}
            given={busy ? [] : (shown?.result.docs.map((d) => d.id) ?? [])}
            cut={busy ? [] : (shown?.result.cut ?? [])}
            busy={busy}
            face={face}
            mood={mood}
            calm={calm}
            showSpots={showSpots}
            shade={shade}
            doorOpen={solved}
            burst={burst}
            onInspect={inspect}
            onDoor={() => setPanel('door')}
            onTalk={talk}
          />
          <div className="scene-bar">
            <span>
              <b>자료실</b> <span className="muted">눈에 띄는 곳을 눌러 살펴보세요</span>
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
          {shown && !busy && (
            <p className="bookcase-legend shelf-legend" aria-hidden="true">
              <span className="key given" /> 고 선생이 받은 책
              {(shown.result.cut?.length ?? 0) > 0 && (
                <>
                  <span className="key cut" /> 검색됐지만 잘린 책
                </>
              )}
            </p>
          )}

          {/* 화면이 작으면 그림 속 물건을 누르기 어렵다. 같은 곳을 단추로도 고를 수 있게 한다 */}
          <div className={showSpots ? 'spot-list on' : 'spot-list'} role="group" aria-label="살펴볼 곳 목록">
            {SPOTS.map((s) => (
              <button key={s.id} type="button" className="toggle" onClick={() => inspect(s)}>
                {seen.includes(s.id) ? '✓ ' : ''}
                {s.label}
              </button>
            ))}
            <button type="button" className="toggle" onClick={() => setPanel('door')}>
              {solved ? '✓ ' : ''}비상문 키패드
            </button>
          </div>

          {/* 대화창: 살펴본 곳, 비상문 키패드, 고 선생의 답이 같은 자리에 뜬다 */}
          <div className="dlg" aria-live="polite">
            {panel === 'look' && look ? (
              <>
                <span className="dlg-name me">나 · {look.spot.label}</span>
                <p>{look.spot.note}</p>
                {look.spot.word && (
                  <div className={look.fresh ? 'found-card fresh' : 'found-card'}>
                    <span className="mono">{look.fresh ? '낱말 쪽지 획득' : '이미 챙긴 낱말'}</span>
                    <b>{look.spot.word}</b>
                    <span>아래 검색어에 넣을 수 있어요.</span>
                  </div>
                )}
                {look.spot.memo && (
                  <div className={look.fresh ? 'found-card fresh' : 'found-card'}>
                    <span className="mono">{look.fresh ? '수첩에 적음' : '수첩에 적어 둔 것'}</span>
                    <span>{look.spot.memo}</span>
                  </div>
                )}
              </>
            ) : panel === 'door' ? (
              <>
                <span className="dlg-name me">비상문 키패드</span>
                <p>비밀번호 네 자리를 누르면 문이 열려요. 기회는 {MAX_DOOR}번이에요.</p>
                <form className="drawer-row" onSubmit={(e) => void tryDoor(e)}>
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
              </>
            ) : busy ? (
              <>
                <span className="dlg-name">고 선생</span>
                <p className="flipping">
                  <BookFlip />
                  서가를 뒤져 책장을 넘기는 중입니다
                </p>
              </>
            ) : error ? (
              <>
                <span className="dlg-name">자료실</span>
                <p role="alert">{error}</p>
                <button className="btn ghost small gap-top" type="button" onClick={() => void search()}>
                  다시 검색하기
                </button>
              </>
            ) : shown ? (
              <>
                <span className="dlg-name">
                  고 선생 · {Math.min(cur, turns.length - 1) + 1}번째 답{pressed ? ' · 캐물음' : ''}
                </span>
                {pressed && press ? (
                  <>
                    <p className="dlg-q">나: {press.ask}</p>
                    <p>{press.reply}</p>
                  </>
                ) : (
                  <>
                    <div className="retrieved">
                      <p>
                        <b>"{shown.query}"</b> 검색 결과 {shown.result.found}건
                        {shown.result.found > shown.result.docs.length && (
                          <>
                            {' '}
                            중 앞의 {shown.result.docs.length}건만 전달됨. <span className="cut">나머지 {shown.result.found - shown.result.docs.length}건은 잘림</span>
                          </>
                        )}
                      </p>
                      {shown.result.docs.length > 0 && (
                        <ol>
                          {shown.result.docs.map((d) => (
                            <li key={d.id}>
                              {d.title} <span className="mono">{d.date}</span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                    <p>{shown.result.reply}</p>
                    <p className="dlg-cite">
                      {shown.result.sources.length > 0 ? (
                        shown.result.sources.map((s) => (
                          <span className="chip src" key={s.id}>
                            근거: {s.label}
                          </span>
                        ))
                      ) : (
                        <span className="chip nosrc">근거 없음: 받은 문서에 없는 내용</span>
                      )}
                    </p>
                  </>
                )}
              </>
            ) : (
              <>
                <span className="dlg-name">고 선생</span>
                <p>찾으실 낱말을 말씀해 주십시오. 저는 찾아온 문서만 읽고 답합니다. 안경은 방금 닦았습니다.</p>
              </>
            )}
          </div>

          <div className="choices">
            {turns.length > 1 && panel === 'answer' && !busy && (
              <div className="stmt-nav">
                <button type="button" className="toggle" onClick={() => { setCur((c) => (Math.min(c, turns.length - 1) + turns.length - 1) % turns.length); setPressed(false) }}>
                  ◀ 앞 답
                </button>
                <span className="mono">
                  답 {Math.min(cur, turns.length - 1) + 1}/{turns.length}
                </span>
                <button type="button" className="toggle" onClick={() => { setCur((c) => (Math.min(c, turns.length - 1) + 1) % turns.length); setPressed(false) }}>
                  다음 답 ▶
                </button>
              </div>
            )}
            <form className="ask-words" onSubmit={(e) => void search(e)}>
              <label htmlFor="search-input" className="choices-q">
                고 선생에게 찾아 달라고 할 낱말. 쪽지를 눌러 넣고 뺄 수 있어요
              </label>
              <div className="word-chips" role="group" aria-label="낱말 쪽지">
                {words.map((w) => (
                  <button key={w} type="button" className="toggle" aria-pressed={inQuery.includes(w)} onClick={() => toggleWord(w)}>
                    {w}
                  </button>
                ))}
              </div>
              <div className="search-row">
                <input
                  ref={inputRef}
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
                  {busy ? '찾는 중' : '찾아 주세요'}
                </button>
              </div>
            </form>
            <div className="act-row">
              <button
                type="button"
                className="act"
                disabled={!shown || busy}
                onClick={() => {
                  setPanel('answer')
                  setPressed((v) => panel !== 'answer' || !v)
                }}
              >
                {pressed && panel === 'answer' ? '답 다시 보기' : '더 캐묻기'}
              </button>
              <button type="button" className="act present" onClick={() => setPanel('door')}>
                비상문 열기
              </button>
            </div>
          </div>

          <Coach text={coach} hints={HINTS} opened={hints} onOpen={() => setHints((h) => Math.min(h + 1, HINTS.length))} done={solved} />
        </div>

        <aside className="side">
          <div>
            <h3>
              수첩 <span className="mono muted">낱말 {words.length}개</span>
            </h3>
            <p>자료실에서 찾은 낱말과 단서입니다.</p>
            <div className="bag-items gap-top">
              {words.map((w) => (
                <span className="chip" key={w}>
                  {w}
                </span>
              ))}
            </div>
            {memos.length > 0 && (
              <ul className="notebook gap-top">
                {memos.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            )}
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
