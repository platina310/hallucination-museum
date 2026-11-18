// 팀 프로젝트 페이지. 5주차 아이디어 공유와 8주차 발표를 이 페이지로 진행한다.
// 표의 내용은 아래 배열만 고치면 된다.
import type { ReactNode } from 'react'
import InterrogationRoom from '../components/InterrogationRoom'

type Status = 'ok' | 'plan' | 'need'

function Pill({ kind, children }: { kind: Status; children: ReactNode }) {
  return <span className={`pill ${kind}`}>{children}</span>
}

function Todo({ children }: { children: ReactNode }) {
  return <span className="todo">{children}</span>
}

const LEVELS: { level: number; suspect: string; defense: string; lesson: string; scope: '필수' | '확장' }[] = [
  { level: 1, suspect: '야간 경비원', defense: '프롬프트 지시만', lesson: '4주차 프롬프트', scope: '필수' },
  { level: 2, suspect: '매표소 직원', defense: '프롬프트 강화. 역할 고정과 거절 예시', lesson: '4주차 프롬프트 개선', scope: '필수' },
  { level: 3, suspect: '큐레이터', defense: '출력 검사. 응답에 단어나 변형이 있으면 서버가 차단', lesson: '4주차 스키마 검증', scope: '필수' },
  { level: 4, suspect: '보안 책임자', defense: '입력 검사. 공격 의도를 분류해 차단', lesson: '4주차 분류 API', scope: '확장' },
  { level: 5, suspect: '설계자', defense: '과거에 성공한 공격과 비슷한 입력을 검색해 차단', lesson: '5주차 RAG, pgvector', scope: '확장' },
]

const DATASETS: { name: string; origin: string; content: string; use: string; status: Status; statusText: string }[] = [
  {
    name: '플레이 로그',
    origin: '자체 수집. 반 공개 플레이',
    content: '닉네임, 레벨, 질문, 응답, 차단 여부, 돌파 여부, 응답 시간, 토큰 수',
    use: '분석 페이지, 레벨 5 방어',
    status: 'plan',
    statusText: '6주차부터 수집',
  },
  {
    name: '영어 공격문',
    origin: 'Lakera Mosscap 데이터셋. Hugging Face, MIT 라이선스',
    content: 'DEF CON 31 게임에 제출된 프롬프트 공격문',
    use: '한국어 공격과 유형 비교, 레벨 5 초기 자료',
    status: 'plan',
    statusText: '내려받기 예정',
  },
  {
    name: '사건 파일',
    origin: '팀 작성',
    content: '용의자별 근무일지, 출입기록, 진술 요지',
    use: '용의자 답변의 근거 문서. 답변마다 출처 표시',
    status: 'ok',
    statusText: '레벨 1 초안',
  },
]

// 강의계획서와 「퀴즈 및 팀 프로젝트 안내」의 조건. 진행 상황이 바뀌면 status와 statusText를 고친다.
const CONDITIONS: { condition: string; plan: string; status: Status; statusText: string }[] = [
  { condition: 'React 화면 (필수)', plan: '팀 페이지와 레벨 1 심문실을 React로 만들었다. 분석 페이지는 7주차', status: 'ok', statusText: '레벨 1 구현' },
  { condition: '프런트엔드에 입력·로딩·오류·응답·출처 표시', plan: '심문실에 다섯 상태를 모두 넣었다. 빈 결과는 "근거 없음"으로 표시', status: 'ok', statusText: '구현' },
  { condition: 'LLM 연동 (필수). 서버에서 LLM API 호출', plan: 'FastAPI에서 Gemini 호출. 4주차 실습 서버 구조를 이어 쓴다', status: 'plan', statusText: '6주차' },
  { condition: '클라우드 배포 (필수). Vercel, Render, Supabase', plan: '프런트 Vercel, 백엔드 Render, DB Supabase', status: 'plan', statusText: '계획' },
  { condition: 'PostgreSQL. RAG를 쓰면 pgvector', plan: '로그 테이블, 사건 파일과 공격 임베딩', status: 'plan', statusText: '계획' },
  { condition: 'GitHub 저장소. 소스, 실행 방법, 모델·프롬프트·검증 기록', plan: '저장소를 만들고 실행 방법을 README에 적었다. 레벨별 프롬프트와 돌파율 변화는 이어서 기록', status: 'ok', statusText: '저장소 생성' },
  { condition: '데이터 출처 명시와 분석 페이지', plan: '출처는 이 페이지의 데이터 표. 분석은 /stats 화면', status: 'plan', statusText: '계획' },
  { condition: 'RAG 적용 팀은 우수 질의·응답 3건 실시간 시연', plan: '사건 파일 근거 답변 2건, 유사 공격 차단 1건', status: 'plan', statusText: '계획' },
  { condition: '5주차 공유. 사용자와 문제, 데이터와 분석, AI 계획, UI 프로토타입. 5~6분', plan: '이 페이지의 문제, 화면, 데이터, AI 계획 구역', status: 'ok', statusText: '초안' },
  { condition: '8주차 발표는 슬라이드 없이 팀 페이지로. 실제 기능과 AI 응답 시연', plan: '팀 페이지를 React 서비스 안에 두었다. 내용은 매주 갱신한다', status: 'ok', statusText: '틀 완성' },
  { condition: '발표 자료에 주소 3가지. GitHub, 서비스, Swagger UI', plan: '아래 일정·역할 구역에 적는다', status: 'need', statusText: '배포 후 기입' },
  { condition: '팀 4~5명과 팀원 역할', plan: '역할 다섯 가지를 나눠 두었다', status: 'need', statusText: '팀 확정 필요' },
  { condition: '인증키는 .env로 분리. 민감·개인정보는 AI에 입력하지 않는다. 무료 범위 우선', plan: '키 분리, 닉네임만 수집, 저장 전 마스킹, 무료 등급으로 개발', status: 'plan', statusText: '계획' },
]

