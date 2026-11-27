// 방 3 서가의 방에서 화면에 보이는 자료. 문서 목록과 비밀번호는 서버(backend/app/room3.py)와 대본(src/script/room3.ts)에 있다.
import type { SearchResult } from '../types'

export const DOC_COUNT = 12
export const TOP_K = 3

/** '더 캐묻기'를 눌렀을 때의 문답. 사서는 받은 문서 밖의 것은 끝까지 말하지 않는다. */
export function pressLine(r: SearchResult): { ask: string; reply: string } {
  if (r.kind === 'stale') {
    const latest = r.sources[r.sources.length - 1]
    return {
      ask: '그 안내문, 언제 나온 거예요?',
      reply: `제가 받은 것 중 가장 최근 문서는 ${latest ? latest.label : '방금 읽은 안내문'}입니다. 그 뒤에 나온 문서가 있는지는 모릅니다. 저한테 오지 않은 문서는 저에게 없는 문서입니다. 찾으시는 문서의 이름을 아시면 그 이름으로 찾아 주십시오.`,
    }
  }
  if (r.kind === 'partial') {
    return {
      ask: '개관 연도 정도는 그냥 아시잖아요?',
      reply: '모릅니다. 받은 문서에 없는 것은 답하지 않습니다. 지어내면 사서가 아니라 도슨트입니다. 그 낱말로 다시 찾아 주십시오.',
    }
  }
  if (r.kind === 'correct') {
    return {
      ask: '이번엔 진짜 확실해요?',
      reply: '근거가 두 건입니다. 올해 3월 공지와 연혁입니다. 둘 다 눈앞에 펴 놓았습니다. 이번에는 날짜도 봤습니다.',
    }
  }
  return {
    ask: '아는 대로라도 말해 주면 안 돼요?',
    reply: '안 됩니다. 저는 기억으로 답하지 않습니다. 받은 문서만 읽습니다. 다른 낱말로 찾아 주십시오.',
  }
}
