// 상세 자료. 8주차 발표까지 채워 가는 작업 기록이다 (/detail).
// 발표는 Idea.tsx(팀 페이지)로 하고, 여기에는 벤치마킹, 사용성, 시스템 설계, 강의 조건 대조표를 둔다.
// 표의 내용은 아래 배열만 고치면 된다. 여러 화면이 같이 쓰는 내용은 src/content/shared.ts에 있다.
import { Pill, Todo } from '../components/Marks'
import { IDEA_URL, PROTOTYPE_URL, REPO_URL, SCHEDULE, SWAGGER_URL, TEAM } from '../content/shared'
import type { Status } from '../content/shared'

// 강의계획서와 「퀴즈 및 팀 프로젝트 안내」의 조건. 진행 상황이 바뀌면 status와 statusText를 고친다.
const CONDITIONS: { condition: string; plan: string; status: Status; statusText: string }[] = [
  { condition: 'React 화면 (필수)', plan: '팀 페이지, 수장고 지도, 방 3개, 정문을 React로 구현. 분석 페이지는 7주차', status: 'ok', statusText: '방 3개와 정문' },
  { condition: '프런트엔드에 입력·로딩·오류·응답·출처 표시', plan: '지시의 방과 서가의 방에 다섯 상태 구현. 빈 결과는 "근거 없음", 답한 쪽(Gemini 또는 대본)도 표시', status: 'ok', statusText: '구현' },
  { condition: 'LLM 연동 (필수). 서버에서 LLM API 호출', plan: 'FastAPI에서 Gemini 3.5 Flash-Lite 호출. 도 씨의 대화와 고 선생의 답을 생성. 실패하면 그 요청만 정해진 대본으로 답변', status: 'ok', statusText: '11월 26일 연결' },
  { condition: '클라우드 배포 (필수). Vercel, Render, Supabase', plan: '화면은 Vercel, 서버는 Render, DB는 Supabase에 배포', status: 'ok', statusText: '세 곳 배포' },
  { condition: 'PostgreSQL. RAG를 쓰면 pgvector', plan: '서가 문서 12건의 임베딩을 pgvector에 저장. 플레이 로그와 실험 로그 테이블. 퀴즈 응답 테이블은 7주차', status: 'ok', statusText: 'pgvector 사용' },
  { condition: 'GitHub 저장소. 소스, 실행 방법, 모델·프롬프트·검증 기록', plan: '실행 방법과 서버 구조를 README에 기록. 지시문은 backend/app, 실험 결과와 검색 점검은 data 폴더', status: 'ok', statusText: '기록 중' },
  { condition: '데이터 출처 명시와 분석 페이지', plan: '출처, 라이선스, 내려받은 날짜와 건수는 팀 페이지의 데이터 구역. 분석 페이지는 7주차', status: 'plan', statusText: '출처 명시, 분석 페이지 남음' },
  { condition: 'RAG 적용 팀은 우수 질의·응답 3건 실시간 시연', plan: '서가의 방에서 "비상문 비밀번호"(옛 문서가 걸려 틀린 답), "변경"(절반만 아는 답), "변경 개관"(정답)', status: 'ok', statusText: '실시간 시연 가능' },
  { condition: '5주차 공유. 사용자와 문제, 데이터와 분석, AI 계획, UI 프로토타입. 5~6분', plan: '팀 페이지에 주제, 사용자와 문제, 데이터, AI 계획 순서로 요약해 발표', status: 'ok', statusText: '발표 완료' },
  { condition: '5주차 제출. 발표 URL과 프로토타입 URL 두 개. 권한 요청 없이 열람', plan: '발표 URL은 첫 화면, 프로토타입 URL은 /prototype. 둘 다 로그인 없이 열림. 11월 23일 LMS 제출', status: 'ok', statusText: '제출 완료' },
  { condition: '8주차 발표는 슬라이드 없이 팀 페이지로. 실제 기능과 AI 응답 시연', plan: '팀 페이지를 React 서비스 안에 둠. 시연 때는 발표자 우선 모드로 Gemini 몫 확보', status: 'ok', statusText: '틀 완성' },
  { condition: '발표 자료에 주소 3가지. GitHub, 서비스, Swagger UI', plan: '아래 일정 구역에 기재', status: 'ok', statusText: '세 주소 기재' },
  { condition: '팀 4~5명', plan: `${TEAM.name} ${TEAM.members.length}명(${TEAM.members.join(', ')})`, status: 'ok', statusText: '확정' },
  { condition: '인증키는 .env로 분리. 민감·개인정보는 AI에 입력하지 않기. 무료 범위 우선', plan: '키는 Render 환경변수와 GitHub Secrets에만 보관. 닉네임과 접속 주소는 저장하지 않고, 입력에 든 전화번호와 이메일은 저장 전에 가림. 무료 등급으로 운영', status: 'ok', statusText: '적용' },
]

