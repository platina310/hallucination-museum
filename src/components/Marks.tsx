// 상태 표시와 "아직 채울 것" 표시. 여러 화면에서 같이 쓴다.
import type { ReactNode } from 'react'
import type { Status } from '../content/shared'

export function Pill({ kind, children }: { kind: Status; children: ReactNode }) {
  return <span className={`pill ${kind}`}>{children}</span>
}

export function Todo({ children }: { children: ReactNode }) {
  return <span className="todo">{children}</span>
}
