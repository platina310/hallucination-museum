import { useEffect, useState } from 'react'
import Detail from './pages/Detail'
import Idea from './pages/Idea'
import Prototype from './pages/Prototype'

// 주소로 화면을 고른다. LMS에 내는 주소는 앞의 두 개다.
//   /            아이디어 공유 (발표 URL)
//   /prototype   UI 프로토타입 (프로토타입 URL)
//   /detail      상세 자료
// 화면 사이는 일반 링크로 이동한다. 통과한 방과 퀴즈 기록은 브라우저에 저장돼 있어 이동해도 이어진다.
type Route = 'idea' | 'prototype' | 'detail'

function routeOf(pathname: string): Route {
  const p = pathname.replace(/\/+$/, '')
  if (p === '/prototype') return 'prototype'
  if (p === '/detail') return 'detail'
  return 'idea'
}

const TITLES: Record<Route, string> = {
  idea: '환각 미술관 · 팀 페이지',
  prototype: '환각 미술관 · UI 프로토타입',
  detail: '환각 미술관 · 상세 자료',
}

// 예전에 공유한 주소(끝에 #game)는 새 프로토타입 주소로 보낸다.
function isLegacyGameLink() {
  return window.location.hash === '#game' && routeOf(window.location.pathname) === 'idea'
}

export default function App() {
  const route = routeOf(window.location.pathname)
  const [legacy, setLegacy] = useState(isLegacyGameLink)

  useEffect(() => {
    const onHash = () => setLegacy(isLegacyGameLink())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (legacy) window.location.replace('/prototype')
  }, [legacy])

  useEffect(() => {
    document.title = TITLES[route]
  }, [route])

  // 다른 화면에서 "/detail#benchmark"처럼 구역까지 찍어 들어온 경우, 화면이 그려진 뒤 그 구역으로 내려간다.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (id !== '' && id !== 'game') document.getElementById(id)?.scrollIntoView()
  }, [])

  if (legacy) return null
  if (route === 'prototype') return <Prototype />
  if (route === 'detail') return <Detail />
  return <Idea />
}
