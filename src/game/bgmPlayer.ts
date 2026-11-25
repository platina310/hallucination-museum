// 배경음 재생기. 화면이 바뀌어도 끊기지 않게 하나만 둔다. 곡은 Suno로 만든 「Empty Basement」.
// 브라우저는 사용자가 누르기 전에는 소리를 못 내므로, 켜 둔 상태라면 첫 조작 때 시작한다.
const SRC = '/audio/empty-basement.mp3'
const KEY = 'mukbigwon.bgm'
let player: HTMLAudioElement | undefined
let held = false // 인트로 영상이 나오는 동안
let armed = false

export function bgmPlayer(): HTMLAudioElement {
  if (!player) {
    player = new Audio(SRC)
    player.loop = true
    player.volume = 0.35
    player.preload = 'none'
  }
  return player
}

// 끈 적이 없으면 켜진 것으로 본다
export function bgmWanted(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off'
  } catch {
    return true
  }
}

export function setBgmWanted(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off')
  } catch {
    // 저장하지 못해도 이번에는 그대로 동작한다
  }
}

function start() {
  if (held || !bgmWanted()) return
  void bgmPlayer().play().catch(() => {
    // 아직 소리를 낼 수 없는 상태면 다음 조작 때 다시 해 본다
  })
}

// 첫 조작(누르기·키 입력) 때 배경음을 시작한다. 인트로 재생 단추는 영상 소리와 겹치므로 뺀다
export function armBgm() {
  if (armed || typeof document === 'undefined') return
  armed = true
  const onAct = (e: Event) => {
    const t = e.target
    if (t instanceof Element && t.closest('[data-no-bgm]')) return
    if (bgmPlayer().paused) start()
  }
  document.addEventListener('pointerdown', onAct)
  document.addEventListener('keydown', onAct)
}

// 인트로 영상처럼 다른 소리가 나올 때 멈췄다가, 끝나면 다시 튼다
export function holdBgm() {
  held = true
  player?.pause()
}

export function releaseBgm() {
  held = false
  start()
}
