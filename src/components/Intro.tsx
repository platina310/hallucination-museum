// 게임을 시작할 때 보여 주는 인트로 영상. 보기와 건너뛰기를 고른다.
// 브라우저는 누르기 전에는 소리 나는 영상을 틀 수 없어서 자동 재생하지 않는다.
import { useRef, useState } from 'react'
import { holdBgm, releaseBgm } from '../game/bgmPlayer'

export default function Intro({ onDone }: { onDone: () => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)

  function play() {
    holdBgm()
    setStarted(true)
    void video.current?.play()
  }

  function done() {
    video.current?.pause()
    releaseBgm()
    onDone()
  }

  return (
    <div className="intro">
      <div className="intro-frame">
        <video
          ref={video}
          src="/video/intro.mp4"
          poster="/video/intro-poster.jpg"
          preload="none"
          playsInline
          controls={started}
          onEnded={done}
          aria-label="환각 미술관 인트로 영상. 야간 점검원이 지하 수장고에 갇히고, AI 문지기 셋을 만나는 이야기. 화면에 대사가 자막으로 나온다."
        />
        {!started && (
          <button type="button" className="intro-play" data-no-bgm onClick={play}>
            <span aria-hidden="true">▶</span> 인트로 보기 <span className="mono">1분 11초 · 소리 있음</span>
          </button>
        )}
      </div>
      <div className="intro-foot">
        <p>
          당신은 오늘 밤의 <b>야간 점검원</b>입니다. 마지막 구역은 지하 수장고.
        </p>
        <button type="button" className="btn" onClick={done}>
          {started ? '영상 닫고 시작하기' : '건너뛰고 시작하기'}
        </button>
      </div>
    </div>
  )
}
