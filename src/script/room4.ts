// 방 4 온도의 방 대본. 서버가 답하지 못할 때만 내려받아 쓴다. backend/app/room4.py와 같은 규칙이다.
import { QUESTIONS } from '../mock/room4'
import type { TempKind, TempResult } from '../mock/room4'

const SCRIPT: Record<TempKind, string[][][]> = {
  record: [
    [['20도입니다.', '20도입니다.', '20도입니다.']],
    [
      ['20도입니다.', '20도입니다.', '21도입니다.'],
      ['20도입니다.', '19도입니다.', '20도입니다.'],
    ],
    [
      ['20도입니다.', '22도입니다.', '19도입니다.'],
      ['21도입니다.', '18도입니다.', '20도입니다.'],
    ],
    [
      ['24도입니다.', '13도입니다.', '21도입니다.'],
      ['15도입니다.', '22도입니다.', '26도입니다.'],
    ],
  ],
  title: [
    [['빛의 정원', '빛의 정원', '빛의 정원']],
    [
      ['빛의 정원', '빛의 정원', '빛과 그림자'],
      ['빛의 정원', '빛의 기억', '빛의 정원'],
    ],
    [
      ['빛이 머문 자리', '빛의 정원', '새벽빛 수장고'],
      ['빛과 그림자', '빛을 걷는 사람들', '빛의 기억'],
    ],
    [
      ['빛보다 먼 수요일', '고요의 냉장고', '빛, 그리고 젖은 우산'],
      ['등 뒤의 바다 소리', '빛을 삼킨 계단', '수요일의 문장들'],
    ],
  ],
}

const band = (t: number) => (t <= 0.3 ? 0 : t < 0.7 ? 1 : t < 1.5 ? 2 : 3)
const norm = (s: string) => s.replace(/[\s"'“”‘’「」.,!?~]+/g, '')

export function askScripted(kind: TempKind, temperature: number, turn: number): TempResult {
  const t = Math.max(0, Math.min(2, Math.round(temperature * 10) / 10))
  const sets = SCRIPT[kind][band(t)]
  const answers = [...sets[turn % sets.length]]
  const keys = answers.map(norm)
  const same = Math.max(...keys.map((k) => keys.filter((x) => x === k).length))
  const distinct = new Set(keys).size
  const base = { kind, question: QUESTIONS[kind], temperature: t, answers, engine: 'script' as const, same, distinct }
  if (kind === 'title') {
    const onTopic = answers.every((a) => a.includes('빛') && a.length >= 2 && a.length <= 20)
    return { ...base, on_topic: onTopic, pass: distinct === 3 && onTopic }
  }
  return { ...base, numbers: answers.map((a) => (/(\d{1,2})\s*도/.exec(a) ? Number(/(\d{1,2})\s*도/.exec(a)?.[1]) : null)) }
}

export function checkRecordScripted(value: string): { correct: boolean; note: string } {
  const digits = value.replace(/\D/g, '')
  if (digits === '13') return { correct: true, note: '' }
  return { correct: false, note: '삐빅. 기록 자물쇠가 열리지 않습니다. 조절기의 말 말고, 적어 둔 기록을 찾아보세요.' }
}
