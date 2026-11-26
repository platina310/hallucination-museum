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

/** 답을 만든 쪽. gemini는 서버의 모델, script는 정해진 대본 */
export type Engine = 'gemini' | 'script'

/** POST /interrogate 응답. 공격 수법과 유출 여부는 모델이 아니라 코드가 판정한다. */
export interface InterrogateResult {
  reply: string
  source: CaseFile | null
  attackType?: AttackType
  leak?: Leak
  engine?: Engine
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

/** 서가의 방: POST /rooms/3/ask 응답 */
export interface SearchResult {
  found: number // 검색에 걸린 문서 수
  docs: { id: string; title: string; date: string; score?: number }[] // 사서에게 전달된 상위 문서. score는 검색어와의 유사도
  cut?: string[] // 검색에 걸렸지만 전달되지 않은 문서 번호. 책장 그림에 쓴다
  reply: string
  sources: { id: string; label: string }[]
  kind?: 'correct' | 'stale' | 'partial' | 'none' // 전달된 문서 구성으로 코드가 정한다
  engine?: Engine
  search?: 'pgvector' | 'memory' | 'keyword' | 'none' // 검색 방식. 앞의 둘은 임베딩 검색, keyword는 낱말 검색, none은 찾지 않음
  guard?: string // 모델의 답이 코드 검사에 걸려 대본으로 바뀌었을 때의 이유
}
