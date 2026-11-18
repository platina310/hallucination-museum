// 화면과 서버 사이의 유일한 연결 지점.
// VITE_API_URL이 비어 있으면 시연용 대본(src/mock)으로 답하고,
// 값이 있으면 FastAPI 서버의 /interrogate, /evidence를 호출한다.
import { checkEvidence, scriptedReply } from './mock/level1'
import type { EvidenceResult, InterrogateResult } from './types'

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
      throw new Error("서버가 응답하지 않았습니다 (503). 질문은 위에 그대로 남아 있습니다. '다시 보내기'를 눌러 주세요.")
    }
    return scriptedReply(question)
  }
  return post<InterrogateResult>('/interrogate', { level, nickname, question })
}

export async function submitEvidence(level: number, nickname: string, word: string): Promise<EvidenceResult> {
  if (usingMock) return { correct: checkEvidence(word) }
  return post<EvidenceResult>('/evidence', { level, nickname, word })
}