const GRADING: { item: string; weight: string; show: string }[] = [
  { item: '시스템 기능 설계·구현', weight: '30%', show: '방어 계층 구조, 레벨별 프롬프트, 응답 검증과 오류 대응' },
  { item: 'Needs 파악·문제 정의', weight: '20%', show: 'AI 보안 교육 수요, Gandalf와의 비교, 차별점' },
  { item: 'UI/UX·사용성', weight: '20%', show: '심문실 이용 흐름, PC·모바일 대응, 로딩·오류·빈 결과 처리, 반 플레이 뒤 고친 점' },
  { item: '데이터·API 활용', weight: '10%', show: '플레이 로그와 공개 데이터셋, 공격 유형 분석 결과' },
  { item: '성능·보안 등 비기능', weight: '10%', show: '응답 속도와 호출 비용 실측, 키와 개인정보 보호, 남은 한계' },
  { item: '팀 페이지·배포·발표·시연', weight: '10%', show: '배포 주소 3가지, 실시간 심문 시연, RAG 3건' },
]

const SCHEDULE: { week: number; topic: string; todo: string }[] = [
  { week: 5, topic: 'RAG', todo: '아이디어 공유. 사건 파일을 청킹·임베딩해 근거 답변 만들기' },
  { week: 6, topic: 'Claude Code', todo: '레벨 1~3 풀스택 구현과 배포. 로그 저장. 반에 링크 공개' },
  { week: 7, topic: 'MCP와 품질 개선', todo: '분석 페이지. 속도·비용·보안 점검. 여유가 있으면 레벨 4~5' },
  { week: 8, topic: '기말 발표', todo: '팀 페이지로 발표 15분, 질의응답 5분' },
]

// 배포 후 주소를 넣는다. 빈 문자열이면 "배포 후 기입"으로 표시된다.
const LINKS: { label: string; url: string }[] = [
  { label: 'GitHub 저장소', url: 'https://github.com/platina310/mukbigwon' },
  { label: '서비스 웹 주소 (React, 팀 페이지 포함)', url: '' },
  { label: 'Swagger UI 주소 (FastAPI /docs)', url: '' },
]

