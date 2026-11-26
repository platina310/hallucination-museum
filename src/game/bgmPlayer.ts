// 배경음 재생기. 화면이 바뀌어도 끊기지 않게 재생기는 하나만 두고, 장소가 바뀌면 곡만 갈아 끼운다.
// 수장고 지도와 정문은 「Empty Basement」, 방은 방마다 다른 곡. 모두 Suno로 만들었다.
// 브라우저는 사용자가 누르기 전에는 소리를 못 내므로, 켜 둔 상태라면 첫 조작 때 시작한다.
export interface Track {
  src: string
  title: string
}

const LOBBY: Track = { src: '/audio/empty-basement.mp3', title: 'Empty Basement' }
// 방 번호별 곡. 여기에 없는 방은 수장고 지도의 곡을 그대로 쓴다
const ROOM_TRACKS: Record<number, Track> = {
  1: { src: '/audio/room1-ticking-room.mp3', title: 'The Ticking Room' },
  2: { src: '/audio/room2-gallery-that-breathes.mp3', title: 'The Gallery That Breathes' },
  3: { src: '/audio/room3-dusty-archive.mp3', title: 'Dusty Archive' },
  4: { src: '/audio/room4-cold-glass-warming.mp3', title: 'Cold Glass Warming' },
  5: { src: '/audio/room5-mechanical-watchfulness.mp3', title: 'Mechanical Watchfulness' },
}

const KEY = 'mukbigwon.bgm'
const VOLUME = 0.35
const FADE_STEPS = 8
const FADE_STEP_MS = 60
let player: HTMLAudioElement | undefined
let current = LOBBY
let held = false // 인트로 영상이 나오는 동안
let armed = false
let fade: ReturnType<typeof setInterval> | undefined

export function bgmPlayer(): HTMLAudioElement {
  if (!player) {
    player = new Audio(current.src)
    player.loop = true
    player.volume = VOLUME
    player.preload = 'none'
    // 방의 곡을 불러오지 못하면 수장고 지도의 곡으로 돌아간다
    player.addEventListener('error', () => {
      if (current !== LOBBY) swap(LOBBY, !held && bgmWanted())
    })
  }
  return player
}

export function bgmTrack(): Track {
  return current
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

function swap(next: Track, play: boolean) {
  const p = bgmPlayer()
  clearInterval(fade)
  current = next
  p.src = next.src
  p.volume = VOLUME
  if (play) start()
}

// 장소가 바뀌면 부른다. room이 null이면 수장고 지도. 소리가 나는 중이면 줄였다가 다음 곡으로 넘어간다
export function setBgmPlace(room: number | null) {
  const next = (room !== null && ROOM_TRACKS[room]) || LOBBY
  const p = bgmPlayer()
  clearInterval(fade)
  if (next.src === current.src) {
    p.volume = VOLUME // 넘어가던 중에 되돌아온 경우
    return
  }
  if (p.paused) {
    swap(next, false)
    return
  }
  let step = FADE_STEPS
  fade = setInterval(() => {
    step -= 1
    p.volume = (VOLUME * Math.max(step, 0)) / FADE_STEPS // 아이폰은 소리 크기를 못 바꿔서 그냥 곡만 바뀐다
    // 줄이는 사이에 배경음을 껐으면 곡만 바꿔 두고 틀지는 않는다
    if (step <= 0) swap(next, !p.paused)
  }, FADE_STEP_MS)
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
