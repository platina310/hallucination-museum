// UI 프로토타입 화면 (/prototype). LMS에 내는 프로토타입 URL이 이 화면이다.
// 위쪽 안내에서 주요 화면 구성과 이용 흐름을 확인하고, 아래에서 바로 해 본다.
import { useState } from 'react'
import EscapeGame from '../components/EscapeGame'
import { Pill } from '../components/Marks'
import { usingMock } from '../api'
import { SCREENS } from '../content/shared'

export default function Prototype() {
  const [demo, setDemo] = useState(false)

  return (
    <>
      <div className="top">
        <div className="wrap">
          <span className="mono brand">
            환각 미술관<span className="course"> · UI 프로토타입</span>
          </span>
          <nav aria-label="화면 이동">
            <a href="/">팀 페이지</a>
            <a href="/detail">상세 자료</a>
          </nav>
        </div>
      </div>
      <main className="game">
        <div className="wrap">
          <h1 className="sr-only">환각 미술관 UI 프로토타입</h1>

          <div className="proto-guide">
            <p>
              <b className="mono">프로토타입</b> 방 다섯 개(본관 셋, 별관 둘)와 정문까지 플레이 가능. 환각의 방을 뺀 네 방은 서버의
              Gemini가 답변. 서버가 쉬는 중이거나 한도를 넘으면 정해진 대본으로 답변
            </p>
            <div className="proto-guide-ctl">
              <details>
                <summary>주요 화면 {SCREENS.length}개 보기</summary>
                <ol className="screens">
                  {SCREENS.map((s) => (
                    <li key={s.name}>
                      <b>{s.name}</b> <Pill kind={s.status}>{s.statusText}</Pill>
                      <span>{s.does}</span>
                    </li>
                  ))}
                </ol>
              </details>
              {/* 시연용 조작은 대본만 쓰는 화면에서 로딩과 오류 화면을 보여 줄 때 쓴다. 서버에 연결된 화면에서는 숨긴다 */}
              {usingMock && (
                <button className="toggle" type="button" aria-pressed={demo} onClick={() => setDemo((d) => !d)}>
                  시연용 조작 {demo ? '켜짐' : '꺼짐'}
                </button>
              )}
            </div>
            {demo && (
              <p className="muted proto-guide-note">
                지시의 방과 서가의 방에 서버 상태(정상, 느림, 오류) 단추 표시. 로딩과 오류 화면을 확인할 때 사용
              </p>
            )}
          </div>

          <EscapeGame demoControls={demo} />
        </div>
      </main>
    </>
  )
}
