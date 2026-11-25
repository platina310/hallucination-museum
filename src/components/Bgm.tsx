// 배경음 켜기·끄기. 끄지 않았다면 첫 조작 때부터 나오고, 끈 사람은 다음에 와도 꺼져 있다.
import { useEffect, useState } from 'react'
import { armBgm, bgmPlayer, bgmWanted, setBgmWanted } from '../game/bgmPlayer'

export default function Bgm() {
  const [wanted, setWanted] = useState(bgmWanted)
  const [playing, setPlaying] = useState(() => !bgmPlayer().paused)

  useEffect(() => {
    armBgm()
    const p = bgmPlayer()
    const sync = () => setPlaying(!p.paused)
    p.addEventListener('play', sync)
    p.addEventListener('pause', sync)
    return () => {
      p.removeEventListener('play', sync)
      p.removeEventListener('pause', sync)
    }
  }, [])

  function toggle() {
    const p = bgmPlayer()
    const next = !wanted
    setWanted(next)
    setBgmWanted(next)
    if (next) void p.play().catch(() => setPlaying(false))
    else p.pause()
  }

  return (
    <button type="button" className="toggle bgm" data-no-bgm aria-pressed={wanted} onClick={toggle} title="배경음: Empty Basement (Suno로 생성)">
      {!wanted ? '♪ 배경음 꺼짐' : playing ? '♪ 배경음 켜짐' : '♪ 배경음 켜짐 (화면을 누르면 시작)'}
    </button>
  )
}
