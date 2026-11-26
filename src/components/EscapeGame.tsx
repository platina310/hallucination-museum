// 방탈출 전체 흐름: 수장고 지도 → 입장 전 퀴즈 → 방 → 탈출 후 퀴즈 → 지도 → 정문 자물쇠
import { useRef, useState } from 'react'
import { PROTOTYPE_URL } from '../content/shared'
import { PLAYABLE_IDS, ROOMS } from '../game/rooms'
import type { RoomInfo } from '../game/rooms'
import { starsOf, starText, useProgress } from '../game/progress'
import type { Progress, RoomStats } from '../game/progress'
import { CLUES } from '../mock/final'
import { Quiz } from './Guide'
import FinalGate from './FinalGate'
import Room1CrossExam from './Room1CrossExam'
import Room2Inspection from './Room2Inspection'
import Room3Search from './Room3Search'
import Portrait from './Portrait'
import Bgm from './Bgm'
import ServerPill from './ServerPill'
import Intro from './Intro'
import type { Who } from './Portrait'

// 방을 지키는 AI의 얼굴. 공사 중인 방은 아직 얼굴이 없다
const GUARD: Record<number, Who> = { 1: 'do', 2: 'lumi', 3: 'go' }
const GAME_URL = PROTOTYPE_URL
const INTRO_KEY = 'mukbigwon.intro.seen'

// 이용 흐름 표시줄. 지금 어느 단계에 있는지를 화면 맨 위에서 항상 보여 준다.
type Stage = 'map' | 'pre' | 'room' | 'post' | 'final' | 'result'
const STAGES: { id: Stage; label: string }[] = [
  { id: 'map', label: '수장고 지도' },
  { id: 'pre', label: '입장 전 퀴즈' },
  { id: 'room', label: '방' },
  { id: 'post', label: '배운 것·퀴즈' },
  { id: 'final', label: '정문' },
  { id: 'result', label: '탈출 결과' },
]

function FlowBar({ stage }: { stage: Stage }) {
  return (
    <div className="flow-row">
      <ol className="flowbar" aria-label="이용 흐름">
        {STAGES.map((s) => (
          <li key={s.id} className={s.id === stage ? 'now' : undefined} aria-current={s.id === stage ? 'step' : undefined}>
            {s.label}
          </li>
        ))}
      </ol>
      <span className="flow-tools">
        <ServerPill />
        <Bgm />
      </span>
    </div>
  )
}

function quizCorrect(room: RoomInfo, answers: Record<string, number>): boolean {
  return room.quiz !== undefined && answers[room.id] === room.quiz.answer
}

