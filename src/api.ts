// 화면과 서버 사이의 유일한 연결 지점.
// VITE_API_URL이 비어 있으면 시연용 대본(src/mock)으로 답하고,
// 값이 있으면 FastAPI 서버를 호출한다.
import { checkFinal } from './mock/final'
import { checkEvidence, presentReply, pressReply, scriptedReply } from './mock/level1'
import { judgeRound } from './mock/room2'
import { checkDoor, searchAndAnswer } from './mock/room3'
import type { EvidenceResult, InterrogateResult, PresentResult, SearchResult } from './types'

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
    throw new Error('서버에 연결하지 못했습니다. 잠시 뒤 다시 시도해 주세요.')
  } finally {
    clearTimeout(timer)
  }
  if (res.status === 429) throw new Error('요청이 몰렸습니다. 10초쯤 뒤에 다시 시도해 주세요.')
  if (!res.ok) throw new Error(`서버가 응답하지 않았습니다 (${res.status}). 다시 시도해 주세요.`)
  return (await res.json()) as T
}

async function mockDelay(mockNet: MockNet, onError: string, ms = 900) {
  await wait(mockNet === 'slow' ? 4200 : ms)
  if (mockNet === 'error') throw new Error(onError)
}

// ── 방 1 지시의 방 ──────────────────────────────────────────

// admitted: 도 씨가 암호를 안다고 인정했는지. 실제 서버에서는 서버가 진행 상태를 기억한다.
export async function interrogate(
  level: number,
  nickname: string,
  question: string,
  admitted: boolean,
  mockNet: MockNet = 'ok',
): Promise<InterrogateResult> {
  if (usingMock) {
    await mockDelay(
      mockNet,
      "서버가 응답하지 않았습니다 (503). 도 씨가 묵비권을 너무 열심히 행사한 모양입니다. 질문은 위에 남아 있으니 '다시 보내기'를 눌러 주세요.",
    )
    return scriptedReply(question, admitted)
  }
  return post<InterrogateResult>('/interrogate', { level, nickname, question })
}

export async function pressStatement(statementId: number, exposed: boolean): Promise<{ reply: string }> {
  if (usingMock) {
    await wait(600)
    return { reply: pressReply(statementId, exposed) }
  }
  return post<{ reply: string }>('/rooms/1/press', { statement_id: statementId })
}

export async function presentEvidence(statementId: number, fileId: string, misses: number): Promise<PresentResult> {
  if (usingMock) {
    await wait(700)
    return presentReply(statementId, fileId, misses)
  }
  return post<PresentResult>('/rooms/1/present', { statement_id: statementId, file_id: fileId })
}

export async function submitEvidence(level: number, nickname: string, word: string): Promise<EvidenceResult> {
  if (usingMock) return { correct: checkEvidence(word) }
  return post<EvidenceResult>('/evidence', { level, nickname, word })
}

// ── 방 2 환각의 방 ──────────────────────────────────────────

// 반려한 설명 번호를 보내면 맞게 처리한 건수를 돌려준다. 어느 것이 틀렸는지는 알려 주지 않는다.
export async function judgeInspection(round: number, rejected: number[]): Promise<{ correct: number; total: number }> {
  if (usingMock) return judgeRound(round, rejected)
  return post<{ correct: number; total: number }>('/rooms/2/check', { round, rejected })
}

// ── 방 3 서가의 방 ──────────────────────────────────────────

// 검색어로 문서를 찾고, 앞의 3건만 근거로 사서가 답한다.
export async function searchLibrary(query: string, mockNet: MockNet = 'ok'): Promise<SearchResult> {
  if (usingMock) {
    await mockDelay(mockNet, '서버가 응답하지 않았습니다 (503). 검색어는 그대로 있으니 다시 검색해 주세요.')
    return searchAndAnswer(query)
  }
  return post<SearchResult>('/rooms/3/ask', { query })
}

export async function checkDoorCode(code: string): Promise<{ correct: boolean; note: string }> {
  if (usingMock) return checkDoor(code)
  return post<{ correct: boolean; note: string }>('/rooms/3/check', { code })
}

// ── 정문 ────────────────────────────────────────────────

export async function checkFinalCode(code: string): Promise<{ correct: boolean; note: string }> {
  if (usingMock) return checkFinal(code)
  return post<{ correct: boolean; note: string }>('/final/check', { code })
}
