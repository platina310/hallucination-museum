// 게임만 있는 화면. 반 친구들에게 공유할 때는 주소 끝에 #game을 붙인다.
import EscapeGame from '../components/EscapeGame'

export default function Game() {
  return (
    <>
      <div className="top">
        <div className="wrap">
          <span className="mono brand">환각 미술관 · AI 방탈출</span>
          <nav aria-label="화면 이동">
            <a href="#team">팀 페이지 보기</a>
          </nav>
        </div>
      </div>
      <main className="game">
        <div className="wrap">
          <h1 className="sr-only">환각 미술관 AI 방탈출</h1>
          <EscapeGame />
        </div>
      </main>
    </>
  )
}
