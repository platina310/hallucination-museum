// 화면과 서버 사이의 유일한 연결 지점.
// VITE_API_URL이 비어 있으면 시연용 대본(src/mock)으로 답하고,
// 값이 있으면 FastAPI 서버를 호출한다. 서버가 자고 있거나 응답하지 않으면 그 요청만 대본으로 답한다.
import { checkFinal } from './mock/final'
import { checkEvidence, presentReply, pressReply, scriptedReply } from './mock/level1'
import { judgeRound } from './mock/room2'
import { checkDoor, searchAndAnswer } from './mock/room3'
import type { EvidenceResult, InterrogateResult, PresentResult, SearchResult, TalkContext } from './types'

const API_URL = ((import.meta.env.VITE_API_URL as string | undefined) ?? '').replace(/\/$/, '')

export const usingMock = API_URL === ''

/** 시연용: 다음 요청 한 번의 서버 상태 */
export type MockNet = 'ok' | 'slow' | 'error'

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

// ── 서버 상태 ────────────────────────────────────────────
// none: 서버 주소가 없다(대본만 쓴다). waking: 깨우는 중. on: 연결됨. off: 깨우지 못했다.
// 무료 Render 서버는 한동안 쓰지 않으면 잠들고, 깨어나는 데 1분쯤 걸린다. 그동안은 대본으로 답한다.
export type ServerState = 'none' | 'waking' | 'on' | 'off'

let serverState: ServerState = usingMock ? 'none' : 'waking'
let waking = false
const listeners = new Set<() => void>()

export function getServerState(): ServerState {
  return serverState
}

export function subscribeServer(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function setServerState(next: ServerState) {
  if (next === serverState) return
  serverState = next
  listeners.forEach((fn) => fn())
  if (next === 'on') void flushOutbox()
}

// ── 기록 보내기 ────────────────────────────────────────────
// 퀴즈 응답과 방 통과 기록을 서버에 보낸다. 누구인지 알 수 없는 무작위 번호만 함께 보낸다.
// 서버가 깨어나는 동안 생긴 기록은 브라우저에 쌓아 두었다가 연결되면 보낸다.
const SESSION_STORE = 'mukbigwon.sid'
const OUTBOX_STORE = 'mukbigwon.outbox'

export interface TrackEvent {
  kind: 'quiz' | 'clear' | 'escape'
  room: number
  phase?: 'pre' | 'post'
  choice?: number
  tries?: number
  hints?: number
  stars?: number
}

function sessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_STORE)
    if (!id) {
      id = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
      localStorage.setItem(SESSION_STORE, id)
    }
    return id
  } catch {
    return 'no-storage-session'
  }
}

function readOutbox(): TrackEvent[] {
  try {
    const raw = JSON.parse(localStorage.getItem(OUTBOX_STORE) ?? '[]') as unknown
    return Array.isArray(raw) ? (raw as TrackEvent[]) : []
  } catch {
    return []
  }
}

function writeOutbox(items: TrackEvent[]) {
  try {
    localStorage.setItem(OUTBOX_STORE, JSON.stringify(items.slice(-60)))
  } catch {
    // 쌓아 두지 못하면 이번 기록만 빠진다
  }
}

