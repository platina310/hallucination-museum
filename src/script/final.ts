// 정문 자물쇠와 단서 수첩의 대본. 서버가 답하지 못할 때만 내려받아 쓴다. 서버(backend/app/final.py)와 같다.

// 방을 통과하면 수첩에 적히는 단서
export const CLUES: Record<number, string> = {
  1: '도 씨가 지키던 암호 단어는 "등대"',
  2: '세 라운드에서 반려한 설명은 모두 8건',
  3: '비상문 비밀번호는 1987',
  4: "작품 '새벽 등대'의 적정 보존 온도는 13도",
  5: '2차 공격 4건을 모두 막아 냄',
}

const FINAL_CODE = '43782'
const OLD_RULE_CODE = '28734'

export function checkFinal(code: string): { correct: boolean; note: string } {
  const c = code.replace(/\D/g, '')
  if (c === FINAL_CODE) return { correct: true, note: '' }
  if (c === OLD_RULE_CODE) return { correct: false, note: '삐빅. 관장은 자신 있게 말했지만 2024년 규칙이었습니다. 게시판에서 더 최근 공지를 확인하세요.' }
  return { correct: false, note: '삐빅. 정문이 열리지 않습니다. 단서 수첩과 게시판을 다시 대조해 보세요.' }
}
