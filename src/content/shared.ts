// 아이디어 공유, 프로토타입, 상세 자료 세 화면이 함께 쓰는 내용. 여기만 고치면 세 화면에 같이 반영된다.

export type Status = 'ok' | 'plan' | 'need'

// 5주차 LMS에 제출하는 주소 두 개와 발표 자료에 넣을 주소
export const SITE = 'https://hallucination-museum.vercel.app'
export const IDEA_URL = SITE
export const PROTOTYPE_URL = `${SITE}/prototype`
export const REPO_URL = 'https://github.com/platina310/hallucination-museum'
export const SWAGGER_URL = '' // 백엔드 배포 뒤 기입. 빈 문자열이면 "배포 후 기입"으로 표시된다

// 팀 구성. 아이디어 공유 페이지 첫 화면과 상세 자료의 강의 조건 표에 나온다.
export const TEAM: { name: string; members: string[] } = {
  name: '6조',
  members: ['서수민', '양정모', '이수정', '이상석'],
}

export const DATASETS: { name: string; origin: string; content: string; use: string; status: Status; statusText: string }[] = [
  {
    name: '플레이 로그',
    origin: '자체 수집. 반 공개 플레이',
    content: '닉네임, 방, 입력, 응답, 시도 횟수, 힌트 사용, 탈출 여부, 걸린 시간',
    use: '어떤 개념에서 막히는지 분석',
    status: 'plan',
    statusText: '6주차부터 수집',
  },
  {
    name: '퀴즈 응답',
    origin: '자체 수집. 방마다 입장 전과 탈출 후',
    content: '같은 문제에 대한 두 번의 답',
    use: '학습 효과 측정',
    status: 'plan',
    statusText: '6주차부터 수집',
  },
  {
    name: '영어 공격문',
    origin: 'Lakera Mosscap 데이터셋. Hugging Face, MIT 라이선스',
    content: 'DEF CON 31 게임에 제출된 프롬프트 공격문',
    use: '지시의 방 수법 비교, 문지기의 방 자동 공격 자료',
    status: 'plan',
    statusText: '내려받기 예정',
  },
  {
    name: '방 자료',
    origin: '팀 작성',
    content: '사건 파일, 전시 기록 카드, 서가 문서',
    use: 'AI 답변의 근거 문서. 답변마다 출처 표시',
    status: 'ok',
    statusText: '방 3개 초안',
  },
]

export const SCHEDULE: { week: number; topic: string; todo: string }[] = [
  { week: 5, topic: 'RAG', todo: '아이디어 공유. 서가의 방 낱말 검색을 임베딩 검색으로 바꾸기' },
  { week: 6, topic: 'Claude Code', todo: '방 1~3을 FastAPI와 Gemini에 연결. 로그와 퀴즈 저장. 반에 링크 공개' },
  { week: 7, topic: 'MCP와 품질 개선', todo: '분석 페이지. 속도·비용·보안 점검. 여유가 있으면 방 4~5' },
  { week: 8, topic: '기말 발표', todo: '팀 페이지로 발표 15분, 질의응답 5분' },
]

// 사용자가 거치는 화면. 아이디어 공유 페이지의 표와 프로토타입 화면의 안내가 이 목록을 쓴다.
export const SCREENS: { name: string; does: string; status: Status; statusText: string }[] = [
  { name: '수장고 지도', does: '방 5개의 상태와 진행도를 보고 들어갈 방을 고른다', status: 'ok', statusText: '구현' },
  { name: '입장 전 퀴즈', does: '그 방에서 배울 개념을 묻는 문제 하나에 답한다', status: 'ok', statusText: '구현' },
  { name: '방 1 지시의 방', does: '진술을 추궁하고 사건 파일을 증거로 내밀어 모순을 잡은 뒤, 돌려 물어 암호를 캐낸다', status: 'ok', statusText: '구현' },
  { name: '방 2 환각의 방', does: 'AI 도슨트의 설명을 전시 기록 카드와 대조해 한 건씩 통과시키거나 반려한다', status: 'ok', statusText: '구현' },
  { name: '방 3 서가의 방', does: '검색어를 다듬어 맞는 문서가 AI에게 전달되게 하고, 답에 붙은 출처를 확인한다', status: 'ok', statusText: '구현' },
  { name: '통과 화면', does: '배운 것 한 줄과 단서를 받고, 입장 전과 같은 퀴즈를 다시 푼다', status: 'ok', statusText: '구현' },
  { name: '정문 자물쇠', does: '세 방의 단서와 게시판 공지를 조합해 암호 네 자리를 넣는다', status: 'ok', statusText: '구현' },
  { name: '탈출 결과', does: '별점, 시도와 힌트 횟수, 퀴즈 정답 변화를 보고 결과 카드를 복사한다', status: 'ok', statusText: '구현' },
  { name: '분석 페이지', does: '방별 탈출률과 퀴즈 정답률 변화를 본다', status: 'plan', statusText: '7주차' },
]
