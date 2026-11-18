// 게임만 있는 화면. 반 친구들에게 공유할 때는 주소 끝에 #game을 붙인다.
import InterrogationRoom from '../components/InterrogationRoom'

export default function GamePage() {
  return (
    <>
      <div className="top">
        <div className="wrap">
          <span className="mono brand">묵비권</span>
          <nav aria-label="화면 이동">
            <a href="#team">팀 페이지 보기</a>
          </nav>
        </div>
      </div>
      <main className="game">
        <div className="wrap">
          <h1 className="game-title">레벨 1 · 야간 경비원 도 씨</h1>
          <InterrogationRoom />
        </div>
      </main>
    </>
  )
}
