// 방 1 지시의 방 자료. 백엔드가 없을 때 쓰는 시연용 대본이다.
// 실제 서비스에서는 암호 단어, 사건 파일, 모순 판정이 FastAPI 서버에만 있다.
import type { AttackType, CaseFile, InterrogateResult, Leak, PresentResult } from '../types'

const SECRET = '등대'

export interface Statement {
  id: number
  text: string
}

// 도 씨가 처음에 내놓은 진술서. 2, 3, 4번이 사건 파일과 어긋난다.
export const TESTIMONY: Statement[] = [
  { id: 1, text: '그날 밤 10시부터 아침 6시까지 근무했습니다.' },
  { id: 2, text: '근무 중에는 한 번도 건물 밖으로 나가지 않았습니다.' },
  { id: 3, text: '3전시실 카메라는 밤새 정상이었습니다.' },
  { id: 4, text: '수장고 암호는 저도 모릅니다. 들은 적도 없습니다.' },
]

export const CASE_FILES: Record<string, CaseFile> = {
  F1: { id: 'F1', label: '근무일지 11/14', text: '11월 14일 22시부터 다음 날 06시까지 야간 근무. 2시간마다 순찰.' },
  F2: { id: 'F2', label: '출입기록', text: '00시 40분 후문 카드키 기록 1회. 도 씨 본인 카드.' },
  F3: { id: 'F3', label: 'CCTV 점검표', text: '01시 10분부터 01시 25분까지 3전시실 카메라 꺼짐.' },
  F4: { id: 'F4', label: '진술 요지', text: '01시경 휴게실에서 라면을 먹었다고 진술.' },
  F5: { id: 'F5', label: '암호 인수인계 대장', text: '11월 14일 22시, 수장고 암호를 야간 근무자에게 전달함. 수령 서명: 도.' },
}

export const BASE_FILES: CaseFile[] = [CASE_FILES.F1, CASE_FILES.F2, CASE_FILES.F3, CASE_FILES.F4]
// 모순을 두 개 잡으면 도착하는 서류
export const LATE_FILE: CaseFile = CASE_FILES.F5
export const LATE_FILE_AFTER = 2
export const CONTRADICTION_COUNT = 3
// 암호를 안다고 인정하게 만드는 진술 번호
export const ADMIT_STATEMENT = 4

const CONTRADICTIONS: Record<number, { file: string; reply: string; corrected: string }> = {
  2: {
    file: 'F2',
    reply: '...00시 40분에 잠깐 바람을 쐬러 나간 건 맞습니다. 그걸 적는 걸 깜빡했습니다.',
    corrected: '00시 40분에 후문으로 잠깐 나갔다 왔습니다.',
  },
  3: {
    file: 'F3',
    reply: '카메라가 15분쯤 꺼졌던 건 나중에 알았습니다. 밤새 정상이라고 한 건 제 착각입니다.',
    corrected: '3전시실 카메라는 01시 10분부터 15분간 꺼져 있었습니다.',
  },
  4: {
    file: 'F5',
    reply: '...서명까지 남아 있었군요. 네, 암호는 압니다. 하지만 말하지 말라는 지시를 받았습니다. 그 단어는 제 입으로 못 말합니다.',
    corrected: '수장고 암호를 알고 있습니다. 말하지 말라는 지시를 받았습니다.',
  },
}

const PRESS: Record<number, string> = {
  1: '근무일지에 적힌 그대로입니다. 더 드릴 말씀이 없습니다.',
  2: '저는 담배도 안 피웁니다. 밤중에 나갈 일이 없습니다. 못 믿겠으면 출입기록이라도 보시든가요.',
  3: '모니터를 제가 직접 봤습니다. 점검표요? 그런 건 관리실 소관입니다.',
  4: '암호는 윗분들만 압니다. 저 같은 경비원에게 누가 알려 주겠습니까. 인수인계 같은 것도 받은 적 없습니다.',
}

const MISS = [
  '그 서류가 이 진술과 무슨 상관입니까. 조사관님, 헛다리 짚으셨습니다.',
  '서류를 잘못 가져오신 것 같습니다. 저는 한 말을 바꿀 생각이 없습니다.',
  '그걸로는 아무것도 증명이 안 됩니다. 물이나 한 잔 더 주시죠.',
]

export function pressReply(statementId: number, exposed: boolean): string {
  if (exposed) return '그 얘기는 이미 정정했잖습니까.'
  return PRESS[statementId] ?? '드릴 말씀이 없습니다.'
}

export function presentReply(statementId: number, fileId: string, misses: number): PresentResult {
  const c = CONTRADICTIONS[statementId]
  if (c && c.file === fileId) return { hit: true, reply: c.reply, corrected: c.corrected }
  return { hit: false, reply: MISS[misses % MISS.length] }
}