const GRADING: { item: string; weight: string; show: string }[] = [
  { item: '시스템 기능 설계·구현', weight: '30%', show: '방마다 다른 AI 활용 방식, 코드 판정 구조, 응답 검증과 오류 대응' },
  { item: 'Needs 파악·문제 정의', weight: '20%', show: 'AI 기초 교육 수요, Gandalf와의 비교, 입장 전후 퀴즈로 잰 학습 효과' },
  { item: 'UI/UX·사용성', weight: '20%', show: '임무와 다음 수 안내, PC·모바일 대응, 로딩·오류·빈 결과 처리, 고친 사례' },
  { item: '데이터·API 활용', weight: '10%', show: '공개 공격문 278,945건의 정제와 수법 분류, 지시문 네 조건의 유출률 실험, 판정 규칙을 고친 과정, 플레이 로그' },
  { item: '성능·보안 등 비기능', weight: '10%', show: '응답 속도 실측(1.3~2.1초), 무료 한도와 발표자 우선 모드, 키와 개인정보 보호, 남은 한계' },
  { item: '팀 페이지·배포·발표·시연', weight: '10%', show: '배포 주소 3가지, 방 하나를 실시간으로 탈출, RAG 3건' },
]


// 비주얼·음성·음악과 개발 도구. 프로토타입에는 자리와 기본 동작만 넣어 두었다.
const MEDIA: { item: string; now: string; next: string; tool: string }[] = [
  { item: '인트로 영상', now: '수장고에 갇히는 과정을 담은 1분 11초 영상. 게임 시작 화면에서 재생', next: '없음', tool: '코드로 그린 화면, ElevenLabs 목소리, Suno 배경음' },
  { item: '문지기 그림', now: '도 씨, 루미, 고 선생을 장면 안에 상반신으로 배치. 상황에 따라 표정이 열 가지로 변화. 관장 AI는 벽 화면의 얼굴. 코드로 직접 그린 그림', next: '공사 중인 두 방의 문지기', tool: '없음 (SVG)' },
  { item: '방 장면', now: '경비실, 전시실, 자료실, 정문 로비를 눌러서 뒤지는 장면. 형광등 깜빡임과 스치는 그림자. 깜빡임 끄기 제공', next: '방마다 다른 효과음', tool: '없음 (SVG, CSS)' },
  { item: '전시 작품', now: '환각의 방에 걸리는 작품 3점을 코드로 직접 그림. 서명 옆 연도가 기록 카드와 일치', next: '유화, 수채 질감이 나는 그림으로 교체', tool: '이미지 생성 도구 (미정)' },
  { item: '서가', now: '검색하면 고 선생이 받은 책이 튀어나오고 잘린 책은 빗금으로 표시. 문서별 유사도 점수 표시', next: '없음', tool: '없음 (SVG)' },
  { item: '문지기 목소리', now: '지시의 방에서 브라우저 기본 음성으로 답변 읽기. 기본은 꺼짐. 인트로 영상의 목소리는 ElevenLabs', next: '게임 안에서도 문지기마다 다른 목소리', tool: 'ElevenLabs' },
  { item: '배경음', now: 'Suno로 만든 곡 "Empty Basement"를 게임과 인트로 영상에 사용. 첫 조작부터 재생, 끄기 가능', next: '방마다 다른 효과음', tool: 'Suno' },
  { item: '개발 자동화', now: 'Claude로 화면과 서버 구현, 자동 플레이 확인. 공격문 정제와 실험은 GitHub Actions에서 실행', next: '반복 작업과 교차 검증을 명령줄 에이전트에 위임', tool: 'Claude, GitHub Actions, Codex exec, agy (Antigravity CLI)' },
]

