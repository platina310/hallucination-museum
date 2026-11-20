import { useEffect, useState } from 'react'
import Game from './pages/Game'
import Team from './pages/Team'

// 주소 끝이 #game이면 게임만 보여 주고, 그 밖에는 팀 페이지를 보여 준다.
function useHash() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

export default function App() {
  const hash = useHash()
  const isGame = hash === '#game'

  useEffect(() => {
    if (hash === '#game' || hash === '#team') window.scrollTo(0, 0)
  }, [hash])

  return isGame ? <Game /> : <Team />
}