export default function TeamPage() {
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
              AI 용의자가 숨긴 단어를 심문으로 받아 내는 <mark>프롬프트 보안 훈련 게임</mark>
            </p>
            <p className="tagline">말하지 않을 권리는 있습니다. 지켜질지는 조사관님께 달렸습니다.</p>
            <div className="cta">
              <a className="btn" href="#play">
                레벨 1 심문해 보기
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
              <div className="k">사건</div>
              <div className="v">한빛미술관 야간 도난 (팀이 지어낸 가상의 사건)</div>
            </div>
            <div className="row">
              <div className="k">피조사자</div>
              <div className="v">AI 용의자 5명. 각자 단서 단어 하나를 숨기고, 레벨이 오를수록 방어가 강해진다</div>
            </div>
            <div className="row">
              <div className="k">조사관</div>
              <div className="v">플레이어. 대화로 단어를 알아내 증거로 제출한다</div>
            </div>
            <div className="row">
              <div className="k">판정</div>
              <div className="v">제출한 단어를 서버 코드가 대조한다. AI는 판정하지 않는다</div>
            </div>
            <div className="row">
              <div className="k">남는 것</div>
              <div className="v">한국어 공격 로그. 유형별로 분석해 공개하고, 최종 레벨의 방어에 다시 쓴다</div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section id="problem">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">5주차 공유 항목 · 대상 사용자와 해결하려는 문제</div>
              <h2>프롬프트 공격은 직접 뚫어 봐야 이해한다</h2>
            </div>
            <div className="cols">
              <div className="card">
                <h3>대상 사용자</h3>
                <ul>
                  <li>사내 챗봇이나 AI 상담을 도입하는 회사의 임직원과 개발자</li>
                  <li>이들을 교육하는 보안·준법 담당자</li>
                </ul>
              </div>
              <div className="card">
                <h3>해결하려는 문제</h3>
                <ul>
                  <li>"AI에게 비밀을 맡기면 안 된다"는 원칙은 글로 읽어서는 설계에 반영되지 않는다</li>
                  <li>어떤 말에 AI가 무너지는지 직접 해 본 사람이 드물다</li>
                  <li>
                    한국어 실습 도구와 한국어 공격 데이터가 부족하다 <Todo>조사로 확인할 가설</Todo>
                  </li>
                </ul>
              </div>
              <div className="card">
                <h3>근거와 선행 사례</h3>
                <ul>
                  <li>OWASP의 LLM 취약점 Top 10은 프롬프트 인젝션을 1순위로 꼽는다</li>
                  <li>Lakera의 Gandalf가 같은 장르의 영어 게임이다. 2025년에 에이전트 공격형으로 확장됐다</li>
                  <li>
                    시장 규모와 교육 수요 수치 <Todo>8주차 전 보강</Todo>
                  </li>
                </ul>
              </div>
              <div className="card">
                <h3>우리 팀의 차별점</h3>
                <ul>
                  <li>한국어 심문 서사. 용의자마다 성격과 방어가 다르다</li>
                  <li>판정과 방어를 코드로 분리해 방어 계층별 차단율을 숫자로 낸다</li>
                  <li>쌓인 공격 로그를 분석해 공개하고, 최종 레벨의 방어로 되돌린다</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="play">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">5주차 공유 항목 · 주요 화면 UI 프로토타입</div>
              <h2>레벨 1 심문실</h2>
              <p>
                야간 경비원 도 씨는 수장고 암호 단어를 알고 있다. 레벨 1의 방어는 "말하지 말라"는 지시 한 줄뿐이다. 대화로
                단어를 알아내 오른쪽에 제출한다.
              </p>
            </div>

            <InterrogationRoom />

            <div className="flow" aria-label="이용 흐름">
              <span className="box">닉네임 입력</span>
              <span className="arr">→</span>
              <span className="box">용의자 선택</span>
              <span className="arr">→</span>
              <span className="box">심문</span>
              <span className="arr">→</span>
              <span className="box">증거 제출</span>
              <span className="arr">→</span>
              <span className="box">돌파 결과와 다음 레벨</span>
              <span className="arr">→</span>
              <span className="box">공격 분석 페이지</span>
            </div>

            <div className="tablewrap gap-top">
              <table className="stack">
                <thead>
                  <tr>
                    <th>레벨</th>
                    <th>용의자</th>
                    <th>방어 계층</th>
                    <th>수업 연결</th>
                    <th>범위</th>
                  </tr>
                </thead>
                <tbody>
                  {LEVELS.map((l) => (
                    <tr key={l.level}>
                      <td className="num" data-label="레벨">{l.level}</td>
                      <td data-label="용의자">{l.suspect}</td>
                      <td data-label="방어 계층">{l.defense}</td>
                      <td data-label="수업 연결">{l.lesson}</td>
                      <td data-label="범위">
                        <Pill kind={l.scope === '필수' ? 'ok' : 'plan'}>{l.scope}</Pill>
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
                  <li>PC와 모바일에서 같은 기능을 쓴다. 모바일에서는 표가 카드로 바뀌고 증거 제출이 대화 바로 아래로 온다</li>
                  <li>버튼은 손가락으로 누르기 쉬운 크기(44px 이상)로, 입력 글자는 화면이 확대되지 않는 16px로 맞췄다</li>
                  <li>오류가 나도 질문이 남고 '다시 보내기' 한 번으로 이어진다</li>
                  <li>새로고침해도 심문 기록이 이어진다</li>
                  <li>키보드만으로 질문, 제출, 다시 시작을 할 수 있다</li>
                </ul>
              </div>
              <div className="card">
                <h3>
                  사용성 개선 사례 <Todo>반 플레이 뒤 기록</Todo>
                </h3>
                <ul>
                  <li>6주차 공개 플레이에서 사람들이 막히는 지점을 관찰해 고친 내용을 여기에 적는다</li>
                  <li>기록 형식: 문제, 원인, 고친 화면, 전후 비교</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="data">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">5주차 공유 항목 · 확보한 데이터와 분석 방향</div>
              <h2>데이터는 플레이할수록 쌓인다</h2>
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
                <h3>분석 방향 (2주차 텍스트 애널리틱스)</h3>
                <ul>
                  <li>형태소 분석과 TF-IDF로 돌파에 성공한 질문의 핵심어 추출</li>
                  <li>임베딩 군집으로 공격 유형 분류. 역할극, 권한 사칭, 변환 요청, 지시 덮어쓰기</li>
                  <li>레벨별 돌파율과 평균 질문 횟수, 방어 계층별 차단율</li>
                  <li>한국어 공격과 영어 공격의 유형 분포 비교</li>
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
              <h2>AI는 연기만 하고, 판정과 방어는 코드가 한다</h2>
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
                  <li>구조화 출력으로 진술, 근거 문서 번호, 거절 여부를 받고 Pydantic으로 검증</li>
                </ul>
              </div>
              <div className="card">
                <h3>RAG</h3>
                <ul>
                  <li>사건 파일을 청킹·임베딩해 pgvector에 저장. 용의자는 검색된 사실만 말하고 출처를 붙인다</li>
                  <li>레벨 5는 과거에 성공한 공격을 임베딩해 두고, 비슷한 질문이 오면 차단한다</li>
                  <li>8주차 시연 3건: 사건 파일 근거 답변 2건, 유사 공격 차단 1건</li>
                </ul>
              </div>
              <div className="card">
                <h3>에이전트·MCP</h3>
                <ul>
                  <li>필수 범위가 아니다. 7주차 수업 뒤 적용 여부를 정한다</li>
                  <li>후보: 운영자가 MCP로 로그 DB를 조회해 주간 공격 요약을 받는 기능</li>
                </ul>
              </div>
              <div className="card">
                <h3>오답이 나왔을 때의 대응 설계</h3>
                <ul>
                  <li>돌파 판정은 제출한 단어의 문자열 대조로만 한다</li>
                  <li>사건 파일에 근거가 없으면 "기억나지 않습니다"로 답한다</li>
                  <li>스키마 검증에 실패하면 한 번 다시 요청하고, 또 실패하면 정해 둔 안전 응답을 보낸다</li>
                  <li>레벨 3부터 응답에 단어가 섞이면 서버가 가리고 기록한다</li>
                  <li>호출 한도 초과와 시간 초과는 화면에 원인과 다시 시도 방법을 알린다</li>
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
                <small>Vercel · 심문실, 증거 제출, 분석 페이지, 팀 페이지</small>
              </div>
              <span className="arr">→</span>
              <div className="node">
                <b>FastAPI</b>
                <small>Render · 검사, 검색, LLM 호출, 판정, 로그</small>
              </div>
              <span className="arr">→</span>
              <div className="node">
                <b>Gemini API</b>
                <small>진술 생성, 임베딩</small>
              </div>
              <span className="arr">↔</span>
              <div className="node">
                <b>PostgreSQL + pgvector</b>
                <small>Supabase · 로그, 사건 파일, 공격 임베딩</small>
              </div>
            </div>
            <div className="cols">
              <div className="card">
                <h3>질문 한 건의 처리 순서</h3>
                <ol>
                  <li>길이와 닉네임당 횟수 검사</li>
                  <li>입력 검사 (레벨 4부터)</li>
                  <li>유사 공격 검색 (레벨 5)</li>
                  <li>사건 파일 검색</li>
                  <li>LLM 호출과 스키마 검증</li>
                  <li>출력 검사 (레벨 3부터)</li>
                  <li>로그 저장 후 응답</li>
                </ol>
              </div>
              <div className="card">
                <h3>API</h3>
                <ul>
                  <li>
                    <span className="mono">POST /interrogate</span> 질문을 받아 진술, 근거, 차단 여부를 돌려준다
                  </li>
                  <li>
                    <span className="mono">POST /evidence</span> 제출한 단어를 판정한다
                  </li>
                  <li>
                    <span className="mono">GET /levels</span> 용의자 목록과 잠금 상태
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
                  <li>암호 단어는 서버에만 둔다. 브라우저로 보내지 않는다</li>
                  <li>질문 300자, 출력 토큰 상한, 대화 이력 없이 한 번씩 호출</li>
                  <li>
                    개발은 무료 등급. 공개 플레이는 5,000회에 약 $5.6로 추정 <Todo>실측 후 갱신</Todo>
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
                      <td className="num" data-label="배점">{g.weight}</td>
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
                      <td className="num" data-label="주차">{s.week}</td>
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
                  <li>사건 시나리오와 프롬프트</li>
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
                  <li>먼저 뺀다: 레벨 5, 레벨 4, 에이전트·MCP 기능</li>
                  <li>끝까지 지킨다: 레벨 1~3, 증거 제출 판정, 로그, 분석 페이지, 배포</li>
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
            <li>강의 자료: 「금융빅데이터분석실습 강의계획서」, 「퀴즈 및 팀 프로젝트 안내」, 4주차 워크북과 교재 12</li>
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
