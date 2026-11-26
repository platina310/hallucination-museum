// 일반·하드 모드 고르기. 하드 모드에서는 틀릴수록 문지기가 무섭게 변한다. 이용 흐름 표시줄 오른쪽에 둔다.
import { setHardMode, useHardMode } from '../game/mode'

export default function ModeSwitch() {
  const hard = useHardMode()
  return (
    <span className="seg mode" role="group" aria-label="게임 모드" title="하드 모드: 틀릴수록 문지기가 무섭게 변합니다. 문제와 음악은 일반 모드와 같습니다">
      <button type="button" aria-pressed={!hard} onClick={() => setHardMode(false)}>
        일반
      </button>
      <button type="button" aria-pressed={hard} onClick={() => setHardMode(true)}>
        하드
      </button>
    </span>
  )
}
