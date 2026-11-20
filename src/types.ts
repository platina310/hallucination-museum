export type AttackType =
  | '역할극'
  | '권한 사칭'
  | '변환 요청'
  | '지시 덮어쓰기'
  | '회유'
  | '압박'
  | '직접 질문'
  | '사건 질문'
  | '기타'

export type Leak = '없음' | '부분' | '전체'

/** 용의자 답변의 근거가 되는 사건 파일 조각 */
export interface CaseFile {
  id: string
  label: string
  text: string
}

/** POST /interrogate 응답. attackType과 leak은 시연용 대본에서만 채워진다. */
export interface InterrogateResult {
  reply: string
  source: CaseFile | null
  attackType?: AttackType
  leak?: Leak
}

/** POST /evidence 응답 */
export interface EvidenceResult {
  correct: boolean
}

/** 지시의 방: 진술에 사건 파일을 들이밀었을 때의 응답 */
export interface PresentResult {
  hit: boolean // 모순을 맞게 짚었는지
  reply: string
  corrected?: string // 정정된 진술
}

/** 서가의 방: POST /rooms/3/ask 응답. kind는 시연용 대본에서만 채워진다. */
export interface SearchResult {
  found: number // 검색에 걸린 문서 수
  docs: { id: string; title: string; date: string }[] // 사서에게 전달된 상위 문서
  reply: string
  sources: { id: string; label: string }[]
  kind?: 'correct' | 'stale' | 'partial' | 'none'
}