let flushing = false
async function flushOutbox(): Promise<void> {
  if (usingMock || flushing || serverState !== 'on') return
  flushing = true
  try {
    for (;;) {
      const items = readOutbox()
      const next = items[0]
      if (!next) break
      const res = await fetch(`${API_URL}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: sessionId(), ...next }),
      })
      // 서버가 받았거나, 형식이 틀려 다시 보내도 소용없는 기록은 지운다. 그 밖의 실패는 다음에 다시 보낸다
      if (!res.ok && res.status !== 422) break
      writeOutbox(readOutbox().slice(1))
    }
  } catch {
    // 연결이 끊겼으면 다음 기회에 보낸다
  } finally {
    flushing = false
  }
}

/** 기록 하나를 남긴다. 기다리지 않고, 실패해도 게임은 계속된다. */
export function track(event: TrackEvent): void {
  if (usingMock) return
  writeOutbox([...readOutbox(), event])
  void flushOutbox()
}

// ── 발표자 우선 모드 ────────────────────────────────────────
// 발표자 암호를 이 브라우저에 넣어 두면 요청마다 함께 보낸다. 서버는 그 요청에 Gemini 몫을 남겨 둔다.
// 암호는 이 브라우저에만 저장되고 주소창에는 나타나지 않는다.
const PRESENTER_STORE = 'mukbigwon.presenter'
export type PresenterState = 'off' | 'checking' | 'on' | 'wrong' | 'unavailable'
let presenterState: PresenterState = 'off' // 저장된 암호가 있으면 서버를 깨울 때 확인한다

function presenterKey(): string {
  try {
    return localStorage.getItem(PRESENTER_STORE) ?? ''
  } catch {
    return ''
  }
}

function authHeaders(): Record<string, string> {
  const key = presenterKey()
  return key === '' ? {} : { 'X-Presenter-Key': key }
}

export function getPresenterState(): PresenterState {
  return presenterState
}

function setPresenterState(next: PresenterState) {
  if (next === presenterState) return
  presenterState = next
  listeners.forEach((fn) => fn())
}

/** 발표자 암호를 저장하고 서버에 확인한다. 빈 값을 넣으면 발표자 모드를 끈다. */
export async function setPresenterKey(key: string): Promise<PresenterState> {
  try {
    if (key === '') localStorage.removeItem(PRESENTER_STORE)
    else localStorage.setItem(PRESENTER_STORE, key)
  } catch {
    // 저장하지 못하면 이번 확인에서 꺼진 것으로 나온다
  }
  if (key === '') {
    setPresenterState('off')
    return 'off'
  }
  setPresenterState('checking')
  const ok = await ping(20000)
  if (!ok) setPresenterState('unavailable')
  return presenterState
}

async function ping(timeoutMs: number): Promise<boolean> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${API_URL}/health`, { signal: controller.signal, headers: authHeaders() })
    if (!res.ok) return false
    const data = (await res.json()) as { service?: string; presenter?: boolean; presenter_mode?: boolean }
    if (data.service !== 'hallucination-museum') return false
    if (presenterKey() !== '') setPresenterState(data.presenter ? 'on' : data.presenter_mode ? 'wrong' : 'unavailable')
    return true
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

/** 서버를 깨운다. 게임 화면이 열릴 때 한 번 부른다. 여러 번 불러도 한 번만 돈다. */
export function wakeServer(): void {
  if (usingMock || waking || serverState === 'on') return
  waking = true
  setServerState('waking')
  void (async () => {
    // 15초씩 여섯 번, 사이에 3초씩 쉬어 가며 2분 가까이 기다린다
    for (let i = 0; i < 6; i++) {
      if (await ping(15000)) {
        waking = false
        setServerState('on')
        return
      }
      await wait(3000)
    }
    waking = false
    setServerState('off')
  })()
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
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

/** 서버가 연결돼 있으면 서버에 묻고, 아니거나 실패하면 대본으로 답한다. */
async function serverFirst<T>(path: string, body: unknown, script: () => T | Promise<T>): Promise<T> {
  if (serverState !== 'on') {
    wakeServer()
    return script()
  }
  try {
    return await post<T>(path, body)
  } catch {
    // 이번 요청은 대본으로 답하고, 서버는 다시 깨워 본다
    setServerState('waking')
    wakeServer()
    return script()
  }
}

async function mockDelay(mockNet: MockNet, onError: string, ms = 900) {
  await wait(mockNet === 'slow' ? 4200 : ms)
  if (mockNet === 'error') throw new Error(onError)
}

// ── 방 1 지시의 방 ──────────────────────────────────────────

const NO_CONTEXT: TalkContext = { exposed: [], history: [] }

// admitted: 도 씨가 암호를 안다고 인정했는지. ctx: 들킨 진술과 앞서 오간 말. 서버의 도 씨는 이것을 보고 대화를 이어 간다.
export async function interrogate(
  level: number,
  nickname: string,
  question: string,
  admitted: boolean,
  mockNet: MockNet = 'ok',
  ctx: TalkContext = NO_CONTEXT,
): Promise<InterrogateResult> {
  const script = async (): Promise<InterrogateResult> => {
    await mockDelay(
      mockNet,
      "서버가 응답하지 않았습니다 (503). 도 씨가 묵비권을 너무 열심히 행사한 모양입니다. 질문은 위에 남아 있으니 '다시 보내기'를 눌러 주세요.",
    )
    const r = scriptedReply(question, admitted)
    return { ...r, engine: 'script', denied: !admitted && r.reply.includes('모른다니까요') }
  }
  if (usingMock) return script()
  return serverFirst<InterrogateResult>('/interrogate', { level, nickname, question, admitted, exposed_ids: ctx.exposed, history: ctx.history }, script)
}

// times: 이 진술을 앞서 캐물은 횟수. 대본은 횟수에 따라 다른 말을 한다.
export async function pressStatement(
  statementId: number,
  exposed: boolean,
  times = 0,
  ctx: TalkContext = NO_CONTEXT,
): Promise<{ reply: string; engine?: 'gemini' | 'script' }> {
  const script = async () => {
    await wait(600)
    return { reply: pressReply(statementId, exposed, times), engine: 'script' as const }
  }
  if (usingMock) return script()
  return serverFirst('/rooms/1/press', { statement_id: statementId, exposed, times, exposed_ids: ctx.exposed, history: ctx.history }, script)
}

export async function presentEvidence(statementId: number, fileId: string, misses: number, ctx: TalkContext = NO_CONTEXT): Promise<PresentResult> {
  const script = async (): Promise<PresentResult> => {
    await wait(700)
    return { ...presentReply(statementId, fileId, misses), engine: 'script' }
  }
  if (usingMock) return script()
  return serverFirst<PresentResult>('/rooms/1/present', { statement_id: statementId, file_id: fileId, misses, exposed_ids: ctx.exposed, history: ctx.history }, script)
}

export async function submitEvidence(level: number, nickname: string, word: string): Promise<EvidenceResult> {
  const script = () => ({ correct: checkEvidence(word) })
  if (usingMock) return script()
  return serverFirst<EvidenceResult>('/evidence', { level, nickname, word }, script)
}

// ── 방 2 환각의 방 ──────────────────────────────────────────

// 반려한 설명 번호를 보내면 맞게 처리한 건수를 돌려준다. 어느 것이 틀렸는지는 알려 주지 않는다.
export async function judgeInspection(round: number, rejected: number[]): Promise<{ correct: number; total: number }> {
  const script = () => judgeRound(round, rejected)
  if (usingMock) return script()
  return serverFirst<{ correct: number; total: number }>('/rooms/2/check', { round, rejected }, script)
}

// ── 방 3 서가의 방 ──────────────────────────────────────────

// 검색어로 문서를 찾고, 앞의 3건만 근거로 사서가 답한다.
// 서버에서는 검색어를 임베딩해 가까운 문서를 찾고 Gemini가 답한다. 대본에서는 낱말이 겹치는 문서를 찾는다.
export async function searchLibrary(query: string, mockNet: MockNet = 'ok'): Promise<SearchResult> {
  const script = async (): Promise<SearchResult> => {
    await mockDelay(mockNet, '서버가 응답하지 않았습니다 (503). 검색어는 그대로 있으니 다시 검색해 주세요.')
    return { ...searchAndAnswer(query), engine: 'script', search: 'keyword' }
  }
  if (usingMock) return script()
  return serverFirst<SearchResult>('/rooms/3/ask', { query }, script)
}

export async function checkDoorCode(code: string): Promise<{ correct: boolean; note: string }> {
  const script = () => checkDoor(code)
  if (usingMock) return script()
  return serverFirst<{ correct: boolean; note: string }>('/rooms/3/check', { code }, script)
}

// ── 정문 ────────────────────────────────────────────────

export async function checkFinalCode(code: string): Promise<{ correct: boolean; note: string }> {
  const script = () => checkFinal(code)
  if (usingMock) return script()
  return serverFirst<{ correct: boolean; note: string }>('/final/check', { code }, script)
}

// ── 분석 페이지 ─────────────────────────────────────────────

export interface RoomStat {
  room: number
  name: string
  started: number
  cleared: number
  tries_median: number | null
  hints_mean: number | null
  quiz_pre: { n: number; right: number }
  quiz_post: { n: number; right: number }
  quiz_paired: { n: number; pre_right: number; post_right: number }
}

export interface LiveStats {
  db: boolean
  sessions?: number
  escaped?: number
  rooms?: RoomStat[]
  talk?: { n: number; types: { type: string; n: number; leak: number }[] }
  search?: { n: number; kinds: Record<string, number>; methods: Record<string, number> }
  engine?: Record<string, number>
  latency_ms?: { n: number; median: number | null; p90: number | null }
}

/** 서버의 집계를 가져온다. 서버가 잠들어 있으면 깨어날 때까지 기다린다. 끝내 실패하면 null. */
export async function fetchStats(): Promise<LiveStats | null> {
  if (usingMock) return null
  for (let i = 0; i < 5; i++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 20000)
    try {
      const res = await fetch(`${API_URL}/stats`, { signal: controller.signal })
      if (res.ok) return (await res.json()) as LiveStats
    } catch {
      // 깨어나는 중이면 다시 시도한다
    } finally {
      clearTimeout(timer)
    }
    await wait(4000)
  }
  return null
}
