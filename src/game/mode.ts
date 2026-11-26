// 일반·하드 모드. 하드 모드에서는 맞힐 때마다 문지기가 조금씩 무섭게 변한다. 문제, 음악, 방의 분위기는 두 모드가 같다.
// 고른 모드는 브라우저에 저장하고, 화면 어디서 바꿔도 바로 반영되게 한 곳에서 관리한다.
import { useSyncExternalStore } from 'react'

const KEY = 'mukbigwon.mode'
const listeners = new Set<() => void>()

function load(): boolean {
  try {
    return localStorage.getItem(KEY) === 'hard'
  } catch {
    return false
  }
}

let hard = load()

export function setHardMode(on: boolean) {
  hard = on
  try {
    localStorage.setItem(KEY, on ? 'hard' : 'normal')
  } catch {
    // 저장하지 못해도 이번 접속에서는 동작한다
  }
  listeners.forEach((f) => f())
}

function subscribe(f: () => void) {
  listeners.add(f)
  return () => {
    listeners.delete(f)
  }
}

/** 지금 하드 모드인지. 기본은 일반 모드다. */
export function useHardMode(): boolean {
  return useSyncExternalStore(subscribe, () => hard)
}
