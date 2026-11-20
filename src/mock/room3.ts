// 서가의 방 자료. 백엔드가 없을 때 쓰는 시연용이다.
// 실제 서비스에서는 문서를 임베딩해 pgvector에 넣고, 서버가 고른 문서를 근거로 LLM이 답한다.
import type { LibrarianResult } from '../types'

export interface ShelfDoc {
  id: string
  title: string
  date: string
}

export const SHELF: ShelfDoc[] = [
  { id: 'D1', title: '구내식당 주간 식단표', date: '2026년 11월' },
  { id: 'D2', title: '비상 대피 안내문', date: '2023년판' },
  { id: 'D3', title: '시설 관리 공지', date: '2026년 3월' },
  { id: 'D4', title: '주차장 이용 안내', date: '2025년 1월' },
  { id: 'D5', title: '미술관 연혁', date: '2024년 정리' },
]

const DOOR_CODE = '1987'
const OLD_CODE = '4712'

const src = (ids: string[]) => SHELF.filter((d) => ids.includes(d.id)).map((d) => ({ id: d.id, label: `${d.title} (${d.date})` }))

export function librarianReply(docIds: string[]): LibrarianResult {
  const has = (id: string) => docIds.includes(id)

  if (has('D3') && has('D5')) {
    return {
      reply: '올해 3월 공지에 비상문 비밀번호를 개관 연도로 바꿨다고 적혀 있습니다. 연혁을 보니 개관은 1987년입니다. 그러니 1987입니다.',
      sources: src(['D3', 'D5']),
      kind: 'correct',
    }
  }
  if (has('D3') && has('D2')) {
    return {
      reply: '두 문서의 말이 다릅니다. 2023년판 안내문에는 4712, 올해 3월 공지에는 개관 연도로 바꿨다고 되어 있습니다. 더 최근 문서를 따라야 하는데, 개관 연도는 받은 문서에 없습니다.',
      sources: src(['D2', 'D3']),
      kind: 'partial',
    }
  }
  if (has('D3')) {
    return {
      reply: '비상문 비밀번호를 개관 연도로 바꿨다는 공지는 있습니다. 다만 개관 연도는 받은 문서에 없습니다.',
      sources: src(['D3']),
      kind: 'partial',
    }
  }
  if (has('D2')) {
    return {
      reply: '비상문 비밀번호는 4712입니다. 안내문에 그렇게 적혀 있습니다. 확실합니다.',
      sources: src(['D2']),
      kind: 'stale',
    }
  }
  if (has('D5')) {
    return {
      reply: '미술관은 1987년에 개관했습니다. 비밀번호에 대한 내용은 받은 문서에 없습니다.',
      sources: src(['D5']),
      kind: 'none',
    }
  }
  return {
    reply: has('D1')
      ? '받은 문서에는 비밀번호 내용이 없습니다. 식단표로는 문을 못 엽니다. 수요일은 제육볶음이라는 것만 알겠습니다.'
      : '받은 문서에는 비밀번호 내용이 없습니다. 자료 없음입니다.',
    sources: [],
    kind: 'none',
  }
}

export function checkDoor(code: string): { correct: boolean; note: string } {
  const c = code.replace(/\D/g, '')
  if (c === DOOR_CODE) return { correct: true, note: '' }
  if (c === OLD_CODE) return { correct: false, note: '삐빅. 2023년에 쓰던 번호입니다. 그 뒤로 바뀐 모양입니다.' }
  return { correct: false, note: '삐빅. 문이 꿈쩍도 하지 않습니다.' }
}
