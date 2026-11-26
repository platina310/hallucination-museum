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
  stats: Record<string, RoomStats> // 방별 최고 기록
  escaped: boolean // 정문 자물쇠까지 열었는지
  finalTries: number
}

const KEY = 'mukbigwon.escape.v2'
const ROOM_KEYS = ['mukbigwon.room1.v3', 'mukbigwon.room1.v2', 'mukbigwon.level1.v1', 'mukbigwon.escape.v1']
const EMPTY: Progress = { cleared: [], pre: {}, post: {}, stats: {}, escaped: false, finalTries: 0 }

// 방마다 "이 정도면 능숙하다"고 보는 행동 횟수
const PAR: Record<number, number> = { 1: 12, 2: 3, 3: 5 }

/** 별 1~3개. 힌트 없이 적은 횟수로 통과할수록 많다. 통과하지 않았으면 0. */
export function starsOf(id: number, stats?: RoomStats): number {
  if (!stats) return 0
  const par = PAR[id] ?? 5
  if (stats.hints === 0 && stats.tries <= par) return 3
  if (stats.hints <= 1 && stats.tries <= par * 2) return 2
  return 1
}

export function starText(n: number): string {
  return '★'.repeat(n) + '☆'.repeat(3 - n)
}

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
      escaped: Boolean(d.escaped),
      finalTries: Number(d.finalTries) || 0,
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
    // 다시 깨서 별이 늘면 그 기록으로 바꾼다
    clearRoom: (id: number, stats: RoomStats) =>
      setProgress((p) => ({
        ...p,
        cleared: p.cleared.includes(id) ? p.cleared : [...p.cleared, id],
        stats: starsOf(id, stats) > starsOf(id, p.stats[id]) ? { ...p.stats, [id]: stats } : p.stats,
      })),
    tryFinal: (correct: boolean) => setProgress((p) => ({ ...p, finalTries: p.finalTries + 1, escaped: p.escaped || correct })),
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
