// 방마다 같은 모양으로 쓰는 안내 요소: 임무, 다음 수, 힌트, 퀴즈
import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Quiz as QuizData } from '../game/rooms'

export function Mission({ goal, steps, step, why }: { goal: ReactNode; steps: string[]; step: number; why: string }) {
  return (
    <div className="mission">
      <p className="mission-goal">
        <b>임무</b> {goal}
      </p>
      <ol className="steps">
        {steps.map((s, i) => (
          <li key={s} className={step > i + 1 ? 'done' : step === i + 1 ? 'now' : undefined}>
            {s}
          </li>
        ))}
      </ol>
      <p className="mission-why">{why}</p>
    </div>
  )
}

export function Coach({
  text,
  hints,
  opened,
  onOpen,
  done,
  className,
}: {
  text: string
  hints: string[]
  opened: number
  onOpen: () => void
  done: boolean
  className?: string // 방 안에 두는 것(in-room)과 오른쪽 칸에 두는 것을 화면 너비에 따라 하나만 보여 준다
}) {
  return (
    <div className={className ? `coach ${className}` : 'coach'}>
      <p role="status">
        <b>다음 수</b> {text}
      </p>
      {!done && (
        <button type="button" className="toggle" disabled={opened >= hints.length} onClick={onOpen}>
          {opened >= hints.length ? '힌트 끝. 이제 조사관님 몫입니다' : `힌트 열기 (${opened}/${hints.length})`}
        </button>
      )}
      {opened > 0 && (
        <ol className="hints">
          {hints.slice(0, opened).map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ol>
      )}
    </div>
  )
}

// 입장 전과 탈출 후에 같은 문제를 낸다. 입장 전에는 정답을 알려 주지 않는다.
export function Quiz({
  quiz,
  mode,
  onAnswer,
}: {
  quiz: QuizData
  mode: 'pre' | 'post'
  onAnswer: (choice: number) => void
}) {
  const [picked, setPicked] = useState<number | null>(null)
  return (
    <div className="quiz">
      <p className="quiz-kicker mono">{mode === 'pre' ? '입장 전 한 문제' : '탈출 후 같은 문제'}</p>
      <p className="quiz-q">{quiz.question}</p>
      <div className="quiz-options" role="group" aria-label="보기">
        {quiz.options.map((o, i) => (
          <button key={o} type="button" aria-pressed={picked === i} onClick={() => setPicked(i)}>
            {o}
          </button>
        ))}
        {mode === 'pre' && (
          <button type="button" aria-pressed={picked === -1} onClick={() => setPicked(-1)}>
            모르겠어요
          </button>
        )}
      </div>
      <div className="quiz-foot">
        <span className="muted">
          {mode === 'pre' ? '틀려도 들어갈 수 있습니다. 정답은 방을 나갈 때 알려 드립니다.' : '방에서 겪은 대로 골라 보세요.'}
        </span>
        <button className="btn" type="button" disabled={picked === null} onClick={() => picked !== null && onAnswer(picked)}>
          {mode === 'pre' ? '방에 들어가기' : '답 확인하기'}
        </button>
      </div>
    </div>
  )
}