// 성공한 게임에서 가져온 장치. 수치의 출처는 페이지 맨 아래에 있다.
const BENCHMARKS: { game: string; result: string; device: string; ours: string }[] = [
  { game: 'Papers, Please', result: '10년간 500만 장 판매', device: '날마다 서류 규칙이 늘고 어려워짐', ours: '환각의 방: 라운드마다 검수 규칙 추가' },
  { game: 'Her Story', result: '검색을 게임으로 만든 대표작', device: '검색 결과를 앞의 5건만 표시', ours: '서가의 방: 앞의 3건만 AI에게 전달' },
  { game: '역전재판', result: '장수 시리즈', device: '증언을 추궁하고 증거로 모순 지적', ours: '지시의 방: 추궁과 증거 제시' },
  { game: 'Return of the Obra Dinn', result: '추리 게임의 기준작', device: '정답이 모여야 한꺼번에 확정', ours: '환각의 방: 맞은 건수만 알림' },
  { game: 'Wordle', result: '한 달 새 30만 명에서 200만 명 이상', device: '정답을 드러내지 않는 결과 공유', ours: '탈출 결과를 별점 카드로 복사' },
  { game: 'Tensor Trust', result: '공격 56만 건, 방어 11만 건이 연구 데이터가 됨', device: '플레이어끼리 공격과 방어. 판정은 문자열 비교', ours: '문지기의 방 (확장). 판정은 코드' },
  { game: 'Lakera Gandalf', result: '같은 장르의 영어 게임', device: 'AI가 지키는 암호를 말로 뚫기. 보안 한 주제', ours: '방마다 다른 LLM 개념, 학습 효과 측정' },
]

// 사용성 개선 사례. 실제로 겪고 고친 것만 적는다.
const UX_CASES: { when: string; problem: string; fix: string }[] = [
  {
    when: '11월 26일 Gemini 연결 뒤',
    problem: '도 씨의 답이 천편일률적',
    fix: '사람됨과 기분, 앞서 오간 말을 지시문에 넣어 대화가 이어지게 함. 추궁과 서류 제시의 반응도 모델이 작성',
  },
  {
    when: '11월 25일 교수님 의견 뒤',
    problem: '글을 읽고 단추를 누르는 화면이라 방탈출에 들어와 있다는 느낌이 약함',
    fix: '인트로 영상 추가. 방을 눌러 뒤지는 장면과 아래쪽 대화창 방식으로 방 세 개와 정문 개편. 동그란 초상 대신 상반신 그림을 장면 안에 배치',
  },
  {
    when: '11월 20일 제목 변경 뒤',
    problem: '미술관인데 그림이 없고, 글만 읽어야 해서 무슨 일이 일어났는지 한눈에 들어오지 않음',
    fix: '작품 그림, 문지기 세 명의 표정 변화, 책장과 책 넘기는 움직임 추가. 서가의 방은 전달된 문서와 잘린 문서를 책장에 바로 표시',
  },
  {
    when: '11월 20일 방탈출 첫 판',
    problem: '방마다 행동 한 번으로 끝나 너무 단순함',
    fix: '성공한 게임 7종을 벤치마킹해 방을 여러 단계로 나누고, 세 방의 단서를 조합하는 정문 자물쇠 추가',
  },
  {
    when: '11월 18일 첫 시험 플레이',
    problem: '화면에 들어갔지만 무엇을 물어야 하는지, 목적이 무엇인지 알 수 없음',
    fix: '임무 문장, 단계 표시, 방금 답변에 따른 다음 수 안내, 힌트 추가. 이어서 목표가 분명한 방탈출 구조로 변경',
  },
]


const LINKS: { label: string; url: string }[] = [
  { label: 'GitHub 저장소', url: REPO_URL },
  { label: '서비스 웹 주소 (React, 팀 페이지)', url: IDEA_URL },
  { label: '프로토타입 주소', url: PROTOTYPE_URL },
  { label: 'Swagger UI 주소 (FastAPI /docs)', url: SWAGGER_URL },
]