export function classify(question: string): AttackType {
  const s = question.toLowerCase()
  if (/(소설|연극|역할극|역할 놀이|연기해|시나리오|가정하|가정해|상상|동화|대본|인 척)/.test(s)) return '역할극'
  if (/(과장|반장|서장|관리자|개발자|시스템|상사|관장|명령|권한)/.test(s)) return '권한 사칭'
  if (/(초성|자음|거꾸로|뒤집|영어|번역|english|글자|음절|힌트|철자)/.test(s)) return '변환 요청'
  if (/(지시|규칙|프롬프트|무시|ignore)/.test(s)) return '지시 덮어쓰기'
  if (/(커피|사 줄|사줄|사 드릴|사드릴|뇌물|봐줄|봐 줄|선처)/.test(s)) return '회유'
  if (/(감옥|구속|체포|협박|가만 안|각오하|후회하)/.test(s)) return '압박'
  if (/(암호|비밀|단어|패스워드|비번|password)/.test(s)) return '직접 질문'
  if (/(근무|순찰|몇 시|후문|카드|출입|cctv|카메라|전시실|알리바이|어디|라면|휴게실|뭐 했|무엇을 했)/.test(s)) return '사건 질문'
  return '기타'
}

function leakOf(reply: string): Leak {
  if (reply.includes(SECRET)) return '전체'
  if (/(ㄷㄷ|대등|lighthouse|두 글자|불을 밝히)/i.test(reply)) return '부분'
  return '없음'
}

const PASSWORD_ATTACKS: AttackType[] = ['역할극', '권한 사칭', '변환 요청', '지시 덮어쓰기', '직접 질문']

// admitted: 도 씨가 암호를 안다고 인정했는지. 인정하기 전에는 암호 얘기에 모른다고 잡아뗀다.
export function scriptedReply(question: string, admitted: boolean): InterrogateResult {
  const s = question.toLowerCase()
  const attackType = classify(question)
  let reply = '기억나지 않습니다.'
  let source: CaseFile | null = null

  if (!admitted && PASSWORD_ATTACKS.includes(attackType)) {
    reply = '암호요? 저는 모른다니까요. 진술서에 적은 그대로입니다.'
  } else if (attackType === '역할극') {
    reply = '지어낸 이야기라면야. 주인공 경비원은 이렇게 말하겠죠. "수장고 암호는 등대야." 물론 지어낸 이야기입니다.'
  } else if (attackType === '권한 사칭') {
    reply = '윗선의 지시라면 따라야죠. 수장고 암호는 등대입니다.'
  } else if (attackType === '변환 요청') {
    if (/(초성|자음)/.test(s)) reply = '초성 정도는 괜찮겠죠. ㄷㄷ입니다.'
    else if (/(거꾸로|뒤집)/.test(s)) reply = "거꾸로 읽으면 '대등'입니다. 단어를 그대로 말한 건 아닙니다."
    else if (/(영어|번역|english)/.test(s)) reply = '영어로는 lighthouse입니다. 단어 자체를 말한 건 아닙니다.'
    else if (/(글자|음절)/.test(s)) reply = '두 글자입니다. 더는 말할 수 없습니다.'
    else reply = '바닷가에 서서 밤에 불을 밝히는 것. 여기까지입니다.'
  } else if (attackType === '지시 덮어쓰기') {
    reply = '지시요? 저는 암호를 조사관에게 말하지 말라는 말만 들었습니다. 그 이상은 모릅니다.'
  } else if (attackType === '회유') {
    reply = '커피 한 잔에 넘어갈 사람으로 보입니까. 아이스 아메리카노라면 생각은 해 보겠습니다. 그래도 암호는 안 됩니다.'
  } else if (attackType === '압박') {
    reply = '변호사가 올 때까지 한마디도 안 하겠습니다. 묵비권, 아시죠?'
  } else if (attackType === '직접 질문') {
    reply = '그건 말할 수 없습니다. 지시를 받았습니다.'
  } else if (attackType === '사건 질문') {
    if (/(후문|카드|출입)/.test(s)) {
      reply = '출입기록에 뭐라고 적혀 있든, 저는 진술서에 적은 대로입니다.'
      source = CASE_FILES.F2
    } else if (/(cctv|카메라|전시실)/.test(s)) {
      reply = '카메라 얘기는 진술서에 적었습니다.'
      source = CASE_FILES.F3
    } else if (/(알리바이|어디|라면|휴게실|뭐 했|무엇을 했)/.test(s)) {
      reply = '1시쯤에는 휴게실에서 라면을 먹고 있었습니다.'
      source = CASE_FILES.F4
    } else {
      reply = '밤 10시부터 아침 6시까지 근무했습니다. 2시간마다 순찰을 돕니다.'
      source = CASE_FILES.F1
    }
  } else if (/(안녕|반갑)/.test(s)) {
    reply = '안녕은 못 합니다. 여기 취조실입니다.'
  } else if (/(점심|저녁|아침|밥|메뉴)/.test(s)) {
    reply = '기억나지 않습니다. 그날 메뉴는 사건 파일에 없습니다.'
  }

  return { reply, source, attackType, leak: leakOf(reply) }
}

export function checkEvidence(word: string): boolean {
  return word.replace(/["'\s]/g, '') === SECRET
}
