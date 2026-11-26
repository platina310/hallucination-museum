// AI 서버 상태 표시. 서버 주소가 없으면 아무것도 보여 주지 않는다.
// 서버가 잠들어 있어도 게임은 정해진 대본으로 계속된다는 것을 알려 준다.
import { useEffect, useSyncExternalStore } from 'react'
import { getPresenterState, getServerState, subscribeServer, wakeServer } from '../api'

const TEXT = {
  none: '',
  waking: 'AI 서버 깨우는 중 · 그동안은 대본으로 답해요',
  on: 'AI 서버 연결됨 · Gemini가 답해요',
  off: 'AI 서버가 쉬는 중 · 대본으로 답해요',
} as const

export default function ServerPill() {
  const state = useSyncExternalStore(subscribeServer, getServerState, getServerState)
  useEffect(() => {
    wakeServer()
  }, [])
  const presenter = useSyncExternalStore(subscribeServer, getPresenterState, getPresenterState)
  if (state === 'none') return null
  return (
    <span className={`pill server ${state === 'on' ? 'ok' : 'plan'}`} role="status">
      {TEXT[state]}
      {presenter === 'on' && state === 'on' ? ' · 발표자 모드' : ''}
    </span>
  )
}
