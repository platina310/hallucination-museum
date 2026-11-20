// 방탈출 전체 흐름: 수장고 지도 → 입장 전 퀴즈 → 방 → 탈출 후 퀴즈 → 지도
import { useRef, useState } from 'react'
import { PLAYABLE_IDS, ROOMS } from '../game/rooms'
import type { RoomInfo } from '../game/rooms'
import { useProgress } from '../game/progress'
import type { Progress, RoomStats } from '../game/progress'
import { Quiz } from './Guide'
import InterrogationRoom from './InterrogationRoom'
import Room2Hallucination from './Room2Hallucination'
import Room3Shelf from './Room3Shelf'

function quizCorrect(room: RoomInfo, answers: Record<string, number>): boolean {
  return room.quiz !== undefined && answers[room.id] === room.quiz.answer
}

function Lobby({ progress, onEnter, onReset }: { progress: Progress; onEnter: (id: number) => void; onReset: () => void }) {
  const playable = ROOMS.filter((r) => r.playable)
  const clearedCount = PLAYABLE_IDS.filter((id) => progress.cleared.includes(id)).length
  const escaped = clearedCount === PLAYABLE_IDS.length
  const tries = PLAYABLE_IDS.reduce((n, id) => n + (progress.stats[id]?.tries ?? 0), 0)
  const hints = PLAYABLE_IDS.reduce((n, id) => n + (progress.stats[id]?.hints ?? 0), 0)
  const preRight = playable.filter((r) => quizCorrect(r, progress.pre)).length
  const postRight = playable.filter((r) => quizCorrect(r, progress.post)).length
  const postDone = playable.filter((r) => progress.post[r.id] !== undefined).length

  return (
    <div className="lobby">
      <div className="mission">
        <p className="mission-goal">
          <b>임무</b> 방 {PLAYABLE_IDS.length}개를 통과해 <mark>수장고를 탈출</mark>하세요.
        </p>
        <p className="mission-why">
          야간 점검을 나왔다가 수장고 문이 잠겼습니다. 방마다 AI가 문을 지킵니다. 다행히 AI에게는 허점이 있고, 그 허점이 곧 이
          게임에서 배울 내용입니다. 어느 방부터 들어가도 됩니다.
        </p>
        <div className="meter" role="img" aria-label={`방 ${PLAYABLE_IDS.length}개 중 ${clearedCount}개 통과`}>
          {PLAYABLE_IDS.map((id) => (
            <span key={id} className={progress.cleared.includes(id) ? 'on' : undefined} />
          ))}
          <b className="mono">
            {clearedCount} / {PLAYABLE_IDS.length}
          </b>
        </div>
      </div>

      {escaped && (
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
            </ul>
          </div>
        </div>
      )}

      <ol className="doors">
        {ROOMS.map((r) => {
          const cleared = progress.cleared.includes(r.id)
          return (
            <li key={r.id} className={cleared ? 'door cleared' : r.playable ? 'door' : 'door closed'}>
              <div className="door-head">
                <span className="mono">방 {r.id}</span>
                {cleared ? (
                  <span className="pill ok">통과</span>
                ) : r.playable ? (
                  <span className="pill plan">도전 가능</span>
                ) : (
                  <span className="pill need">공사 중</span>
                )}
              </div>
              <h3>{r.name}</h3>
              <p className="door-guard">{r.guard}</p>
              <p className="door-concept">{r.concept}</p>
              {r.playable ? (
                <button className={cleared ? 'btn ghost' : 'btn'} type="button" onClick={() => onEnter(r.id)}>
                  {cleared ? '다시 들어가기' : '들어가기'}
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
  const { progress, answerPre, answerPost, clearRoom, resetAll } = useProgress()
  const [roomId, setRoomId] = useState<number | null>(null)
  const [runKey, setRunKey] = useState(0)
  const topRef = useRef<HTMLDivElement>(null)

  const toTop = () => setTimeout(() => topRef.current?.scrollIntoView({ block: 'start' }), 0)

  function enter(id: number | null) {
    setRoomId(id)
    setRunKey((k) => k + 1)
    toTop()
  }

  const room = ROOMS.find((r) => r.id === roomId)

  if (!room) {
    return (
      <div className="escape" ref={topRef}>
        <Lobby
          progress={progress}
          onEnter={enter}
          onReset={() => {
            resetAll()
            setRunKey((k) => k + 1)
          }}
        />
      </div>
    )
  }

  const quiz = room.quiz
  const cleared = progress.cleared.includes(room.id)
  const preAnswered = quiz === undefined || progress.pre[room.id] !== undefined
  const postAnswered = quiz === undefined || progress.post[room.id] !== undefined
  const nextId = PLAYABLE_IDS.find((id) => id !== room.id && !progress.cleared.includes(id))

  function solved(stats: RoomStats) {
    if (!room) return
    clearRoom(room.id, stats)
    toTop()
  }

  return (
    <div className="escape" ref={topRef}>
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
            문이 열렸습니다
          </p>
          <p className="cleared-lesson">
            <b>이 방에서 배운 것</b> {room.lesson}
          </p>
          {quiz && !postAnswered && <Quiz quiz={quiz} mode="post" onAnswer={(c) => answerPost(room.id, c)} />}
          {quiz && postAnswered && (
            <p className="quiz-result">
              {quizCorrect(room, progress.post) ? '정답입니다.' : `아쉽습니다. 정답은 "${quiz.options[quiz.answer]}"입니다.`}{' '}
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
              {nextId === undefined ? '탈출 결과 보기' : '지도로 돌아가기'}
            </button>
          </div>
        </div>
      )}

      {preAnswered && room.id === 1 && <InterrogationRoom key={runKey} demoControls={demoControls} onSolved={solved} />}
      {preAnswered && room.id === 2 && <Room2Hallucination key={runKey} solvedBefore={cleared} onSolved={solved} />}
      {preAnswered && room.id === 3 && <Room3Shelf key={runKey} solvedBefore={cleared} demoControls={demoControls} onSolved={solved} />}
    </div>
  )
}
