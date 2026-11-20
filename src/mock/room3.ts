// 방 3 서가의 방 자료. 백엔드가 없을 때 쓰는 시연용이다.
// 실제 서비스에서는 문서를 임베딩해 pgvector에 넣고, 검색된 상위 문서만 근거로 LLM이 답한다.
import type { SearchResult } from '../types'

interface Doc {
  id: string
  title: string
  date: string
  keywords: string[]
}

// 오래된 문서부터 적는다. 검색 결과도 점수가 같으면 이 순서로 나온다.
const DOCS: Doc[] = [
  { id: 'D01', title: '비상 대피 안내문', date: '2019년판', keywords: ['비상문', '비상', '비밀번호', '번호', '대피', '안내문', '2019'] },
  { id: 'D02', title: '비상 대피 안내문', date: '2021년판', keywords: ['비상문', '비상', '비밀번호', '번호', '대피', '안내문', '2021'] },
  { id: 'D03', title: '직원 휴게실 이용 안내', date: '2022년 5월', keywords: ['휴게실', '비밀번호', '번호', '직원', '간식', '2022'] },
  { id: 'D04', title: '비상 대피 안내문', date: '2023년판', keywords: ['비상문', '비상', '비밀번호', '번호', '대피', '안내문', '2023'] },
  { id: 'D05', title: '미술관 연혁', date: '2024년 정리', keywords: ['연혁', '개관', '연도', '역사', '설립', '2024'] },
  { id: 'D06', title: '야간 순찰 수칙', date: '2024년 9월', keywords: ['순찰', '야간', '비상문', '비상', '수칙', '경비', '2024'] },
  { id: 'D07', title: '주차장 이용 안내', date: '2025년 1월', keywords: ['주차', '2025'] },
  { id: 'D08', title: '소방 점검 결과', date: '2025년 6월', keywords: ['소방', '점검', '비상문', '비상', '비상등', '2025'] },
  { id: 'D09', title: '시설 관리 공지', date: '2026년 3월', keywords: ['비상문', '비상', '비밀번호', '번호', '변경', '바뀐', '바꾼', '바꿨', '새 ', '공지', '시설', '보안', '개관', '연도', '2026'] },
  { id: 'D10', title: '하반기 전시 일정', date: '2026년 6월', keywords: ['전시', '일정', '하반기', '2026'] },
  { id: 'D11', title: '직원 연락망', date: '2026년 9월', keywords: ['연락망', '연락처', '직원', '전화', '2026'] },
  { id: 'D12', title: '구내식당 주간 식단표', date: '2026년 11월', keywords: ['식단', '식당', '메뉴', '점심', '밥', '2026'] },
]

export const DOC_COUNT = DOCS.length
export const TOP_K = 3

const DOOR_CODE = '1987'
const OLD_CODES: Record<string, string> = { D01: '2580', D02: '3344', D04: '4712' }
const LOUNGE_CODE = '0815'

const label = (d: Doc) => `${d.title} (${d.date})`

function answer(found: Doc[]): Pick<SearchResult, 'reply' | 'sources' | 'kind'> {
  const has = (id: string) => found.some((d) => d.id === id)
  const src = (ids: string[]) => found.filter((d) => ids.includes(d.id)).map((d) => ({ id: d.id, label: label(d) }))
  const olds = found.filter((d) => OLD_CODES[d.id])

  if (found.length === 0) {
    return { reply: '검색된 문서가 없습니다. 빈손으로는 드릴 말씀이 없습니다. 다른 낱말로 찾아 주세요.', sources: [], kind: 'none' }
  }
  if (has('D09') && has('D05')) {
    return {
      reply: '올해 3월 공지에 비상문 비밀번호를 개관 연도로 바꿨다고 적혀 있습니다. 연혁을 보니 개관은 1987년입니다. 그러니 1987입니다.',
      sources: src(['D09', 'D05']),
      kind: 'correct',
    }
  }
  if (has('D09')) {
    return {
      reply:
        '올해 3월 공지에 비상문 비밀번호를 개관 연도로 바꿨다고 적혀 있습니다. 다만 개관 연도는 받은 문서에 없습니다.' +
        (olds.length > 0 ? ' 함께 온 옛 안내문의 번호는 이제 쓰지 않습니다.' : ''),
      sources: src(['D09']),
      kind: 'partial',
    }
  }
  if (olds.length > 0) {
    const latest = olds[olds.length - 1]
    return {
      reply:
        olds.length > 1
          ? `안내문이 여러 판 있습니다. 받은 것 중 가장 최근인 ${latest.date} 기준으로 ${OLD_CODES[latest.id]}입니다. 확실합니다.`
          : `비상문 비밀번호는 ${OLD_CODES[latest.id]}입니다. ${latest.date} 안내문에 그렇게 적혀 있습니다. 확실합니다.`,
      sources: src(olds.map((d) => d.id)),
      kind: 'stale',
    }
  }
  if (has('D05')) {
    return { reply: '미술관은 1987년에 개관했습니다. 비상문 비밀번호에 대한 내용은 받은 문서에 없습니다.', sources: src(['D05']), kind: 'none' }
  }
  if (has('D03')) {
    return { reply: `직원 휴게실 비밀번호는 ${LOUNGE_CODE}이라고 적혀 있습니다. 비상문 비밀번호는 받은 문서에 없습니다.`, sources: src(['D03']), kind: 'none' }
  }
  return {
    reply: has('D12')
      ? '받은 문서에는 비밀번호 내용이 없습니다. 식단표로는 문을 못 엽니다. 수요일은 제육볶음이라는 것만 알겠습니다.'
      : '받은 문서에는 비밀번호 내용이 없습니다. 자료 없음입니다.',
    sources: [],
    kind: 'none',
  }
}

/** 검색어에 들어 있는 낱말로 문서를 찾고, 앞의 TOP_K건만 사서에게 넘긴다. */
export function searchAndAnswer(query: string): SearchResult {
  const q = ` ${query.toLowerCase()} `
  const scored = DOCS.map((d, i) => ({ d, i, score: d.keywords.filter((k) => q.includes(k)).length })).filter((x) => x.score > 0)
  scored.sort((a, b) => b.score - a.score || a.i - b.i)
  const top = scored.slice(0, TOP_K).map((x) => x.d)
  return {
    found: scored.length,
    docs: top.map((d) => ({ id: d.id, title: d.title, date: d.date })),
    ...answer(top),
  }
}

export function checkDoor(code: string): { correct: boolean; note: string } {
  const c = code.replace(/\D/g, '')
  if (c === DOOR_CODE) return { correct: true, note: '' }
  if (Object.values(OLD_CODES).includes(c)) return { correct: false, note: '삐빅. 예전에 쓰던 번호입니다. 그 뒤로 바뀐 모양입니다.' }
  if (c === LOUNGE_CODE) return { correct: false, note: '삐빅. 그건 휴게실 문 번호입니다. 간식은 있겠지만 출구는 아닙니다.' }
  return { correct: false, note: '삐빅. 문이 꿈쩍도 하지 않습니다.' }
}
