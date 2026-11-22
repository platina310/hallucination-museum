// 5주차 "아이디어 공유" 페이지. LMS에 내는 발표 URL이 이 화면이다.
// 제출 안내의 순서대로 주제, 대상 사용자와 문제, 데이터, AI 활용 계획을 요약하고 프로토타입으로 이어 준다.
// 8주차까지 쌓아 가는 자세한 내용은 Detail.tsx(/detail)에 있다.
import { Pill, Todo } from '../components/Marks'
import { DATASETS, IDEA_URL, PROTOTYPE_URL, REPO_URL, SCHEDULE, SCREENS, SWAGGER_URL, TEAM } from '../content/shared'
import { ROOMS } from '../game/rooms'

const FLOW = ['수장고 지도', '입장 전 퀴즈', '방에서 AI와 겨루기', '배운 것과 같은 퀴즈', '정문 자물쇠', '탈출 결과와 별점', '분석 페이지']

export default function Idea() {
  const hasTeam = TEAM.name !== '' || TEAM.members.length > 0

  return (
    <>
      <div className="top">
        <div className="wrap">
          <span className="mono brand">
            환각 미술관<span className="course"> · 아이디어 공유 · 금융빅데이터분석실습 5주차</span>
          </span>
          <nav aria-label="페이지 구역">
            <a href="#topic">주제</a>
            <a href="#problem">사용자·문제</a>
            <a href="#data">데이터</a>
            <a href="#ai">AI 계획</a>
            <a href="#prototype">프로토타입</a>
            <a href="#plan">일정</a>
            <a href="/prototype" className="nav-game">
              프로토타입 열기
            </a>
          </nav>
        </div>
      </div>

      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="stamp two-line" aria-hidden="true">
              환각
              <br />
              미술관
            </div>
            <h1 className="sr-only">환각 미술관 아이디어 공유</h1>
            <p className="lede">
              AI가 지키는 방을 말과 추리로 뚫으며 <mark>LLM의 원리를 배우는 방탈출</mark>
            </p>
            <p className="tagline">이 미술관의 AI들은 막힘 없이 말합니다. 전부 맞는 말은 아닙니다.</p>
            <div className="cta">
              <a className="btn" href="/prototype">
                프로토타입 열기
              </a>
              <a className="btn ghost" href="/detail">
                상세 자료
              </a>
            </div>
          </div>
          <div className="form" role="table" aria-label="발표 개요">
            <div className="head">
              <span className="mono">5주차 아이디어 공유</span>
              <span className="mono">발표 5~6분</span>
            </div>
            <div className="row">
              <div className="k">과목</div>
              <div className="v">KAIST 디지털금융MBA 금융빅데이터분석실습</div>
            </div>
            {hasTeam && (
              <div className="row">
                <div className="k">팀</div>
                <div className="v">
                  {TEAM.name}
                  {TEAM.name !== '' && TEAM.members.length > 0 && ' · '}
                  {TEAM.members.join(', ')}
                </div>
              </div>
            )}
            <div className="row">
              <div className="k">주제</div>
              <div className="v">LLM 개념을 방마다 하나씩 배우는 AI 방탈출 게임</div>
            </div>
            <div className="row">
              <div className="k">발표 순서</div>
              <div className="v">주제, 사용자와 문제, 데이터, AI 계획을 이 페이지로 설명하고 프로토타입을 시연한다</div>
            </div>
            <div className="row">
              <div className="k">발표 URL</div>
              <div className="v">
                <a href={IDEA_URL}>{IDEA_URL}</a>
              </div>
            </div>
            <div className="row">
              <div className="k">프로토타입 URL</div>
              <div className="v">
                <a href={PROTOTYPE_URL}>{PROTOTYPE_URL}</a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section id="topic">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow step">
                <b>01</b> 프로젝트 주제
              </div>
              <h2>AI의 허점을 직접 찔러 보며 배우는 방탈출</h2>
              <p>
                야간 점검을 나왔다가 미술관 수장고에 갇힌다. 방마다 AI 하나가 문을 지키고, 그 AI의 허점을 찾아야 문이 열린다. 허점
                하나가 곧 LLM 개념 하나다.
              </p>
            </div>
            <div className="topic-grid">
              <div className="form" role="table" aria-label="게임 개요">
                <div className="row">
                  <div className="k">무대</div>
                  <div className="v">한빛미술관 수장고 (팀이 지어낸 가상의 장소)</div>
                </div>
                <div className="row">
                  <div className="k">구성</div>
                  <div className="v">방 5개와 정문. 8주차 필수 범위는 방 3개와 정문이다</div>
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
              <div className="tablewrap">
                <table className="stack">
                  <thead>
                    <tr>
                      <th>방</th>
                      <th>배우는 것</th>
                      <th>수업 연결</th>
                      <th>범위</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROOMS.map((r) => (
                      <tr key={r.id}>
                        <td data-label="방" className="nowrap">
                          {r.id}. {r.name}
                        </td>
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
            </div>
          </div>
        </section>

        <section id="problem">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow step">
                <b>02</b> 대상 사용자와 문제 정의
              </div>
              <h2>LLM은 직접 속여 보고 속아 봐야 이해한다</h2>
            </div>
            <div className="cols two">
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
                  <li>시장 규모와 교육 수요 수치는 8주차 발표 전까지 보강한다</li>
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
            <p className="more">
              방의 구조는 성공한 게임 7종의 장치를 옮겨 만들었다. <a href="/detail#benchmark">벤치마킹 표 보기</a>
            </p>
          </div>
        </section>

        <section id="data">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow step">
                <b>03</b> 데이터 확보와 분석 방향
              </div>
              <h2>어디서 막히고 무엇을 배웠는지가 데이터다</h2>
              <p>
                핵심 데이터는 우리 서비스에서 직접 쌓는 플레이 로그와 퀴즈 응답이다. 6주차에 반에 링크를 공개해 모으고, 공개
                데이터셋 하나를 비교용으로 더한다.
              </p>
            </div>
            <div className="tablewrap">
              <table className="stack">
                <thead>
                  <tr>
                    <th>데이터</th>
                    <th>출처</th>
                    <th>내용</th>
                    <th>쓰임</th>
                    <th>확보 상태</th>
                  </tr>
                </thead>
                <tbody>
                  {DATASETS.map((d) => (
                    <tr key={d.name}>
                      <td data-label="데이터">{d.name}</td>
                      <td data-label="출처">{d.origin}</td>
                      <td data-label="내용">{d.content}</td>
                      <td data-label="쓰임">{d.use}</td>
                      <td data-label="확보 상태">
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
              <div className="eyebrow step">
                <b>04</b> AI 활용 계획 (LLM·RAG·에이전트)
              </div>
              <h2>AI는 연기만 하고, 문은 코드가 연다</h2>
            </div>
            <div className="arch" aria-label="시스템 구조">
              <div className="node">
                <b>React</b>
                <small>Vercel · 수장고 지도, 방, 퀴즈, 분석 페이지</small>
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
            <div className="cols two">
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
                <h3>AI가 틀릴 때의 대응</h3>
                <ul>
                  <li>문이 열리는지는 제출한 값을 코드가 대조해서만 판정한다</li>
                  <li>근거 문서가 없으면 "자료 없음"으로 답한다</li>
                  <li>환각의 방의 지어낸 설명은 미리 정해 둔다. 실제 환각에 맡기면 풀 수 없는 문제가 나올 수 있다</li>
                  <li>스키마 검증에 실패하면 한 번 다시 요청하고, 또 실패하면 정해 둔 안전 응답을 보낸다</li>
                </ul>
              </div>
            </div>
            <p className="more">
              요청 처리 순서, API 목록, 비용 추정, 비주얼·음성 계획은 <a href="/detail#architecture">상세 자료</a>에 있다.
            </p>
          </div>
        </section>

        <section id="prototype">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow step">
                <b>05</b> UI 프로토타입
              </div>
              <h2>지금 바로 탈출해 볼 수 있다</h2>
              <p>
                방 세 개와 정문 자물쇠까지 처음부터 끝까지 해 볼 수 있다. 백엔드 연결 전이라 AI의 답은 정해진 대본으로 나온다.
              </p>
            </div>
            <div className="cta">
              <a className="btn" href="/prototype">
                프로토타입 열기
              </a>
            </div>

            <h3 className="sub-h">이용 흐름</h3>
            <div className="flow" aria-label="이용 흐름">
              {FLOW.map((f, i) => (
                <span key={f} className="flow-step">
                  {i > 0 && (
                    <span className="arr" aria-hidden="true">
                      →
                    </span>
                  )}
                  <span className="box">{f}</span>
                </span>
              ))}
            </div>

            <h3 className="sub-h">주요 화면</h3>
            <div className="tablewrap">
              <table className="stack">
                <thead>
                  <tr>
                    <th>화면</th>
                    <th>사용자가 하는 일</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {SCREENS.map((s) => (
                    <tr key={s.name}>
                      <td data-label="화면">{s.name}</td>
                      <td data-label="하는 일">{s.does}</td>
                      <td data-label="상태">
                        <Pill kind={s.status}>{s.statusText}</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="cols gap-top">
              <div className="card">
                <h3>사용하기 쉽게 설계한 점</h3>
                <ul>
                  <li>처음 온 사람도 헤매지 않게 임무, 지금 단계, 다음 수, 힌트를 방마다 보여 준다</li>
                  <li>PC와 모바일에서 같은 기능을 쓴다. 모바일에서는 표가 카드로 바뀐다</li>
                  <li>오류가 나도 입력이 남고 다시 보내기 한 번으로 이어진다</li>
                  <li>새로고침해도 통과한 방과 퀴즈 기록이 이어진다</li>
                </ul>
              </div>
              <div className="card">
                <h3>프로토타입에서 확인할 수 있는 상태</h3>
                <ul>
                  <li>입력, 로딩, 오류, 응답, 출처 표시. 빈 결과는 "근거 없음"으로 나온다</li>
                  <li>화면 위의 "시연용 조작"을 켜면 서버가 느리거나 오류일 때의 화면을 볼 수 있다</li>
                  <li>공사 중인 방 4와 5는 지도에 자리만 표시했다</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="plan">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow step">
                <b>06</b> 8주차까지의 일정
              </div>
              <h2>남은 3주에 끝낼 일</h2>
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
                <h3>주소</h3>
                <ul>
                  <li>
                    발표 URL: <a href={IDEA_URL}>{IDEA_URL}</a>
                  </li>
                  <li>
                    프로토타입 URL: <a href={PROTOTYPE_URL}>{PROTOTYPE_URL}</a>
                  </li>
                  <li>
                    GitHub 저장소: <a href={REPO_URL}>{REPO_URL}</a>
                  </li>
                  <li>Swagger UI: {SWAGGER_URL ? <a href={SWAGGER_URL}>{SWAGGER_URL}</a> : '백엔드 배포 뒤 기입 (6주차)'}</li>
                </ul>
              </div>
              <div className="card">
                <h3>기능을 줄여야 할 때의 순서</h3>
                <ul>
                  <li>먼저 뺀다: 방 5, 방 4, 음성과 배경음</li>
                  <li>끝까지 지킨다: 방 1~3, 코드 판정, 로그, 퀴즈, 분석 페이지, 배포</li>
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
            <li>강의 자료: 「금융빅데이터분석실습 강의계획서」, 「퀴즈 및 팀 프로젝트 안내」</li>
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
              벤치마킹 수치와 비용 추정의 출처는 <a href="/detail">상세 자료</a> 맨 아래에 있다
            </li>
          </ul>
        </div>
      </footer>
    </>
  )
}
