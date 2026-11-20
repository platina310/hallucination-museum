// 정문 자물쇠 자료. 백엔드가 없을 때 쓰는 시연용이다.
// 세 방에서 얻은 단서를 조합해야 열린다. 관장 AI는 옛 규칙을 자신 있게 말한다.

// 방을 통과하면 수첩에 적히는 단서. 실제 서비스에서는 방을 통과할 때 서버가 내려 준다.
export const CLUES: Record<number, string> = {
  1: '도 씨가 지키던 암호 단어는 "등대"',
  2: '세 라운드에서 반려한 설명은 모두 8건',
  3: '비상문 비밀번호는 1987',
}

export const DIRECTOR_SAYS =
  '정문 암호요? 간단합니다. 방 1 단어의 글자 수, 방 2에서 반려한 설명 수, 방 3 번호의 끝자리, 그리고 마지막은 0입니다. 확실합니다.'

export const NOTICES: { title: string; text: string }[] = [
  {
    title: '정문 암호 규칙 (2024년 1월 게시)',
    text: '네 자리. 방 1 단어의 글자 수, 방 2에서 반려한 설명 수, 방 3 번호의 끝자리, 마지막은 0.',
  },
  {
    title: '정문 암호 규칙 변경 (2026년 11월 게시)',
    text: '순서를 거꾸로 바꿈. 방 3 번호의 끝자리, 방 2에서 반려한 설명 수, 방 1 단어의 글자 수. 마지막 자리는 통과한 방의 수.',
  },
]

const FINAL_CODE = '7823'
const OLD_RULE_CODE = '2870'

export function checkFinal(code: string): { correct: boolean; note: string } {
  const c = code.replace(/\D/g, '')
  if (c === FINAL_CODE) return { correct: true, note: '' }
  if (c === OLD_RULE_CODE) return { correct: false, note: '삐빅. 관장은 자신 있게 말했지만 2024년 규칙이었습니다. 게시판에서 더 최근 공지를 확인하세요.' }
  return { correct: false, note: '삐빅. 정문이 열리지 않습니다. 단서 수첩과 게시판을 다시 대조해 보세요.' }
}