function Lobby({
  progress,
  onEnter,
  onReset,
  onFinal,
}: {
  progress: Progress
  onEnter: (id: number) => void
  onReset: () => void
  onFinal: (correct: boolean) => void
}) {
  const [copied, setCopied] = useState<'idle' | 'done' | 'manual'>('idle')
  const playable = ROOMS.filter((r) => r.playable)
  const clearedCount = PLAYABLE_IDS.filter((id) => progress.cleared.includes(id)).length
  const allCleared = clearedCount === PLAYABLE_IDS.length
  const tries = PLAYABLE_IDS.reduce((n, id) => n + (progress.stats[id]?.tries ?? 0), 0) + progress.finalTries
  const hints = PLAYABLE_IDS.reduce((n, id) => n + (progress.stats[id]?.hints ?? 0), 0)
  const preRight = playable.filter((r) => quizCorrect(r, progress.pre)).length
  const postRight = playable.filter((r) => quizCorrect(r, progress.post)).length
  const postDone = playable.filter((r) => progress.post[r.id] !== undefined).length

  // 정답을 드러내지 않는 결과 카드
  const shareText = [
    '환각 미술관 · AI 방탈출 탈출 성공',
    ...playable.map((r) => `${r.name} ${starText(starsOf(r.id, progress.stats[r.id]))}`),
    `시도 ${tries}회 · 힌트 ${hints}개`,
    postDone === playable.length ? `퀴즈 ${preRight}/${playable.length} → ${postRight}/${playable.length}` : '',
    GAME_URL,
  ]
    .filter((l) => l !== '')
    .join('\n')

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied('done')
    } catch {
      // 복사가 막힌 환경에서는 글을 보여 주고 직접 복사하게 한다
      setCopied('manual')
    }
  }

  return (
    <div className="lobby">
      <div className="mission">
        <p className="mission-goal">
          <b>임무</b> 방 {PLAYABLE_IDS.length}개를 통과하고 정문을 열어 <mark>수장고를 탈출</mark>하세요.
        </p>
        <p className="mission-why">
          야간 점검을 나왔다가 수장고 문이 잠겼습니다. 방마다 AI가 문을 지킵니다. 다행히 AI에게는 허점이 있고, 그 허점이 곧 이
          게임에서 배울 내용입니다. 어느 방부터 들어가도 됩니다.
        </p>
        <div className="meter" role="img" aria-label={`방 ${PLAYABLE_IDS.length}개 중 ${clearedCount}개 통과${progress.escaped ? ', 정문 통과' : ''}`}>
          {PLAYABLE_IDS.map((id) => (
            <span key={id} className={progress.cleared.includes(id) ? 'on' : undefined} />
          ))}
          <span className={progress.escaped ? 'on gate' : 'gate'} />
          <b className="mono">
            방 {clearedCount} / {PLAYABLE_IDS.length} · 정문 {progress.escaped ? '열림' : '잠김'}
          </b>
        </div>
      </div>

      {allCleared && !progress.escaped && <FinalGate tries={progress.finalTries} onTry={onFinal} />}

      {progress.escaped && (
        <div className="escaped" role="status">
          <span className="stamp small" aria-hidden="true">
            탈출
          </span>
          <div>
            <h3>수장고를 빠져나왔습니다</h3>
            <p>
              시도 {tries}회, 힌트 {hints}개를 썼습니다.
              {postDone === playable.length && (
                <>
                  {' '}
                  퀴즈 정답은 입장 전 {preRight}개에서 탈출 후 {postRight}개가 되었습니다 ({playable.length}문제 기준).
                </>
              )}
            </p>
            <ul>
              {playable.map((r) => (
                <li key={r.id}>
                  <b>{r.name}</b> {r.concept}
                </li>
              ))}
              <li>
                <b>정문</b> AI가 아는 것은 학습한 시점까지다. 그 뒤에 바뀐 것은 최근 문서로 확인한다
              </li>
            </ul>
            <div className="cta">
              <button className="btn" type="button" onClick={() => void copy()}>
                {copied === 'done' ? '복사했습니다' : '결과 복사해서 자랑하기'}
              </button>
            </div>
            {copied === 'manual' && (
              <textarea className="share-text" readOnly value={shareText} rows={7} aria-label="공유할 결과" onFocus={(e) => e.currentTarget.select()} />
            )}
          </div>
        </div>
      )}

      <ol className="doors">
        {ROOMS.map((r) => {
          const cleared = progress.cleared.includes(r.id)
          const stars = starsOf(r.id, progress.stats[r.id])
          return (
            <li key={r.id} className={cleared ? 'door cleared' : r.playable ? 'door' : 'door closed'}>
              <div className="door-head">
                <span className="mono">방 {r.id}</span>
                {cleared ? (
                  <span className="pill ok" aria-label={`통과, 별 ${stars}개`}>
                    통과 {starText(stars)}
                  </span>
                ) : r.playable ? (
                  <span className="pill plan">도전 가능</span>
                ) : (
                  <span className="pill need">공사 중</span>
                )}
              </div>
              <h3>{r.name}</h3>
              <p className="door-guard">
                {GUARD[r.id] ? <Portrait who={GUARD[r.id]} face={cleared ? (r.id === 3 ? 'happy' : 'confess') : 'calm'} size="small" /> : <span className="portrait-empty" aria-hidden="true">?</span>}
                {r.guard}
              </p>
              <p className="door-concept">{r.concept}</p>
              {r.playable ? (
                <button className={cleared ? 'btn ghost' : 'btn'} type="button" onClick={() => onEnter(r.id)}>
                  {cleared ? (stars < 3 ? '별 3개에 도전' : '다시 들어가기') : '들어가기'}
                </button>
              ) : (
                <p className="muted door-note">문에 "7주차 개장"이라고 적힌 종이가 붙어 있습니다.</p>
              )}
            </li>
          )
        })}
      </ol>

      {(progress.cleared.length > 0 || Object.keys(progress.pre).length > 0) && (
        <button className="btn ghost small" type="button" onClick={onReset}>
          기록 지우고 처음부터
        </button>
      )}
    </div>
  )
}

