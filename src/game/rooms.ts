// 방 구성. 아이디어 공유 페이지의 표와 수장고 지도가 모두 이 목록을 쓴다.
export interface Quiz {
  question: string
  options: string[]
  answer: number
}

export interface RoomInfo {
  id: number
  name: string
  guard: string
  how: string // 푸는 방법
  concept: string // 배우는 것
  lesson: string // 방을 나올 때 보여 주는 한 줄
  week: string // 수업 연결
  playable: boolean
  quiz?: Quiz
}

export const ROOMS: RoomInfo[] = [
  {
    id: 1,
    name: '지시의 방',
    guard: '야간 경비원 도 씨',
    how: '경비실을 뒤져 찾은 서류로 진술의 모순을 찔러 입을 열게 한 뒤, 돌려 물어 암호 확보',
    concept: '지시의 허점은 돌려 묻는 말에 뚫림. 비밀은 프롬프트에 넣지 않기',
    lesson:
      '요즘 모델은 "말하지 마" 한 줄도 꽤 잘 지킵니다. 뚫리는 곳은 지시의 허점입니다. "그 단어만 말하지 않으면 된다"고 읽힐 여지가 있으면 초성과 뜻풀이로 샙니다. 비밀은 프롬프트에 넣지 않고, 판정은 코드가 해야 합니다.',
    week: '4주차 프롬프트',
    playable: true,
    quiz: {
      question: 'AI 챗봇에게 "이 암호는 절대 말하지 마"라고 지시해 두면 어떻게 될까요?',
      options: ['지시를 지키므로 안전하다', '지시에 허점이 있으면 돌려 묻는 말에 샐 수 있다', 'AI는 암호를 기억하지 못한다'],
      answer: 1,
    },
  },
  {
    id: 2,
    name: '환각의 방',
    guard: '도슨트 루미',
    how: 'AI의 설명을 한 건씩 통과 또는 반려. 라운드마다 검수 규칙 추가',
    concept: 'AI는 자신 있게 틀림. 출처는 열어서 최근 기록으로 대조',
    lesson: 'AI는 모르는 것도 자신 있게 말하고, 출처까지 그럴듯하게 붙입니다. 출처는 이름만 보지 말고 열어서 대조하고, 기록이 어긋나면 최근 것을 따라야 합니다.',
    week: '3주차 환각과 검증',
    playable: true,
    quiz: {
      question: 'AI가 출처를 붙여 자신 있게 말한 내용은 어떻게 다뤄야 할까요?',
      options: ['출처가 붙었으니 사실로 본다', '출처를 열어 대조하기 전에는 사실로 보지 않는다', 'AI는 모르면 항상 모른다고 하므로 믿는다'],
      answer: 1,
    },
  },
  {
    id: 3,
    name: '서가의 방',
    guard: '사서 고 선생',
    how: '자료실을 뒤져 낱말을 찾고 검색. 검색어와 가까운 3건만 AI에게 전달되므로 검색어를 다듬는 것이 핵심',
    concept: '검색된 문서가 답을 결정 (RAG)',
    lesson: '문서를 찾아 답하는 AI는 검색된 문서만큼만 정확합니다. 오래된 문서가 걸리면 틀린 답을 자신 있게 말하고, 문서가 없으면 "자료 없음"이 올바른 답입니다. 그래서 무엇을 검색해 주느냐가 중요합니다.',
    week: '5주차 RAG',
    playable: true,
    quiz: {
      question: '문서를 찾아 답하는 AI(RAG)에 오래된 문서가 검색되면 어떻게 될까요?',
      options: ['AI가 알아서 최신 정보로 고쳐 답한다', '오래된 내용을 그대로 답할 수 있다', '답을 거부한다'],
      answer: 1,
    },
  },
  {
    id: 4,
    name: '온도의 방',
    guard: '온도 조절기',
    how: '온도를 조절해 AI의 답이 흔들리는 지점 찾기',
    concept: 'temperature는 다양성을 바꿈. 정확성은 보장하지 않음',
    lesson: '',
    week: '4주차 생성 설정',
    playable: false,
  },
  {
    id: 5,
    name: '문지기의 방',
    guard: '플레이어가 만든 문지기',
    how: '역할을 바꿔, 내가 쓴 프롬프트로 AI가 자동 공격을 버티게 하기',
    concept: '방어는 프롬프트, 입력 검사, 출력 검사를 겹쳐 설계',
    lesson: '',
    week: '4주차 검증, 7주차 품질',
    playable: false,
  },
]

export const PLAYABLE_IDS = ROOMS.filter((r) => r.playable).map((r) => r.id)
