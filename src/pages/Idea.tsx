// 팀 페이지. 5주차 아이디어 공유로 시작해 8주차 기말 발표까지 쓰는 발표 URL이 이 화면이다.
// 제출 안내의 순서대로 주제, 대상 사용자와 문제, 데이터, AI 활용 계획을 요약하고 프로토타입으로 이어 준다.
// 8주차까지 쌓아 가는 자세한 내용은 Detail.tsx(/detail)에 있다.
import { Pill } from '../components/Marks'
import { DATASETS, IDEA_URL, PROTOTYPE_URL, REPO_URL, SCHEDULE, SCREENS, SWAGGER_URL, TEAM } from '../content/shared'
import { EXPERIMENT_EN, EXPERIMENT_KO, experimentDay, experimentRows } from '../content/experiment'
import { ATTACK_TYPES, CHECKED_ON, CLEANING, EXPERIMENT_NOTES, QA_CHECKED_ON, QA_FIXES, TRIALS, UX_FIXED_ON, UX_FIXES } from '../content/results'
import { ROOMS } from '../game/rooms'

const FLOW = ['수장고 지도', '입장 전 퀴즈', '방에서 AI와 겨루기', '배운 것과 같은 퀴즈', '정문 자물쇠', '탈출 결과와 별점', '분석 페이지']

