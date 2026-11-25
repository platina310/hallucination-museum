// 배경음 켜기·끄기. 곡은 Suno로 만든 「Empty Basement」이다.
// 브라우저는 사용자가 누르기 전에는 소리를 못 내므로 처음에는 꺼져 있다.
// 화면이 바뀌어도 끊기지 않게 재생기는 파일 하나에 하나만 둔다.
import { useEffect, useState } from 'react'

const SRC = '/audio/empty-basement.mp3'
let player: HTMLAudioElement | undefined

function getPlayer(): HTMLAudioElement {
  if (!player) {
    player = new Audio(SRC)
    player.loop = true
    player.volume = 0.35
    player.preload = 'none'
  }
  return player
}

export default function Bgm() {
  const [on, setOn] = useState(() => player !== undefined && !player.paused)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!player) return
    const p = player
    const sync = () => setOn(!p.paused)
    p.addEventListener('play', sync)
    p.addEventListener('pause', sync)
    return () => {
      p.removeEventListener('play', sync)
      p.removeEventListener('pause', sync)
    }
  }, [on])

  async function toggle() {
    const p = getPlayer()
    if (!p.paused) {
      p.pause()
      setOn(false)
      return
    }
    try {
      await p.play()
      setOn(true)
      setFailed(false)
    } catch {
      setFailed(true)
    }
  }

  return (
    <button type="button" className="toggle bgm" aria-pressed={on} onClick={() => void toggle()} title="배경음: Empty Basement (Suno로 생성)">
      {failed ? '배경음을 틀지 못했어요' : on ? '♪ 배경음 켜짐' : '♪ 배경음 듣기'}
    </button>
  )
}
