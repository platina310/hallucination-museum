// 팀 프로젝트 페이지. 5주차 아이디어 공유와 8주차 발표를 이 페이지로 진행한다.
// 표의 내용은 아래 배열만 고치면 된다. 방 구성은 src/game/rooms.ts에 있다.
import type { ReactNode } from 'react'
import EscapeGame from '../components/EscapeGame'
import { ROOMS } from '../game/rooms'

type Status = 'ok' | 'plan' | 'need'

function Pill({ kind, children }: { kind: Status; children: ReactNode }) {
  return <span className={`pill ${kind}`}>{children}</span>
}

function Todo({ children }: { children: ReactNode }) {
  return <span className="todo">{children}</span>
}

const DATASETS: { name: string; origin: string; content: string; use: string; status: Status; statusText: string }[] = [
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

// 강의계획서와 「퀴즈 및 팀 프로젝트 안내」의 조건. 진행 상황이 바뀌면 status와 statusText를 고친다.
const CONDITIONS: { condition: string; plan: string; status: Status; statusText: string }[] = [
  { condition: 'React 화면 (필수)', plan: '팀 페이지, 수장고 지도, 방 3개, 정문 자물쇠를 React로 만들었다. 분석 페이지는 7주차', status: 'ok', statusText: '방 3개 구현' },
  { condition: '프런트엔드에 입력·로딩·오류·응답·출처 표시', plan: '지시의 방과 서가의 방에 다섯 상태를 모두 넣었다. 빈 결과는 "근거 없음"으로 표시', status: 'ok', statusText: '구현' },
  { condition: 'LLM 연동 (필수). 서버에서 LLM API 호출', plan: 'FastAPI에서 Gemini 호출. 지금은 정해진 대본으로 답한다', status: 'plan', statusText: '6주차' },
  { condition: '클라우드 배포 (필수). Vercel, Render, Supabase', plan: '프런트는 Vercel에 배포했다. 백엔드 Render와 DB Supabase는 6주차', status: 'ok', statusText: '프런트 배포' },
  { condition: 'PostgreSQL. RAG를 쓰면 pgvector', plan: '로그와 퀴즈 테이블, 서가 문서 임베딩', status: 'plan', statusText: '계획' },
  { condition: 'GitHub 저장소. 소스, 실행 방법, 모델·프롬프트·검증 기록', plan: '저장소를 만들고 실행 방법을 README에 적었다. 방별 프롬프트와 탈출률 변화는 이어서 기록', status: 'ok', statusText: '저장소 생성' },
  { condition: '데이터 출처 명시와 분석 페이지', plan: '출처는 이 페이지의 데이터 표. 분석은 /stats 화면', status: 'plan', statusText: '계획' },
  { condition: 'RAG 적용 팀은 우수 질의·응답 3건 실시간 시연', plan: '서가의 방에서 정답이 나오는 검색어, 오래된 문서가 걸려 틀리는 검색어, 자료 없음이 나오는 검색어', status: 'plan', statusText: '대본으로 시연 가능' },
  { condition: '5주차 공유. 사용자와 문제, 데이터와 분석, AI 계획, UI 프로토타입. 5~6분', plan: '이 페이지의 문제, 화면, 데이터, AI 계획 구역', status: 'ok', statusText: '초안' },
  { condition: '8주차 발표는 슬라이드 없이 팀 페이지로. 실제 기능과 AI 응답 시연', plan: '팀 페이지를 React 서비스 안에 두었다. 내용은 매주 갱신한다', status: 'ok', statusText: '틀 완성' },
  { condition: '발표 자료에 주소 3가지. GitHub, 서비스, Swagger UI', plan: '아래 일정·역할 구역에 적는다. Swagger UI는 백엔드 배포 뒤 기입', status: 'need', statusText: '2개 기입' },
  { condition: '팀 4~5명과 팀원 역할', plan: '역할 다섯 가지를 나눠 두었다', status: 'need', statusText: '팀 확정 필요' },
  { condition: '인증키는 .env로 분리. 민감·개인정보는 AI에 입력하지 않는다. 무료 범위 우선', plan: '키 분리, 닉네임만 수집, 저장 전 마스킹, 무료 등급으로 개발', status: 'plan', statusText: '계획' },
]

const GRADING: { item: string; weight: string; show: string }[] = [
  { item: '시스템 기능 설계·구현', weight: '30%', show: '방마다 다른 AI 활용 방식, 코드 판정 구조, 응답 검증과 오류 대응' },
  { item: 'Needs 파악·문제 정의', weight: '20%', show: 'AI 기초 교육 수요, Gandalf와의 비교, 입장 전후 퀴즈로 잰 학습 효과' },
  { item: 'UI/UX·사용성', weight: '20%', show: '임무와 다음 수 안내, PC·모바일 대응, 로딩·오류·빈 결과 처리, 고친 사례' },
  { item: '데이터·API 활용', weight: '10%', show: '플레이 로그와 퀴즈 응답, 개념별로 막히는 지점 분석' },
  { item: '성능·보안 등 비기능', weight: '10%', show: '응답 속도와 호출 비용 실측, 키와 개인정보 보호, 남은 한계' },
  { item: '팀 페이지·배포·발표·시연', weight: '10%', show: '배포 주소 3가지, 방 하나를 실시간으로 탈출, RAG 3건' },
]

const SCHEDULE: { week: number; topic: string; todo: string }[] = [
  { week: 5, topic: 'RAG', todo: '아이디어 공유. 서가의 방 낱말 검색을 임베딩 검색으로 바꾸기' },
  { week: 6, topic: 'Claude Code', todo: '방 1~3을 FastAPI와 Gemini에 연결. 로그와 퀴즈 저장. 반에 링크 공개' },
  { week: 7, topic: 'MCP와 품질 개선', todo: '분석 페이지. 속도·비용·보안 점검. 여유가 있으면 방 4~5' },
  { week: 8, topic: '기말 발표', todo: '팀 페이지로 발표 15분, 질의응답 5분' },
]

// 비주얼·음성·음악과 개발 도구. 프로토타입에는 자리와 기본 동작만 넣어 두었다.
const MEDIA: { item: string; now: string; next: string; tool: string }[] = [
  { item: '문지기 초상', now: '도 씨는 표정이 네 단계로 바뀌는 그림. 나머지는 이름 첫 글자', next: '문지기마다 초상과 표정', tool: '이미지 생성 도구 (미정)' },
  { item: '문지기 목소리', now: '지시의 방에서 브라우저 기본 음성으로 답변 읽기. 기본은 꺼짐', next: '문지기마다 다른 목소리. 키는 서버에 두고 FastAPI가 호출', tool: 'ElevenLabs' },
  { item: '배경음과 효과음', now: '버튼 자리만 표시', next: '방마다 배경음, 문이 열릴 때의 효과음', tool: 'Suno' },
  { item: '개발 자동화', now: 'Claude로 화면 구현과 동작 확인', next: '반복 작업과 교차 검증을 명령줄 에이전트에 맡긴다', tool: 'Codex exec, agy (Antigravity CLI)' },
]

// 배포 후 주소를 넣는다. 빈 문자열이면 "배포 후 기입"으로 표시된다.
const LINKS: { label: string; url: string }[] = [
  { label: 'GitHub 저장소', url: 'https://github.com/platina310/mukbigwon' },
  { label: '서비스 웹 주소 (React, 팀 페이지 포함)', url: 'https://mukbigwon-rol4.vercel.app' },
  { label: 'Swagger UI 주소 (FastAPI /docs)', url: '' },
]

// 성공한 게임에서 가져온 장치. 수치의 출처는 페이지 맨 아래에 있다.
const BENCHMARKS: { game: string; result: string; device: string; ours: string }[] = [
  { game: 'Papers, Please', result: '10년간 500만 장 판매', device: '날마다 서류 규칙이 늘고 어려워진다', ours: '환각의 방: 라운드마다 검수 규칙 추가' },
  { game: 'Her Story', result: '검색을 게임으로 만든 대표작', device: '검색 결과를 앞의 5건만 보여 준다', ours: '서가의 방: 앞의 3건만 AI에게 전달' },
  { game: '역전재판', result: '장수 시리즈', device: '증언을 추궁하고 증거로 모순을 찌른다', ours: '지시의 방: 추궁과 증거 제시' },
  { game: 'Return of the Obra Dinn', result: '추리 게임의 기준작', device: '정답이 모여야 한꺼번에 확정해 준다', ours: '환각의 방: 맞은 건수만 알려 준다' },
  { game: 'Wordle', result: '한 달 새 30만 명에서 200만 명 이상', device: '정답을 드러내지 않는 결과 공유', ours: '탈출 결과를 별점 카드로 복사' },
  { game: 'Tensor Trust', result: '공격 56만 건, 방어 11만 건이 연구 데이터가 됨', device: '플레이어끼리 공격과 방어. 판정은 문자열 비교', ours: '문지기의 방 (7주차). 판정은 코드가 한다' },
  { game: 'Lakera Gandalf', result: '같은 장르의 영어 게임', device: 'AI가 지키는 암호를 말로 뚫는다. 보안 한 주제', ours: '방마다 다른 LLM 개념, 학습 효과 측정' },
]

// 사용성 개선 사례. 실제로 겪고 고친 것만 적는다.
const UX_CASES: { when: string; problem: string; fix: string }[] = [
  {
    when: '11월 20일 방탈출 첫 판',
    problem: '방마다 행동 한 번으로 끝나 너무 단순했다',
    fix: '성공한 게임 7종을 벤치마킹해 방을 여러 단계로 나누고, 세 방의 단서를 조합하는 정문 자물쇠를 추가했다',
  },
  {
    when: '11월 18일 첫 시험 플레이',
    problem: '화면에 들어갔지만 무엇을 물어야 하는지, 목적이 무엇인지 알 수 없었다',
    fix: '임무 문장, 단계 표시, 방금 답변에 따른 다음 수 안내, 힌트를 추가했다. 이어서 목표가 분명한 방탈출 구조로 바꿨다',
  },
]

export default function Team() {
  return (
    <>
      <div className="top">
        <div className="wrap">
          <span className="mono brand">
            묵비권 팀 페이지<span className="course"> · 금융빅데이터분석실습 · 5주차 아이디어 공유용 초안</span>
          </span>
          <nav aria-label="페이지 구역">
            <a href="#problem">문제</a>
            <a href="#play">화면</a>
            <a href="#data">데이터</a>
            <a href="#ai">AI 계획</a>
            <a href="#architecture">구조</a>
            <a href="#checklist">강의 조건</a>
            <a href="#plan">일정·역할</a>
            <a href="#game" className="nav-game">
              게임만 하기
            </a>
          </nav>
        </div>
      </div>

      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="stamp" aria-hidden="true">
              묵비권
            </div>
            <h1 className="sr-only">묵비권</h1>
            <p className="lede">
              AI가 지키는 방을 말과 추리로 뚫으며 <mark>LLM의 원리를 배우는 방탈출</mark>
            </p>
            <p className="tagline">AI에게는 말하지 않을 권리가 있습니다. 다만 허점도 많습니다.</p>
            <div className="cta">
              <a className="btn" href="#play">
                방탈출 해 보기
              </a>
              <a className="btn ghost" href="#checklist">
                강의 조건 대조표
              </a>
            </div>
          </div>
          <div className="form" role="table" aria-label="서비스 개요">
            <div className="head">
              <span className="mono">진술조서 제1호</span>
              <span className="mono">
                팀명 <Todo>팀 확정 필요</Todo>
              </span>
            </div>
            <div className="row">
              <div className="k">무대</div>
              <div className="v">한빛미술관 수장고 (팀이 지어낸 가상의 장소)</div>
            </div>
            <div className="row">
              <div className="k">방</div>
              <div className="v">5개와 정문. 방마다 AI 하나가 문을 지키고, LLM 개념 하나를 배운다</div>
            </div>
            <div className="row">
              <div className="k">플레이어</div>
              <div className="v">야간 점검을 나왔다가 갇힌 조사관</div>
            </div>
            <div className="row">
              <div className="k">판정</div>
              <div className="v">문이 열리는지는 서버 코드가 판정한다. AI는 판정하지 않는다</div>
            </div>
            <div className="row">
              <div className="k">남는 것</div>
              <div className="v">방별 탈출률, 막힌 지점, 입장 전후 퀴즈 정답률</div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section id="problem">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">5주차 공유 항목 · 대상 사용자와 해결하려는 문제</div>
              <h2>LLM은 직접 속여 보고 속아 봐야 이해한다</h2>
            </div>
            <div className="cols">
              <div className="card">
                <h3>대상 사용자</h3>
                <ul>
                  <li>업무에 생성형 AI를 쓰기 시작한 직장인과 학생</li>
                  <li>사내에서 AI 기초 교육을 맡은 담당자</li>
                </ul>
              </div>
              <div className="card">
                <h3>해결하려는 문제</h3>
                <ul>
                  <li>환각, 프롬프트의 한계, RAG 같은 개념은 글로 배우면 남지 않는다</li>
                  <li>AI의 답을 그대로 믿거나 비밀을 프롬프트에 넣는 실수가 반복된다</li>
                  <li>
                    재미있게 익힐 한국어 실습 도구가 부족하다 <Todo>조사로 확인할 가설</Todo>
                  </li>
                </ul>
              </div>
              <div className="card">
                <h3>근거와 선행 사례</h3>
                <ul>
                  <li>OWASP의 LLM 취약점 Top 10은 프롬프트 인젝션을 1순위로 꼽는다</li>
                  <li>Lakera의 Gandalf는 같은 장르의 영어 게임이지만 보안 한 주제만 다룬다</li>
                  <li>
                    시장 규모와 교육 수요 수치 <Todo>8주차 전 보강</Todo>
                  </li>
                </ul>
              </div>
              <div className="card">
                <h3>우리 팀의 차별점</h3>
                <ul>
                  <li>방마다 개념 하나. 프롬프트, 환각, RAG, temperature, 방어 설계</li>
                  <li>입장 전과 탈출 후에 같은 퀴즈를 내서 학습 효과를 숫자로 잰다</li>
                  <li>판정은 코드가 하고 AI는 연기만 해서, 방별 결과를 그대로 측정할 수 있다</li>
                </ul>
              </div>
            </div>

            <h3 className="sub-h">성공한 게임에서 가져온 장치</h3>
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

        <section id="play">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">5주차 공유 항목 · 주요 화면 UI 프로토타입</div>
              <h2>수장고 방탈출</h2>
              <p>
                방 세 개와 정문 자물쇠를 지금 바로 해 볼 수 있다. 백엔드 연결 전이라 AI의 답은 정해진 대본으로 나온다.{' '}
                <a href="#game">게임만 큰 화면으로 하기</a>
              </p>
            </div>

            <EscapeGame demoControls />

            <div className="flow" aria-label="이용 흐름">
              <span className="box">수장고 지도</span>
              <span className="arr">→</span>
              <span className="box">입장 전 퀴즈</span>
              <span className="arr">→</span>
              <span className="box">방에서 AI와 겨루기</span>
              <span className="arr">→</span>
              <span className="box">배운 것과 같은 퀴즈</span>
              <span className="arr">→</span>
              <span className="box">정문 자물쇠</span>
              <span className="arr">→</span>
              <span className="box">탈출 결과와 별점</span>
              <span className="arr">→</span>
              <span className="box">분석 페이지</span>
            </div>

            <div className="tablewrap gap-top">
              <table className="stack">
                <thead>
                  <tr>
                    <th>방</th>
                    <th>문지기</th>
                    <th>푸는 방법</th>
                    <th>배우는 것</th>
                    <th>수업 연결</th>
                    <th>범위</th>
                  </tr>
                </thead>
                <tbody>
                  {ROOMS.map((r) => (
                    <tr key={r.id}>
                      <td data-label="방">
                        {r.id}. {r.name}
                      </td>
                      <td data-label="문지기">{r.guard}</td>
                      <td data-label="푸는 방법">{r.how}</td>
                      <td data-label="배우는 것">{r.concept}</td>
                      <td data-label="수업 연결">{r.week}</td>
                      <td data-label="범위">
                        <Pill kind={r.playable ? 'ok' : 'plan'}>{r.playable ? '필수' : '확장'}</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="cols gap-top">
              <div className="card">
                <h3>사용성 설계</h3>
                <ul>
                  <li>처음 온 사람도 헤매지 않게 임무, 지금 단계, 다음 수, 힌트를 방마다 보여 준다</li>
                  <li>PC와 모바일에서 같은 기능을 쓴다. 모바일에서는 표가 카드로 바뀐다</li>
                  <li>버튼은 손가락으로 누르기 쉬운 크기(44px 이상)로, 입력 글자는 화면이 확대되지 않는 16px로 맞췄다</li>
                  <li>오류가 나도 입력이 남고 다시 보내기 한 번으로 이어진다</li>
                  <li>새로고침해도 통과한 방과 퀴즈 기록이 이어진다</li>
                  <li>소리는 선택 사항이다. 글만으로 모든 기능을 쓸 수 있다</li>
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

        <section id="data">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">5주차 공유 항목 · 확보한 데이터와 분석 방향</div>
              <h2>어디서 막히고 무엇을 배웠는지가 데이터다</h2>
            </div>
            <div className="tablewrap">
              <table className="stack">
                <thead>
                  <tr>
                    <th>데이터</th>
                    <th>출처</th>
                    <th>내용</th>
                    <th>쓰임</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {DATASETS.map((d) => (
                    <tr key={d.name}>
                      <td data-label="데이터">{d.name}</td>
                      <td data-label="출처">{d.origin}</td>
                      <td data-label="내용">{d.content}</td>
                      <td data-label="쓰임">{d.use}</td>
                      <td data-label="상태">
                        <Pill kind={d.status}>{d.statusText}</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="cols gap-top">
              <div className="card">
                <h3>분석 방향</h3>
                <ul>
                  <li>방별 탈출률, 평균 시도 횟수, 힌트 사용량으로 어떤 개념에서 막히는지 본다</li>
                  <li>입장 전과 탈출 후의 퀴즈 정답률 변화로 학습 효과를 잰다</li>
                  <li>지시의 방 질문을 형태소 분석하고 임베딩으로 묶어 수법을 분류한다 (2주차 텍스트 애널리틱스)</li>
                  <li>환각의 방에서 사람들이 가장 자주 속는 설명이 무엇인지 센다</li>
                </ul>
              </div>
              <div className="card">
                <h3>품질과 개인정보</h3>
                <ul>
                  <li>닉네임만 받는다. 이메일과 실명은 받지 않는다</li>
                  <li>질문은 자유 입력이므로 저장 전에 전화번호와 이메일을 마스킹한다</li>
                  <li>화면에 "입력 내용은 분석에 쓰입니다. 개인정보를 넣지 마세요"를 표시한다</li>
                  <li>분석 페이지에 데이터 출처와 수집 기간, 건수를 명시한다</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="ai">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">5주차 공유 항목 · LLM·RAG·에이전트 활용 계획</div>
              <h2>AI는 연기만 하고, 문은 코드가 연다</h2>
            </div>
            <div className="cols">
              <div className="card">
                <h3>LLM</h3>
                <ul>
                  <li>
                    FastAPI 서버에서 OpenAI 호환 API로 호출. 수업과 같은 <span className="mono">.env</span> 네 줄 구성
                  </li>
                  <li>
                    모델은 수업에서 쓰는 <span className="mono">gemini-3.5-flash-lite</span>, 사고 수준{' '}
                    <span className="mono">low</span>
                  </li>
                  <li>방마다 문지기의 역할 프롬프트를 따로 둔다</li>
                  <li>구조화 출력으로 답변과 근거 문서 번호를 받고 Pydantic으로 검증</li>
                </ul>
              </div>
              <div className="card">
                <h3>RAG</h3>
                <ul>
                  <li>서가의 방 문서를 청킹·임베딩해 pgvector에 저장한다. 검색된 상위 3건만 근거로 사서가 답한다</li>
                  <li>지시의 방 사건 파일도 같은 방식으로 검색해 답변에 출처를 붙인다</li>
                  <li>8주차 시연 3건: 정답이 나오는 검색어, 오래된 문서가 걸려 틀리는 검색어, 자료 없음이 나오는 검색어</li>
                </ul>
              </div>
              <div className="card">
                <h3>에이전트·MCP</h3>
                <ul>
                  <li>필수 범위가 아니다. 7주차 수업 뒤 적용 여부를 정한다</li>
                  <li>후보: 문지기의 방에서 플레이어가 쓴 프롬프트에 자동 공격을 돌리는 에이전트</li>
                </ul>
              </div>
              <div className="card">
                <h3>오답이 나왔을 때의 대응 설계</h3>
                <ul>
                  <li>문이 열리는지는 제출한 값을 코드가 대조해서만 판정한다</li>
                  <li>근거 문서가 없으면 "자료 없음"으로 답한다</li>
                  <li>환각의 방의 지어낸 설명은 미리 정해 둔다. 실제 환각에 맡기면 풀 수 없는 문제가 나올 수 있다</li>
                  <li>환각의 방은 맞은 건수만 알려 주고 어느 건이 틀렸는지는 알려 주지 않는다. 찍어서 통과하는 것을 막는다</li>
                  <li>스키마 검증에 실패하면 한 번 다시 요청하고, 또 실패하면 정해 둔 안전 응답을 보낸다</li>
                  <li>호출 한도 초과와 시간 초과는 화면에 원인과 다시 시도 방법을 알린다</li>
                </ul>
              </div>
            </div>

            <h3 className="sub-h">비주얼·음성·음악과 개발 도구</h3>
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
                  <li>길이와 닉네임당 횟수 검사</li>
                  <li>방 규칙 적용. 서가의 방은 검색된 상위 3건만 근거로 삼는다</li>
                  <li>근거 문서 검색</li>
                  <li>LLM 호출과 스키마 검증</li>
                  <li>출력 검사. 정답이 그대로 새지 않게 가린다</li>
                  <li>로그 저장 후 응답</li>
                </ol>
              </div>
              <div className="card">
                <h3>API</h3>
                <ul>
                  <li>
                    <span className="mono">POST /rooms/1/press</span>, <span className="mono">/present</span> 진술 추궁과 증거 제시
                  </li>
                  <li>
                    <span className="mono">POST /interrogate</span>, <span className="mono">/evidence</span> 지시의 방 질문과 암호 판정
                  </li>
                  <li>
                    <span className="mono">POST /rooms/2/check</span> 검수 결과에서 맞은 건수를 돌려준다
                  </li>
                  <li>
                    <span className="mono">POST /rooms/3/ask</span> 검색된 상위 3건으로 사서가 답한다
                  </li>
                  <li>
                    <span className="mono">POST /rooms/3/check</span>, <span className="mono">/final/check</span> 비상문과 정문 암호 판정
                  </li>
                  <li>
                    <span className="mono">GET /stats</span> 분석 페이지용 집계
                  </li>
                  <li>
                    <span className="mono">GET /docs</span> Swagger UI
                  </li>
                </ul>
              </div>
              <div className="card">
                <h3>속도·비용·보안</h3>
                <ul>
                  <li>
                    API 키는 <span className="mono">.env</span>와 Render 환경변수에만 둔다. Git에 올리지 않는다
                  </li>
                  <li>정답은 서버에만 둔다. 브라우저로 보내지 않는다</li>
                  <li>질문 300자, 출력 토큰 상한, 대화 이력 없이 한 번씩 호출</li>
                  <li>
                    개발은 무료 등급. 공개 플레이는 질문 5,000회에 약 $5.6로 추정 <Todo>실측 후 갱신</Todo>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="checklist">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">강의 자료 대조</div>
              <h2>팀 프로젝트 조건 대조표</h2>
              <p>강의계획서와 「퀴즈 및 팀 프로젝트 안내」에 적힌 조건을 하나씩 옮기고 우리 계획을 맞춰 적었다.</p>
            </div>
            <div className="tablewrap">
              <table className="stack">
                <thead>
                  <tr>
                    <th>강의 조건</th>
                    <th>우리 계획</th>
                    <th>현재</th>
                  </tr>
                </thead>
                <tbody>
                  {CONDITIONS.map((c) => (
                    <tr key={c.condition}>
                      <td data-label="강의 조건">{c.condition}</td>
                      <td data-label="우리 계획">{c.plan}</td>
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
              <h2>일정과 역할</h2>
            </div>
            <div className="tablewrap">
              <table className="stack">
                <thead>
                  <tr>
                    <th>주차</th>
                    <th>수업 주제</th>
                    <th>팀이 끝낼 일</th>
                  </tr>
                </thead>
                <tbody>
                  {SCHEDULE.map((s) => (
                    <tr key={s.week}>
                      <td className="num" data-label="주차">
                        {s.week}
                      </td>
                      <td data-label="수업 주제">{s.topic}</td>
                      <td data-label="끝낼 일">{s.todo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="cols gap-top">
              <div className="card">
                <h3>
                  팀원 역할 <Todo>팀 확정 필요</Todo>
                </h3>
                <ul>
                  <li>프런트엔드와 화면 설계</li>
                  <li>백엔드와 LLM 연동</li>
                  <li>데이터와 분석 페이지</li>
                  <li>방 시나리오와 프롬프트</li>
                  <li>품질 점검과 발표</li>
                </ul>
              </div>
              <div className="card">
                <h3>주소 3가지</h3>
                <ul>
                  {LINKS.map((l) => (
                    <li key={l.label}>
                      {l.label}
                      {': '}
                      {l.url ? <a href={l.url}>{l.url}</a> : <Todo>배포 후 기입</Todo>}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card">
                <h3>기능을 줄여야 할 때의 순서</h3>
                <ul>
                  <li>먼저 뺀다: 방 5, 방 4, 음성과 배경음</li>
                  <li>끝까지 지킨다: 방 1~3, 코드 판정, 로그, 퀴즈, 분석 페이지, 배포</li>
                  <li>실패한 실험은 원인과 개선 과정을 팀 페이지에 남긴다</li>
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
              300토큰을 가정했다
            </li>
          </ul>
        </div>
      </footer>
    </>
  )
}