export default function Idea() {
  const hasTeam = TEAM.name !== '' || TEAM.members.length > 0

  return (
    <>
      <div className="top">
        <div className="wrap">
          <span className="mono brand">
            환각 미술관<span className="course"> · 팀 페이지 · 금융빅데이터분석실습</span>
          </span>
          <nav aria-label="페이지 구역">
            <a href="#topic">주제</a>
            <a href="#problem">사용자·문제</a>
            <a href="#data">데이터</a>
            <a href="#ai">AI 활용</a>
            <a href="#prototype">프로토타입</a>
            <a href="#trials">시행착오</a>
            <a href="#plan">일정</a>
            <a href="/stats">분석</a>
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
            <h1 className="sr-only">환각 미술관 팀 페이지</h1>
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
              <span className="mono">8주차 기말 발표</span>
              <span className="mono">발표 15분 · 질의응답 5분</span>
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
              <div className="v">주제, 사용자와 문제, 데이터와 실험, AI 활용, 시행착오를 이 페이지로 설명한 뒤 게임 시연</div>
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
                야간 점검을 나왔다가 미술관 수장고에 갇힌 조사관. 방마다 AI 하나가 문을 지키고, 그 AI의 허점을 찾아야 문이 열림. 허점
                하나가 곧 LLM 개념 하나
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
                  <div className="v">본관 방 3개, 별관 방 2개, 정문. 탈출에는 방 5개와 정문이 모두 필요</div>
                </div>
                <div className="row">
                  <div className="k">플레이어</div>
                  <div className="v">야간 점검을 나왔다가 갇힌 조사관</div>
                </div>
                <div className="row">
                  <div className="k">판정</div>
                  <div className="v">문이 열리는지는 서버 코드가 판정. AI는 판정하지 않음</div>
                </div>
                <div className="row">
                  <div className="k">남는 것</div>
                  <div className="v">공격 수법별 유출률, 방별 탈출률, 입장 전후 퀴즈 정답률</div>
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
              <h2>직접 속여 보고 속아 봐야 이해되는 LLM</h2>
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
                  <li>환각, 프롬프트의 한계, RAG 같은 개념은 글로 배우면 남지 않음</li>
                  <li>AI의 답을 그대로 믿거나 비밀을 프롬프트에 넣는 실수의 반복</li>
                  <li>회사는 AI를 쓸 줄 아는 사람을 원하지만 교육은 뒤처짐. AI를 업무에 쓰는 사람 가운데 회사에서 교육을 받은 사람은 39%</li>
                </ul>
              </div>
              <div className="card">
                <h3>근거와 선행 사례</h3>
                <ul>
                  <li>OWASP LLM Top 10(2025)의 1순위가 프롬프트 인젝션. 시스템 프롬프트 유출(7), 벡터·임베딩 약점(8), 잘못된 정보(9)가 방 1, 3, 2의 주제와 대응</li>
                  <li>수요: 관리자 66%가 AI를 다룰 줄 모르는 사람은 뽑지 않겠다고 응답 (Microsoft·LinkedIn, 31개국 3만 1천 명)</li>
                  <li>규제: EU AI법 4조가 2025년 2월부터 AI를 쓰는 조직에 직원의 AI 이해력 확보를 요구</li>
                  <li>선행 사례: Lakera의 Gandalf는 100만 명 이상이 플레이. 다만 영어이고 보안 한 주제만 다룸</li>
                </ul>
              </div>
              <div className="card">
                <h3>우리 팀의 차별점</h3>
                <ul>
                  <li>한국어. 방마다 개념 하나. 프롬프트, 환각, RAG, temperature, 방어 설계</li>
                  <li>입장 전과 탈출 후에 같은 퀴즈를 내서 학습 효과를 숫자로 측정</li>
                  <li>판정은 코드가 하고 AI는 연기만 해서, 방별 결과를 그대로 측정 가능</li>
                </ul>
              </div>
            </div>
            <p className="more">
              방의 구조는 성공한 게임 7종의 장치를 옮겨 만든 것. <a href="/detail#benchmark">벤치마킹 표 보기</a>
            </p>
          </div>
        </section>

        <section id="data">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow step">
                <b>03</b> 데이터 확보와 분석 방향
              </div>
              <h2>공개 공격문 27만 9천 건으로 문지기 시험</h2>
              <p>
                주 데이터는 공개된 프롬프트 공격문과, 그 공격문을 우리 문지기에 돌려 얻는 실험 로그. 플레이어가 많이 모이지 않아도
                분석이 성립함. 반 공개 플레이의 로그와 퀴즈 응답은 보조 자료
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
            <h3 className="sub-h">정제와 수법 분류 ({CHECKED_ON} 실행)</h3>
            <div className="cols two">
              <div className="tablewrap">
                <table className="fit">
                  <thead>
                    <tr>
                      <th>정제 단계</th>
                      <th className="num">남은 건수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CLEANING.map((c) => (
                      <tr key={c.step}>
                        <td>{c.step}</td>
                        <td className="num">{c.rows}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="tablewrap">
                <table className="fit">
                  <thead>
                    <tr>
                      <th>수법</th>
                      <th className="num">비중</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ATTACK_TYPES.map((a) => (
                      <tr key={a.type}>
                        <td>{a.type}</td>
                        <td className="num">{a.share}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {[
              { title: `자동 실험 1: 공개 공격문 표본 (영어 ${EXPERIMENT_EN.attacks}건)`, s: EXPERIMENT_EN },
              { title: `자동 실험 2: 팀이 쓴 한국어 공격문 (${EXPERIMENT_KO.attacks}건)`, s: EXPERIMENT_KO },
            ]
              .filter((x) => x.s.attacks > 0)
              .map((x) => (
                <div key={x.title}>
                  <h3 className="sub-h">{x.title}</h3>
                  <div className="tablewrap">
                    <table className="stack">
                      <thead>
                        <tr>
                          <th>지시문 조건</th>
                          <th>내용</th>
                          <th className="num">암호 유출</th>
                          <th className="num">그중 암호 그대로</th>
                        </tr>
                      </thead>
                      <tbody>
                        {experimentRows(x.s).map((e) => (
                          <tr key={e.key}>
                            <td data-label="지시문 조건">{e.condition}</td>
                            <td data-label="내용">{e.what}</td>
                            <td className="num" data-label="암호 유출">
                              {e.leaks}
                            </td>
                            <td className="num" data-label="암호 그대로">
                              {e.full}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="more">
                    모델 {x.s.model}, 실험일 {experimentDay(x.s)}. 입력 검사가 미리 막은 공격문 {x.s.input_blocked}건
                  </p>
                </div>
              ))}
            {EXPERIMENT_KO.attacks === 0 && <p className="more">한국어 공격문 65건 실험은 실행 중. 결과가 저장소에 기록되면 이 자리에 표시</p>}
            <p className="more">
              수법별 유출과 실제 플레이 기록은 <a href="/stats">분석 페이지</a>에 그래프로 정리
            </p>
            <div className="cols gap-top">
              <div className="card">
                <h3>결과를 읽을 때의 한계</h3>
                <ul>
                  {EXPERIMENT_NOTES.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                  <li>유출 판정은 코드의 글자 맞추기. 규칙에 없는 방식으로 돌려 말한 답은 세지 못함</li>
                </ul>
              </div>
              <div className="card">
                <h3>남은 분석</h3>
                <ul>
                  <li>반에 공개한 뒤 쌓이는 플레이 기록과 퀴즈 응답으로 사람이 막히는 지점과 정답률 변화 확인</li>
                  <li>수법 분류 규칙에 걸리지 않은 29.3%를 묶음 결과로 다시 분류</li>
                  <li>영어 표본의 남은 587건으로 같은 실험 반복</li>
                </ul>
              </div>
              <div className="card">
                <h3>품질과 개인정보</h3>
                <ul>
                  <li>공개 데이터의 출처, 라이선스, 내려받은 날짜와 건수를 위 표와 저장소에 기록</li>
                  <li>공개 공격문에서 빈 입력, 너무 짧거나 긴 입력, 인사말, 중복 등 70,348건 제거</li>
                  <li>플레이 로그에 닉네임과 접속 주소는 저장하지 않음. 입력에 든 전화번호와 이메일은 저장 전에 가림</li>
                  <li>질문 입력 칸 아래에 "입력한 말은 분석에 쓰여요. 개인정보는 넣지 마세요" 표시</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="ai">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow step">
                <b>04</b> AI 활용 (LLM·RAG·에이전트)
              </div>
              <h2>연기는 AI, 문을 여는 것은 코드</h2>
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
                    FastAPI 서버에서 OpenAI 호환 API로 호출. 수업과 같은 <span className="mono">.env</span> 구성
                  </li>
                  <li>
                    모델은 수업에서 쓰는 <span className="mono">gemini-3.5-flash-lite</span>. 사고 수준은 사서의 답{' '}
                    <span className="mono">low</span>, 도 씨와의 대화 <span className="mono">minimal</span>
                  </li>
                  <li>도 씨: 사람됨, 기분, 앞서 오간 말 여섯 쌍을 지시문에 넣어 대화를 이어 감</li>
                  <li>고 선생: 답과 근거 문서 번호를 JSON으로 받아 코드로 검사</li>
                </ul>
              </div>
              <div className="card">
                <h3>RAG</h3>
                <ul>
                  <li>서가의 방 문서 12건을 Gemini Embedding 2(768차원)로 임베딩해 pgvector에 저장</li>
                  <li>검색어와 가까운 문서 가운데 앞의 3건만 근거로 사서가 답변. 문서별 유사도를 화면에 표시</li>
                  <li>8주차 시연 3건: "비상문 비밀번호"(옛 문서가 걸려 틀린 답), "변경"(절반만 아는 답), "변경 개관"(정답)</li>
                  <li>"비상문 비밀번호" 검색에서, 검색된 문서 중 가장 최근인 D09는 기준 점수를 넘고도 4위라서 잘림. 사서는 옛 판본 3건만 보고 답변</li>
                  <li>지시의 방의 출처는 질문에 든 낱말로 사건 파일을 고르는 규칙. 임베딩 검색은 서가의 방에만 적용</li>
                </ul>
              </div>
              <div className="card">
                <h3>에이전트·MCP</h3>
                <ul>
                  <li>게임 서버의 /mcp에 MCP 서버를 함께 띄움. Claude 같은 MCP 클라이언트가 미술관 데이터를 도구로 사용</li>
                  <li>도구 다섯 개: 서가 검색, 공격 수법 분류, 실험 결과, 플레이 통계, 방 목록. 모두 읽기 전용</li>
                  <li>MCP 도구는 Gemini를 부르지 않고, 플레이어가 쓴 글 원문도 내보내지 않음</li>
                  <li>
                    8주차 시연 (2분, 서가의 방 시연 바로 뒤): Claude에 "'비상문 비밀번호'로 검색하면 사서에게 무엇이 전달돼?" → 옛 안내문 3건 전달, 최근 공지는 4위라
                    잘림. "'변경 개관'으로 검색하면?" → 연혁과 최근 공지 전달. "한국어 실험에서 어떤 지시문이 가장 많이 뚫렸어?" → 조건별 유출률
                  </li>
                  <li>문지기의 방: 플레이어가 쓴 지시문에 공격 네 건과 정상 질문 한 건을 자동으로 넣고 코드가 판정</li>
                </ul>
              </div>
              <div className="card">
                <h3>AI가 틀릴 때의 대응</h3>
                <ul>
                  <li>문이 열리는지와 암호가 새었는지는 코드가 판정</li>
                  <li>사서의 답에 받은 문서에 없는 네 자리 숫자가 있거나 받지 않은 문서를 근거로 대면, 정해진 답으로 바꾸고 화면에 이유 표시</li>
                  <li>아직 들키지 않은 사실과 인정하기 전의 암호는 도 씨의 지시문에 넣지 않음</li>
                  <li>모델이 12초 안에 답하지 못하거나 한도를 넘으면 그 요청만 정해진 대본으로 답변</li>
                  <li>환각의 방의 지어낸 설명은 미리 정해 둠. 실제 환각에 맡기면 풀 수 없는 문제가 나올 수 있음</li>
                </ul>
              </div>
            </div>
            <p className="more">
              요청 처리 순서, API 목록, 비용 추정, 비주얼·음성 현황은 <a href="/detail#architecture">상세 자료</a>에 정리
            </p>
          </div>
        </section>

        <section id="prototype">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow step">
                <b>05</b> UI 프로토타입
              </div>
              <h2>지금 바로 해 볼 수 있는 탈출</h2>
              <p>
                방 다섯 개(본관 셋, 별관 둘)와 정문까지 플레이 가능. 지시의 방, 서가의 방, 온도의 방, 문지기의 방은 서버의 Gemini가
                답변. 서버가 쉬는 중이거나 한도를 넘으면 정해진 대본으로 답하고, 어느 쪽이 답했는지 화면에 표시
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

            <h3 className="sub-h" id="ux-fixes">
              사용성 개선 사례
            </h3>
            <p className="sub-note">
              {UX_FIXED_ON}에 PC와 모바일로 끝까지 직접 플레이하며 불편했던 점과 고친 내용. 고친 뒤 PC(1366x768, 1280x720)와
              모바일(390x844) 크기로 다시 확인
            </p>
            <div className="tablewrap">
              <table className="stack fixes">
                <thead>
                  <tr>
                    <th>대상</th>
                    <th>불편했던 점</th>
                    <th>고친 것</th>
                  </tr>
                </thead>
                <tbody>
                  {UX_FIXES.map((f) => (
                    <tr key={f.target}>
                      <td data-label="대상">{f.target}</td>
                      <td data-label="불편했던 점">{f.problem}</td>
                      <td data-label="고친 것">{f.fix}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="sub-h" id="qa-fixes">
              품질 점검 사례
            </h3>
            <p className="sub-note">
              {QA_CHECKED_ON}에 배포한 서버를 실제로 불러 속도를 재고, 별관 두 방을 실제 모델로 돌려 보고, 화면 코드와 설정을 점검한 결과. 측정값과
              보안 점검표는 <a href="/detail#quality">상세 자료</a>에 기록
            </p>
            <div className="tablewrap">
              <table className="stack fixes">
                <thead>
                  <tr>
                    <th>대상</th>
                    <th>점검에서 나온 것</th>
                    <th>고친 것</th>
                  </tr>
                </thead>
                <tbody>
                  {QA_FIXES.map((f) => (
                    <tr key={f.target}>
                      <td data-label="대상">{f.target}</td>
                      <td data-label="나온 것">{f.found}</td>
                      <td data-label="고친 것">{f.fix}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="cols gap-top">
              <div className="card">
                <h3>사용하기 쉽게 설계한 점</h3>
                <ul>
                  <li>처음 온 사람도 헤매지 않게 임무, 지금 단계, 다음 수, 힌트를 방마다 표시</li>
                  <li>PC와 모바일에서 같은 기능 제공. PC는 장면, 판정, 참고 자료를 한 화면에 배치. 모바일에서는 그림 속 물건을 단추로도 선택</li>
                  <li>서버가 답하지 못해도 멈추지 않고 정해진 대본으로 이어짐</li>
                  <li>새로고침해도 통과한 방과 퀴즈 기록 유지</li>
                </ul>
              </div>
              <div className="card">
                <h3>프로토타입에서 확인할 수 있는 상태</h3>
                <ul>
                  <li>입력, 로딩, 오류, 응답, 출처 표시. 빈 결과는 "근거 없음"으로 표시</li>
                  <li>화면 위쪽에 AI 서버 상태 표시. 연결됨, 깨우는 중, 쉬는 중</li>
                  <li>방을 나올 때마다 단서가 하나씩 수첩에 기록. 정문 암호는 다섯 방의 단서를 모두 조합한 다섯 자리</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="trials">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow step">
                <b>06</b> 시행착오
              </div>
              <h2>실제 모델에 붙여 보니 계획과 달랐던 것</h2>
              <p>
                {CHECKED_ON}에 서버와 Gemini를 연결하고 실험을 돌리며 겪은 일. 기대와 결과가 달랐던 것만 기록. 숫자의 원본은 저장소의{' '}
                <a href={`${REPO_URL}/tree/main/data`}>data 폴더</a>
              </p>
            </div>
            <div className="trials">
              {TRIALS.map((t, i) => (
                <article className="card trial" key={t.topic}>
                  <h3>
                    <span className="mono">{String(i + 1).padStart(2, '0')}</span> {t.topic}
                  </h3>
                  <dl>
                    <dt>기대</dt>
                    <dd>{t.expected}</dd>
                    <dt>실제</dt>
                    <dd>{t.happened}</dd>
                    <dt>고친 것</dt>
                    <dd>{t.fix}</dd>
                    <dt>배운 것</dt>
                    <dd className="learned">{t.learned}</dd>
                  </dl>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="plan">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow step">
                <b>07</b> 8주차까지의 일정
              </div>
              <h2>8주차 발표까지 남은 일</h2>
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
                  <li>
                    Swagger UI: <a href={SWAGGER_URL}>{SWAGGER_URL}</a>
                  </li>
                </ul>
              </div>
              <div className="card">
                <h3>기능을 줄여야 할 때의 순서</h3>
                <ul>
                  <li>여유가 있을 때만: 게임 안 문지기 목소리, 방마다 다른 효과음</li>
                  <li>끝까지 지킬 것: 방 5개와 정문, 코드 판정, 로그, 퀴즈, 분석 페이지, 배포</li>
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
              <a href="https://www.lakera.ai/blog/gandalf-agent-breaker">Lakera, Gandalf: Agent Breaker</a>.{' '}
              <a href="https://www.lakera.ai/">Lakera</a> (Gandalf 플레이어 100만 명 이상)
            </li>
            <li>
              <a href="https://www.hackerone.com/blog/owasp-top-10-llms-2025-how-genai-risks-are-evolving">OWASP Top 10 for LLM Applications 2025 정리 (HackerOne)</a>
            </li>
            <li>
              <a href="https://www.microsoft.com/en-us/worklab/work-trend-index/ai-at-work-is-here-now-comes-the-hard-part">
                Microsoft·LinkedIn, 2024 Work Trend Index
              </a>
              .{' '}
              <a href="https://www.fm-magazine.com/news/2024/jun/ai-is-coming-but-workforces-feel-unprepared/">FM Magazine의 요약 (66%, 39%)</a>
            </li>
            <li>
              <a href="https://www.insideprivacy.com/artificial-intelligence/european-commission-provides-guidance-on-ai-literacy-requirement-under-the-eu-ai-act/">
                Covington, EU AI법 4조 AI 이해력 의무 안내
              </a>
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
              벤치마킹 수치와 비용 추정의 출처는 <a href="/detail">상세 자료</a> 맨 아래에 기재
            </li>
          </ul>
        </div>
      </footer>
    </>
  )
}