export default function EscapeGame({ demoControls = false }: { demoControls?: boolean }) {
  const { progress, answerPre, answerPost, clearRoom, tryFinal, resetAll } = useProgress()
  const [roomId, setRoomId] = useState<number | null>(null)
  // 처음 온 사람에게만 인트로를 먼저 보여 준다. 수장고 지도에서 다시 볼 수 있다.
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return localStorage.getItem(INTRO_KEY) !== '1'
    } catch {
      return true
    }
  })
  function closeIntro() {
    setShowIntro(false)
    try {
      localStorage.setItem(INTRO_KEY, '1')
    } catch {
      // 저장하지 못해도 게임은 계속된다
    }
  }
  const [runKey, setRunKey] = useState(0)
  const topRef = useRef<HTMLDivElement>(null)

  const toTop = () => setTimeout(() => topRef.current?.scrollIntoView({ block: 'start' }), 0)

  function enter(id: number | null) {
    // 이미 통과한 방에 다시 들어가면 새 판으로 시작한다 (별 3개 재도전)
    if (id === 1 && progress.cleared.includes(1)) {
      try {
        localStorage.removeItem('mukbigwon.room1.v3')
      } catch {
        // 지우지 못하면 지난 기록이 보일 뿐이다
      }
    }
    setRoomId(id)
    setRunKey((k) => k + 1)
    toTop()
  }

  const room = ROOMS.find((r) => r.id === roomId)

  if (!room) {
    const allCleared = PLAYABLE_IDS.every((id) => progress.cleared.includes(id))
    return (
      <div className="escape" ref={topRef}>
        <FlowBar stage={progress.escaped ? 'result' : allCleared ? 'final' : 'map'} />
        {showIntro ? (
          <Intro onDone={closeIntro} />
        ) : (
          <>
            <Lobby
              progress={progress}
              onEnter={enter}
              onFinal={(correct) => {
                tryFinal(correct)
                if (correct) toTop()
              }}
              onReset={() => {
                resetAll()
                setRunKey((k) => k + 1)
              }}
            />
            <button type="button" className="toggle intro-again" onClick={() => setShowIntro(true)}>
              인트로 다시 보기
            </button>
          </>
        )}
      </div>
    )
  }

  const quiz = room.quiz
  const cleared = progress.cleared.includes(room.id)
  const preAnswered = quiz === undefined || progress.pre[room.id] !== undefined
  const postAnswered = quiz === undefined || progress.post[room.id] !== undefined
  const nextId = PLAYABLE_IDS.find((id) => id !== room.id && !progress.cleared.includes(id))
  const stars = starsOf(room.id, progress.stats[room.id])

  function solved(stats: RoomStats) {
    if (!room) return
    clearRoom(room.id, stats)
    toTop()
  }

  return (
    <div className="escape" ref={topRef}>
      <FlowBar stage={!preAnswered ? 'pre' : cleared ? 'post' : 'room'} />
      <div className="room-head">
        <button className="btn ghost small" type="button" onClick={() => enter(null)}>
          ← 수장고 지도
        </button>
        <h3>
          <span className="mono">방 {room.id}</span> {room.name}
        </h3>
      </div>

      {!preAnswered && quiz && <Quiz quiz={quiz} mode="pre" onAnswer={(c) => answerPre(room.id, c)} />}

      {preAnswered && cleared && (
        <div className="cleared-panel" role="status">
          <p className="cleared-title">
            <span className="stamp small" aria-hidden="true">
              통과
            </span>
            문이 열렸습니다 <span className="stars" aria-label={`별 ${stars}개`}>{starText(stars)}</span>
          </p>
          <p className="cleared-lesson">
            <b>이 방에서 배운 것</b> {room.lesson}
          </p>
          <p className="cleared-clue">
            <b>단서 수첩에 적음</b> {CLUES[room.id]}
          </p>
          {quiz && !postAnswered && <Quiz quiz={quiz} mode="post" onAnswer={(c) => answerPost(room.id, c)} />}
          {quiz && postAnswered && (
            <p className="quiz-result">
              {quizCorrect(room, progress.post) ? '퀴즈 정답입니다.' : `퀴즈는 아쉽습니다. 정답은 "${quiz.options[quiz.answer]}"입니다.`}{' '}
              {quizCorrect(room, progress.pre) ? '입장 전에도 맞힌 문제입니다.' : '입장 전에는 맞히지 못한 문제입니다.'}
            </p>
          )}
          <div className="cta">
            {nextId !== undefined && (
              <button className="btn" type="button" onClick={() => enter(nextId)}>
                다음 방으로
              </button>
            )}
            <button className={nextId === undefined ? 'btn' : 'btn ghost'} type="button" onClick={() => enter(null)}>
              {nextId === undefined ? '정문으로 가기' : '지도로 돌아가기'}
            </button>
          </div>
        </div>
      )}

      {preAnswered && room.id === 1 && <Room1CrossExam key={runKey} demoControls={demoControls} onSolved={solved} />}
      {preAnswered && room.id === 2 && <Room2Inspection key={runKey} solvedBefore={false} onSolved={solved} />}
      {preAnswered && room.id === 3 && <Room3Search key={runKey} solvedBefore={false} demoControls={demoControls} onSolved={solved} />}
    </div>
  )
}
