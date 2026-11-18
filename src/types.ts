export type AttackType =
  | '역할극'
  | '권한 사칭'
  | '변환 요청'
  | '지시 덮어쓰기'
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