export default function Detail() {
  return (
    <>
      <div className="top">
        <div className="wrap">
          <span className="mono brand">
            환각 미술관<span className="course"> · 상세 자료 · 금융빅데이터분석실습</span>
          </span>
          <nav aria-label="페이지 구역">
            <a href="#benchmark">벤치마킹</a>
            <a href="#ux">사용성</a>
            <a href="#architecture">구조</a>
            <a href="#media">비주얼·음성</a>
            <a href="#checklist">강의 조건</a>
            <a href="#plan">일정</a>
            <a href="/">팀 페이지</a>
            <a href="/stats">분석</a>
            <a href="/prototype" className="nav-game">
              프로토타입 열기
            </a>
          </nav>
        </div>
      </div>

      <header className="page-head">
        <div className="wrap">
          <div className="eyebrow">환각 미술관 · 8주차 발표까지 채워 가는 기록</div>
          <h1>상세 자료</h1>
          <p>
            발표는 <a href="/">팀 페이지</a> 페이지로 진행. 여기에는 그 페이지에서 줄인 벤치마킹, 사용성 개선 기록, 시스템 설계,
            강의 조건 대조표를 모음
          </p>
        </div>
      </header>

      <main>
        <section id="benchmark">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">Needs·아이디어 · 벤치마킹</div>
              <h2>성공한 게임에서 가져온 장치</h2>
            </div>
            <div className="tablewrap">
              <table className="stack">
                <thead>
                  <tr>
                    <th>게임</th>
                    <th>성과</th>
                    <th>깊이를 만드는 장치</th>
                    <th>우리 게임에 옮긴 것</th>
                  </tr>
                </thead>
                <tbody>
                  {BENCHMARKS.map((b) => (
                    <tr key={b.game}>
                      <td data-label="게임">{b.game}</td>
                      <td data-label="성과">{b.result}</td>
                      <td data-label="장치">{b.device}</td>
                      <td data-label="우리 게임">{b.ours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="ux">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">UI/UX · 사용성</div>
              <h2>사용성 설계와 고친 기록</h2>
            </div>
            <div className="cols">
              <div className="card">
                <h3>사용성 설계</h3>
                <ul>
                  <li>처음 온 사람도 헤매지 않게 임무, 지금 단계, 다음 수, 힌트를 방마다 표시</li>
                  <li>PC와 모바일에서 같은 기능 제공. 모바일에서는 표가 카드로 바뀌고, 그림 속 물건을 단추로도 선택</li>
                  <li>버튼은 손가락으로 누르기 쉬운 크기(44px 이상), 입력 글자는 화면이 확대되지 않는 16px</li>
                  <li>서버가 답하지 못해도 멈추지 않고 정해진 대본으로 이어짐</li>
                  <li>새로고침해도 통과한 방과 퀴즈 기록 유지</li>
                  <li>소리는 선택 사항. 글만으로 모든 기능 사용 가능. 형광등 깜빡임은 끄기 가능</li>
                </ul>
              </div>
              <div className="card">
                <h3>사용성 개선 사례</h3>
                <ul>
                  {UX_CASES.map((c) => (
                    <li key={c.when}>
                      <b>{c.when}</b> {c.problem}. {c.fix}
                    </li>
                  ))}
                  <li>
                    6주차 공개 플레이 뒤 이어서 기록 <Todo>반 플레이 뒤 추가</Todo>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="architecture">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">8주차 대비 · 시스템 설계</div>
              <h2>구조와 스택</h2>
            </div>
            <div className="arch" aria-label="시스템 구조">
              <div className="node">
                <b>React</b>
                <small>Vercel · 수장고 지도, 방, 퀴즈, 분석 페이지, 팀 페이지</small>
              </div>
              <span className="arr">→</span>
              <div className="node">
                <b>FastAPI</b>
                <small>Render · 방 규칙, 검색, LLM 호출, 판정, 로그</small>
              </div>
              <span className="arr">→</span>
              <div className="node">
                <b>Gemini API</b>
                <small>문지기 답변 생성, 임베딩</small>
              </div>
              <span className="arr">↔</span>
              <div className="node">
                <b>PostgreSQL + pgvector</b>
                <small>Supabase · 로그, 퀴즈 응답, 방 문서 임베딩</small>
              </div>
            </div>
            <div className="cols">
              <div className="card">
                <h3>요청 한 건의 처리 순서</h3>
                <ol>
                  <li>길이 검사, 주소당 요청 수 검사</li>
                  <li>발표자 암호 확인과 모델 호출 한도 확인. 한도를 넘으면 정해진 대본으로 답변</li>
                  <li>서가의 방: 검색어 임베딩, pgvector에서 가까운 문서 검색, 앞의 3건 선택</li>
                  <li>Gemini 호출. 도 씨는 대화 이력과 함께, 고 선생은 받은 문서와 함께</li>
                  <li>코드 검사. 암호 유출 판정, 근거 번호와 숫자 검사. 걸리면 정해진 답으로 교체</li>
                  <li>응답 후 로그 저장</li>
                </ol>
              </div>
              <div className="card">
                <h3>API</h3>
                <ul>
                  <li>
                    <span className="mono">POST /rooms/1/press</span>, <span className="mono">/present</span> 진술 추궁과 서류 제시
                  </li>
                  <li>
                    <span className="mono">POST /interrogate</span>, <span className="mono">/evidence</span> 지시의 방 질문과 암호 판정
                  </li>
                  <li>
                    <span className="mono">POST /rooms/2/check</span> 검수 결과에서 맞은 건수 반환
                  </li>
                  <li>
                    <span className="mono">POST /rooms/3/ask</span> 임베딩 검색 뒤 상위 3건으로 사서가 답변
                  </li>
                  <li>
                    <span className="mono">POST /rooms/3/check</span>, <span className="mono">/final/check</span> 비상문과 정문 암호 판정
                  </li>
                  <li>
                    <span className="mono">GET /health</span> 서버 상태. <span className="mono">GET /stats</span> 분석 페이지용 집계는 7주차
                  </li>
                  <li>
                    <a href={SWAGGER_URL}>Swagger UI</a>에서 전체 목록 확인
                  </li>
                </ul>
              </div>
              <div className="card">
                <h3>속도·비용·보안</h3>
                <ul>
                  <li>API 키는 Render 환경변수와 GitHub Secrets에만 보관. Git에 올리지 않음</li>
                  <li>응답 1.3~2.1초 (11월 26일 5회 실측). 서버가 잠들었다 깨어난 직후의 첫 요청은 10초 안팎</li>
                  <li>질문 300자, 대화 이력 여섯 쌍, 서버의 하루 생성 호출 250회 제한</li>
                  <li>무료 등급으로 운영. 시연 때는 발표자 우선 모드로 방문자의 호출을 제한</li>
                  <li>
                    유료로 바꿀 경우 질문 5,000회에 약 $5.6 추정 <Todo>실측 후 갱신</Todo>
                  </li>
                  <li>
                    알려진 한계: 서버가 쉴 때 쓰는 대본에 정답이 들어 있어 브라우저 코드에서 볼 수 있음 <Todo>8주차 전 정리</Todo>
                  </li>
                </ul>
              </div>
              <div className="card">
                <h3>오답이 나왔을 때의 대응 설계</h3>
                <ul>
                  <li>문이 열리는지와 암호가 새었는지는 코드가 판정</li>
                  <li>사서의 답에 받은 문서에 없는 네 자리 숫자가 있거나 받지 않은 문서를 근거로 대면 정해진 답으로 교체하고 화면에 이유 표시</li>
                  <li>아직 들키지 않은 사실과 인정하기 전의 암호는 도 씨의 지시문에 넣지 않음</li>
                  <li>환각의 방의 지어낸 설명은 미리 정해 둠. 맞은 건수만 알려 주어 찍어서 통과하는 것을 방지</li>
                  <li>모델이 12초 안에 답하지 못하거나 한도를 넘으면 그 요청만 정해진 대본으로 답변. 화면 위쪽에 서버 상태 표시</li>
                  <li>임베딩을 쓸 수 없으면 낱말 검색으로, DB를 쓸 수 없으면 서버 메모리 검색으로 전환</li>
                </ul>
              </div>
            </div>
            <p className="more">
              실제 모델에 붙이며 겪은 시행착오 아홉 가지는 <a href="/#trials">팀 페이지</a>에 정리
            </p>
          </div>
        </section>

        <section id="media">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">만든 것과 남은 것</div>
              <h2>비주얼·음성·음악과 개발 도구</h2>
            </div>
            <div className="tablewrap">
              <table className="stack">
                <thead>
                  <tr>
                    <th>요소</th>
                    <th>지금 프로토타입</th>
                    <th>이후 계획</th>
                    <th>쓸 도구</th>
                  </tr>
                </thead>
                <tbody>
                  {MEDIA.map((m) => (
                    <tr key={m.item}>
                      <td data-label="요소">{m.item}</td>
                      <td data-label="지금">{m.now}</td>
                      <td data-label="이후 계획">{m.next}</td>
                      <td data-label="쓸 도구">{m.tool}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="checklist">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">강의 자료 대조</div>
              <h2>팀 프로젝트 조건 대조표</h2>
              <p>강의계획서와 「퀴즈 및 팀 프로젝트 안내」에 적힌 조건을 하나씩 옮기고 우리 진행 상황을 맞춰 기재</p>
            </div>
            <div className="tablewrap">
              <table className="stack">
                <thead>
                  <tr>
                    <th>강의 조건</th>
                    <th>우리 진행 상황</th>
                    <th>현재</th>
                  </tr>
                </thead>
                <tbody>
                  {CONDITIONS.map((c) => (
                    <tr key={c.condition}>
                      <td data-label="강의 조건">{c.condition}</td>
                      <td data-label="진행 상황">{c.plan}</td>
                      <td data-label="현재">
                        <Pill kind={c.status}>{c.statusText}</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="sub-h">평가 항목별로 보여 줄 것</h3>
            <div className="tablewrap">
              <table className="stack">
                <thead>
                  <tr>
                    <th>평가 항목</th>
                    <th className="num">배점</th>
                    <th>8주차에 설명하거나 시연할 내용</th>
                  </tr>
                </thead>
                <tbody>
                  {GRADING.map((g) => (
                    <tr key={g.item}>
                      <td data-label="평가 항목">{g.item}</td>
                      <td className="num" data-label="배점">
                        {g.weight}
                      </td>
                      <td data-label="보여 줄 것">{g.show}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="plan">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">8주차 대비 · 진행 관리</div>
              <h2>일정</h2>
            </div>
            <div className="tablewrap">
              <table className="stack">
                <thead>
                  <tr>
                    <th>주차</th>
                    <th>수업 주제</th>
                    <th>끝낸 일</th>
                    <th>남은 일</th>
                  </tr>
                </thead>
                <tbody>
                  {SCHEDULE.map((s) => (
                    <tr key={s.week}>
                      <td className="num" data-label="주차">
                        {s.week}
                      </td>
                      <td data-label="수업 주제">{s.topic}</td>
                      <td data-label="끝낸 일">{s.done}</td>
                      <td data-label="남은 일">{s.todo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="cols gap-top">
              <div className="card">
                <h3>발표 자료에 넣을 주소</h3>
                <ul>
                  {LINKS.map((l) => (
                    <li key={l.label}>
                      {l.label}
                      {': '}
                      <a href={l.url}>{l.url}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card">
                <h3>기능을 줄여야 할 때의 순서</h3>
                <ul>
                  <li>여유가 있을 때만: 방 4 온도의 방, 방 5 문지기의 방, 게임 안 문지기 목소리</li>
                  <li>끝까지 지킬 것: 방 1~3과 정문, 코드 판정, 로그, 퀴즈, 분석 페이지, 배포</li>
                  <li>실패한 실험은 원인과 개선 과정을 팀 페이지의 시행착오 구역에 기록</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <p>
            <b>출처</b>
          </p>
          <ul>
            <li>강의 자료: 「금융빅데이터분석실습 강의계획서」, 「퀴즈 및 팀 프로젝트 안내」, 3주차 교재 11, 4주차 워크북과 교재 12</li>
            <li>
              <a href="https://www.lakera.ai/blog/gandalf-agent-breaker">Lakera, Gandalf: Agent Breaker</a>
            </li>
            <li>
              <a href="https://huggingface.co/datasets/Lakera/mosscap_prompt_injection">
                Lakera Mosscap 프롬프트 공격 데이터셋 (Hugging Face)
              </a>
            </li>
            <li>
              <a href="https://www.lakera.ai/news/defcon-welcomes-mosscap-lakeras-ai-security-game-to-tackle-top-llm-vulnerabilities">
                Lakera 보도자료: OWASP LLM Top 10의 프롬프트 인젝션 순위 언급
              </a>
            </li>
            <li>
              벤치마킹 수치:{' '}
              <a href="https://www.engadget.com/indie-favorite-papers-please-has-sold-5-million-copies-171537016.html">Engadget (Papers, Please)</a>,{' '}
              <a href="https://killscreen.com/listening-her-story-looking-right-questions">Kill Screen (Her Story)</a>,{' '}
              <a href="https://filmstories.co.uk/?p=83249">Film Stories (Obra Dinn)</a>,{' '}
              <a href="https://pressbooks.cuny.edu/inspire/part/the-wordle-effect-how-five-letters-changed-the-internet/">CUNY (Wordle)</a>,{' '}
              <a href="https://proceedings.iclr.cc/paper_files/paper/2024/hash/519c51529c3544b3430bd8b17d400365-Abstract-Conference.html">
                ICLR 2024 (Tensor Trust)
              </a>
            </li>
            <li>
              <a href="https://ai.google.dev/gemini-api/docs/pricing">Gemini API 가격표</a>. 2026-11-18 확인. Gemini 3.5
              Flash-Lite 유료 단가는 100만 토큰당 입력 $0.30, 출력 $2.50. 비용 추정은 질문 1회에 입력 1,200토큰, 출력
              300토큰 가정
            </li>
          </ul>
        </div>
      </footer>
    </>
  )
}