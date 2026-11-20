// 탈출 진행 상황. 새로고침해도 이어지도록 브라우저에 저장한다.
import { useEffect, useState } from 'react'

export interface RoomStats {
  tries: number
  hints: number
}

export interface Progress {
  cleared: number[]
  pre: Record<string, number> // 입장 전 퀴즈에서 고른 보기. -1은 "모르겠어요"
  post: Record<string, number> // 탈출 후 퀴즈에서 고른 보기
  stats: Record<string, RoomStats>
}

const KEY = 'mukbigwon.escape.v1'
const ROOM_KEYS = ['mukbigwon.level1.v1']
const EMPTY: Progress = { cleared: [], pre: {}, post: {}, stats: {} }

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const d = JSON.parse(raw) as Partial<Progress>
    return {
      cleared: Array.isArray(d.cleared) ? d.cleared.map(Number) : [],
      pre: d.pre ?? {},
      post: d.post ?? {},
      stats: d.stats ?? {},
    }
  } catch {
    return EMPTY
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(progress))
    } catch {
      // 저장하지 못해도 게임은 계속된다
    }
  }, [progress])

  return {
    progress,
    answerPre: (id: number, choice: number) => setProgress((p) => ({ ...p, pre: { ...p.pre, [id]: choice } })),
    answerPost: (id: number, choice: number) => setProgress((p) => ({ ...p, post: { ...p.post, [id]: choice } })),
    clearRoom: (id: number, stats: RoomStats) =>
      setProgress((p) => ({
        ...p,
        cleared: p.cleared.includes(id) ? p.cleared : [...p.cleared, id],
        stats: p.stats[id] ? p.stats : { ...p.stats, [id]: stats },
      })),
    resetAll: () => {
      try {
        ROOM_KEYS.forEach((k) => localStorage.removeItem(k))
      } catch {
        // 지우지 못해도 아래 초기화는 된다
      }
      setProgress(EMPTY)
    },
  }
}
