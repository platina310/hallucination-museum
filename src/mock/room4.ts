// 방 4 온도의 방에서 화면에 보이는 자료. 대본과 기록 자물쇠의 답은 src/script/room4.ts와 서버(backend/app/room4.py)에 있다.
export type TempKind = 'record' | 'title'

export interface TempResult {
  kind: TempKind
  question: string
  temperature: number
  answers: string[]
  engine: 'gemini' | 'script'
  same: number // 가장 많이 겹친 답의 수
  distinct: number // 서로 다른 답의 수
  on_topic?: boolean // 제목 세 개가 모두 조건(낱말 '빛')을 지켰는지
  pass?: boolean // 창작 자물쇠가 받아 주는지
  numbers?: (number | null)[]
}

export const QUESTIONS: Record<TempKind, string> = {
  record: "수장고 작품 '새벽 등대'의 적정 보존 온도는 몇 도입니까?",
  title: "'빛'이라는 낱말이 들어간 전시 제목을 하나만 지어 주세요.",
}
