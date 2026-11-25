// 배경음 켜기·끄기. 브라우저는 사용자가 누르기 전에는 소리를 못 내므로 처음에는 꺼져 있다.
import { useEffect, useState } from 'react'
import { bgmPlayer, bgmPlaying } from '../game/bgmPlayer'

export default function Bgm() {
  const [on, setOn] = useState(bgmPlaying)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const p = bgmPlayer()
    const sync = () => setOn(!p.paused)
    p.addEventListener('play', sync)
    p.addEventListener('pause', sync)
    return () => {
      p.removeEventListener('play', sync)
      p.removeEventListener('pause', sync)
    }
  }, [])

  async function toggle() {
    const p = bgmPlayer()
    if (!p.paused) {
      p.pause()
      return
    }
    try {
      await p.play()
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
