// 단서 수첩. 방을 통과하면 서버가 내려 준 단서를 이 브라우저에 적어 둔다.
// 단서에는 정답이 들어 있어 화면 코드에 미리 넣어 두지 않는다.
import { useSyncExternalStore } from 'react'

const STORE = 'mukbigwon.clues'

function read(): Record<number, string> {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) ?? '{}') as unknown
    if (raw === null || typeof raw !== 'object') return {}
    const out: Record<number, string> = {}
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof v === 'string' && v.length <= 80) out[Number(k)] = v
    }
    return out
  } catch {
    return {}
  }
}

let clues = read()
const listeners = new Set<() => void>()

export function getClues(): Record<number, string> {
  return clues
}

/** 방의 단서를 수첩에 적는다. */
export function rememberClue(room: number, clue: string | undefined): void {
  if (!clue || clues[room] === clue) return
  clues = { ...clues, [room]: clue }
  try {
    localStorage.setItem(STORE, JSON.stringify(clues))
  } catch {
    // 저장하지 못하면 이 화면을 닫을 때까지만 기억한다
  }
  listeners.forEach((fn) => fn())
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useClues(): Record<number, string> {
  return useSyncExternalStore(subscribe, getClues)
}
