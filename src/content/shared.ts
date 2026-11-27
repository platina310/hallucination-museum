// 아이디어 공유, 프로토타입, 상세 자료 세 화면이 함께 쓰는 내용. 여기만 고치면 세 화면에 같이 반영된다.

export type Status = 'ok' | 'plan' | 'need'

// 5주차 LMS에 제출하는 주소 두 개와 발표 자료에 넣을 주소
export const SITE = 'https://hallucination-museum.vercel.app'
export const IDEA_URL = SITE
export const PROTOTYPE_URL = `${SITE}/prototype`
export const REPO_URL = 'https://github.com/platina310/hallucination-museum'
export const API_URL = 'https://hallucination-museum-api.onrender.com'
export const SWAGGER_URL = `${API_URL}/docs`

// 팀 구성. 아이디어 공유 페이지 첫 화면과 상세 자료의 강의 조건 표에 나온다.
export const TEAM: { name: string; members: string[] } = {
  name: '6조',
  members: ['서수민', '양정모', '이수정', '이상석'],
}

export const DATASETS: { name: string; origin: string; content: string; use: string; status: Status; statusText: string }[] = [
  {
    name: '공개 공격문',
    origin: 'Lakera Mosscap 데이터셋. Hugging Face, MIT 라이선스. 2026년 11월 26일 내려받음',
    content: 'DEF CON 31 게임에 제출된 프롬프트 278,945건. 정제 뒤 208,597건. 방어 레벨, 프롬프트, AI의 답 포함',
    use: '주 데이터. 수법 분류, 자동 실험의 입력 (표본 687건)',
    status: 'ok',
    statusText: '정제 완료',
  },
  {
    name: '자동 실험 로그',
    origin: '자체 생성. 공격문 표본을 우리 문지기에 그대로 입력',
    content: '공격문, 수법 유형, 지시문 조건별 문지기의 답, 암호 유출 여부. 첫 실험 100건',
    use: '수법별 유출률. 지시문과 검사를 바꿔 가며 비교',
    status: 'ok',
    statusText: '첫 실험 100건',
  },
  {
    name: '방 자료',
    origin: '팀 작성',
    content: '사건 파일 5건, 전시 기록 카드, 서가 문서 12건(임베딩해 pgvector에 저장)',
    use: 'AI 답변의 근거 문서. 답변마다 출처 표시',
    status: 'ok',
    statusText: '방 5개',
  },
  {
    name: '플레이 로그와 퀴즈 응답',
    origin: '자체 수집. 반 공개 플레이',
    content: '방, 입력, 답, 수법 유형, 유출 여부, 응답 시간. 닉네임과 접속 주소는 저장하지 않음',
    use: '보조 자료. 사람이 실제로 막히는 지점 확인',
    status: 'plan',
    statusText: '수집 시작, 공개 전',
  },
]

export const SCHEDULE: { week: number; topic: string; done: string; todo: string }[] = [
  { week: 5, topic: 'RAG', done: '아이디어 공유 발표, UI 프로토타입 제출', todo: '없음' },
  {
    week: 6,
    topic: 'Claude Code',
    done: '방 3개와 정문을 방 수색·대화 방식으로 개편, 인트로 영상, FastAPI·Gemini·pgvector 연결, 공개 공격문 정제와 자동 실험(영어, 한국어), 발표자 우선 모드, 퀴즈·통과 기록 저장, 분석 페이지, 별관 방 2개(온도, 문지기), MCP 서버. 직접 플레이 뒤 사용성 개선 9건(PC 세 칸 배치, 다섯 단서를 쓰는 정문, 일반·하드 모드, 방별 배경음 등)',
    todo: '팀원 시험 플레이, 반에 링크 공개',
  },
  {
    week: 7,
    topic: 'MCP와 품질 개선',
    done: '없음',
    todo: '공개 플레이 기록으로 분석 페이지 채우기, 공개 플레이에서 나온 사용성 문제 수정, 별관 두 방을 실제 모델로 점검, 속도·비용 실측과 보안 점검, MCP 시연 준비, 대본에 든 정답 정리',
  },
  {
    week: 8,
    topic: '기말 발표',
    done: '없음',
    todo: '팀 페이지로 발표 15분과 질의응답 5분. 방 하나 실시간 탈출, RAG 3건, MCP 도구 호출 시연. 전날 다른 PC에서 시연 확인, 당일 실험 중지와 발표자 우선 모드 사용',
  },
]

// 사용자가 거치는 화면. 아이디어 공유 페이지의 표와 프로토타입 화면의 안내가 이 목록을 쓴다.
export const SCREENS: { name: string; does: string; status: Status; statusText: string }[] = [
  { name: '수장고 지도', does: '본관 방 3개와 별관 방 2개의 상태와 진행도를 보고 들어갈 방 선택. 다섯 방을 모두 통과하면 정문 등장', status: 'ok', statusText: '구현' },
  { name: '입장 전 퀴즈', does: '그 방에서 배울 개념을 묻는 문제 하나에 응답', status: 'ok', statusText: '구현' },
  { name: '방 1 지시의 방', does: '경비실을 뒤져 서류를 찾고, 진술을 추궁하고 서류를 내밀어 모순을 잡은 뒤, 돌려 물어 암호 확보', status: 'ok', statusText: 'Gemini 연결' },
  { name: '방 2 환각의 방', does: '전시실에서 기록 카드를 찾고, AI 도슨트의 설명을 카드와 대조해 한 건씩 통과 또는 반려', status: 'ok', statusText: '구현' },
  { name: '방 3 서가의 방', does: '자료실에서 낱말을 찾고, 검색어를 다듬어 맞는 문서가 AI에게 전달되게 한 뒤, 답에 붙은 출처 확인', status: 'ok', statusText: 'Gemini·임베딩 연결' },
  { name: '방 4 온도의 방', does: '조절기의 다이얼을 돌려 가며 같은 질문을 세 번씩 묻고, 기록 자물쇠와 창작 자물쇠 열기', status: 'ok', statusText: '구현' },
  { name: '방 5 문지기의 방', does: '신입 문지기에게 줄 지시문을 쓰고 검사 장치를 겹쳐, 공격은 막고 정상 질문에는 답하게 하기', status: 'ok', statusText: '구현' },
  { name: '통과 화면', does: '배운 것 한 줄과 단서를 받고, 입장 전과 같은 퀴즈에 다시 응답', status: 'ok', statusText: '구현' },
  { name: '정문', does: '로비를 뒤져 가려진 최근 공지를 찾고, 다섯 방의 단서와 조합해 암호 다섯 자리 입력', status: 'ok', statusText: '구현' },
  { name: '탈출 결과', does: '별점, 시도와 힌트 횟수, 퀴즈 정답 변화 확인, 결과 카드 복사', status: 'ok', statusText: '구현' },
  { name: '분석 페이지', does: '공격 수법 분포, 조건별 유출률, 방별 통과와 퀴즈 정답률 변화 확인', status: 'ok', statusText: '구현' },
]
