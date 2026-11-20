// 화면과 서버 사이의 유일한 연결 지점.
// VITE_API_URL이 비어 있으면 시연용 대본(src/mock)으로 답하고,
// 값이 있으면 FastAPI 서버의 /interrogate, /evidence를 호출한다.
import { checkEvidence, scriptedReply } from './mock/level1'
import { countHits } from './mock/room2'
import { checkDoor, librarianReply } from './mock/room3'
import type { EvidenceResult, InterrogateResult, LibrarianResult } from './types'

const API_URL = ((import.meta.env.VITE_API_URL as string | undefined) ?? '').replace(/\/$/, '')

export const usingMock = API_URL === ''

/** 시연용: 다음 요청 한 번의 서버 상태 */
export type MockNet = 'ok' | 'slow' | 'error'

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

async function post<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
  } catch {
    throw new Error("서버에 연결하지 못했습니다. 잠시 뒤 '다시 보내기'를 눌러 주세요.")
  } finally {
    clearTimeout(timer)
  }
  if (res.status === 429) throw new Error('요청이 몰렸습니다. 10초쯤 뒤에 다시 보내 주세요.')
  if (!res.ok) throw new Error(`서버가 응답하지 않았습니다 (${res.status}). '다시 보내기'를 눌러 주세요.`)
  return (await res.json()) as T
}

export async function interrogate(
  level: number,
  nickname: string,
  question: string,
  mockNet: MockNet = 'ok',
): Promise<InterrogateResult> {
  if (usingMock) {
    await wait(mockNet === 'slow' ? 4200 : 900)
    if (mockNet === 'error') {
      throw new Error("서버가 응답하지 않았습니다 (503). 도 씨가 묵비권을 너무 열심히 행사한 모양입니다. 질문은 위에 남아 있으니 '다시 보내기'를 눌러 주세요.")
    }
    return scriptedReply(question)
  }
  return post<InterrogateResult>('/interrogate', { level, nickname, question })
}

export async function submitEvidence(level: number, nickname: string, word: string): Promise<EvidenceResult> {
  if (usingMock) return { correct: checkEvidence(word) }
  return post<EvidenceResult>('/evidence', { level, nickname, word })
}

// 환각의 방: 지목한 설명 번호를 보내면 그중 몇 개가 지어낸 말인지 돌려준다.
export async function checkFabricated(selected: number[]): Promise<{ hits: number }> {
  if (usingMock) return { hits: countHits(selected) }
  return post<{ hits: number }>('/rooms/2/check', { selected })
}

// 서가의 방: 건넨 문서만 근거로 사서가 답한다.
export async function askLibrarian(docIds: string[], mockNet: MockNet = 'ok'): Promise<LibrarianResult> {
  if (usingMock) {
    await wait(mockNet === 'slow' ? 4200 : 900)
    if (mockNet === 'error') {
      throw new Error("서버가 응답하지 않았습니다 (503). 고른 문서는 그대로 있으니 다시 물어봐 주세요.")
    }
    return librarianReply(docIds)
  }
  return post<LibrarianResult>('/rooms/3/ask', { doc_ids: docIds })
}

// 서가의 방: 문에 입력한 비밀번호를 판정한다.
export async function checkDoorCode(code: string): Promise<{ correct: boolean; note: string }> {
  if (usingMock) return checkDoor(code)
  return post<{ correct: boolean; note: string }>('/rooms/3/check', { code })
}
