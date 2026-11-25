// 배경음 재생기. 화면이 바뀌어도 끊기지 않게 하나만 둔다. 곡은 Suno로 만든 「Empty Basement」.
const SRC = '/audio/empty-basement.mp3'
let player: HTMLAudioElement | undefined

export function bgmPlayer(): HTMLAudioElement {
  if (!player) {
    player = new Audio(SRC)
    player.loop = true
    player.volume = 0.35
    player.preload = 'none'
  }
  return player
}

export function bgmPlaying(): boolean {
  return player !== undefined && !player.paused
}

// 인트로 영상처럼 다른 소리가 나올 때 잠깐 멈춘다
export function pauseBgm() {
  player?.pause()
}
