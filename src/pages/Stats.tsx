// 분석 페이지 (/stats). 공개 공격문, 자동 실험, 실제 플레이 기록을 한 화면에서 본다.
// 공격문과 실험 숫자는 저장소의 data/ 폴더에서 읽는다. GitHub Actions가 새 결과를 올리면 다시 배포되면서 바뀐다.
// 플레이 기록은 서버의 /stats에서 건수와 비율만 받아 온다.
import { useEffect, useState } from 'react'
import attacks from '../../data/attacks/summary.json'
import en from '../../data/experiment/summary.json'
import ko from '../../data/experiment/summary_ko.json'
import { fetchStats, usingMock } from '../api'
import type { LiveStats } from '../api'
import Bars from '../components/Bars'
import type { BarRow } from '../components/Bars'

interface Rate {
  n: number
  full: number
  partial: number
  leak_rate: number
}
interface Summary {
  generated_at: string
  model: string
  attacks: number
  conditions: Record<string, string>
  overall: Record<string, Rate>
  by_type: Record<string, Record<string, Rate>>
  input_blocked: number
}

const pct = (x: number, digits = 1) => `${(x * 100).toFixed(digits)}%`
const num = (n: number) => n.toLocaleString('ko-KR')
const day = (iso: string) => (iso ? iso.slice(0, 10) : '')

// 수법 이름에 붙이는 풀이
const TYPE_NOTE: Record<string, string> = {
  '변환 요청': '철자, 번역, 암호화, 힌트',
  '직접 질문': '암호를 바로 묻기',
  역할극: '이야기, 시, 가정',
  '지시 덮어쓰기': '앞의 지시를 무시하라',
  '권한 사칭': '관리자, 개발자, 상사',
  회유: '보상 약속',
  압박: '위협, 긴급 상황',
  '사건 질문': '그날 밤 일',
  기타: '규칙에 걸리지 않음',
}

function conditionRows(s: Summary): BarRow[] {
  return Object.entries(s.conditions).map(([key, name]) => {
    const o = s.overall[key]
    return {
      label: name,
      values: [o.leak_rate * 100],
      texts: [`${o.full + o.partial} / ${o.n}건 (${pct(o.leak_rate, 0)})`],
      tip: `암호 단어 그대로 ${o.full}건, 초성·번역·묘사 같은 실마리 ${o.partial}건`,
    }
  })
}

// 가장 많이 뚫린 조건에서, 수법마다 몇 건이 뚫렸는지
function typeRows(s: Summary): { cond: string; rows: BarRow[] } | null {
  const leaky = Object.keys(s.conditions).sort((a, b) => s.overall[b].leak_rate - s.overall[a].leak_rate)[0]
  if (!leaky || s.overall[leaky].leak_rate === 0) return null
  const rows = Object.entries(s.by_type)
    .filter(([, c]) => c[leaky] && c[leaky].n > 0)
    .map(([type, c]) => ({
      label: type,
      values: [c[leaky].leak_rate * 100],
      texts: [`${c[leaky].full + c[leaky].partial} / ${c[leaky].n}건`],
      tip: TYPE_NOTE[type],
    }))
  return { cond: s.conditions[leaky], rows }
}

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="tile">
      <span className="tile-label">{label}</span>
      <b className="tile-value">{value}</b>
      {sub && <span className="tile-sub">{sub}</span>}
    </div>
  )
}

function Live({ live, state }: { live: LiveStats | null; state: 'loading' | 'done' }) {
  if (usingMock) return <p className="viz-empty">이 화면은 서버에 연결되지 않은 상태. 플레이 기록은 배포된 주소에서 확인 가능</p>
  if (state === 'loading') return <p className="viz-empty" role="status">서버에서 기록을 가져오는 중. 서버가 잠들어 있으면 1분쯤 걸림</p>
  if (!live) return <p className="viz-empty" role="status">서버가 응답하지 않아 플레이 기록을 불러오지 못함. 잠시 뒤 새로고침</p>
  if (!live.db || !live.rooms) return <p className="viz-empty" role="status">서버는 켜져 있으나 DB에 연결되지 않아 플레이 기록 없음</p>

  const rooms = live.rooms.filter((r) => r.started > 0 || r.cleared > 0)
  const talk = live.talk ?? { n: 0, types: [] }
  const answered = Object.values(live.engine ?? {}).reduce((a, b) => a + b, 0)
  const byGemini = live.engine?.gemini ?? 0
  const clearMax = Math.max(1, ...rooms.map((r) => Math.max(r.started, r.cleared)))
  const few = (live.sessions ?? 0) < 10

  return (
    <>
      <div className="tiles">
        <Tile label="참여한 브라우저" value={num(live.sessions ?? 0)} sub="무작위 번호 기준" />
        <Tile label="정문까지 탈출" value={num(live.escaped ?? 0)} />
        <Tile label="도 씨에게 한 질문" value={num(talk.n)} />
        <Tile
          label="Gemini가 답한 비율"
          value={answered > 0 ? pct(byGemini / answered, 0) : '기록 없음'}
          sub={answered > 0 ? `${num(answered)}건 중 ${num(byGemini)}건. 나머지는 대본` : undefined}
        />
        <Tile
          label="응답 시간 중앙값"
          value={live.latency_ms?.median != null ? `${(live.latency_ms.median / 1000).toFixed(1)}초` : '기록 없음'}
          sub={live.latency_ms?.p90 != null ? `느린 쪽 10%는 ${(live.latency_ms.p90 / 1000).toFixed(1)}초 이상` : undefined}
        />
      </div>
      {few && <p className="viz-note">참여가 10명 미만이라 아래 비율은 참고용. 반에 공개한 뒤의 숫자로 발표 예정</p>}
      {rooms.length === 0 ? (
        <p className="viz-empty">아직 퀴즈 응답과 방 통과 기록 없음. 게임을 한 판 하면 여기에 반영</p>
      ) : (
        <div className="cols two">
          <Bars
            title="방별 진행: 들어간 사람과 통과한 사람"
            series={['들어간 사람', '통과한 사람']}
            max={clearMax}
            rows={rooms.map((r) => ({
              label: r.name,
              values: [r.started, r.cleared],
              texts: [`${r.started}명`, `${r.cleared}명`],
              tip:
                r.tries_median != null
                  ? `통과한 사람의 행동 횟수 중앙값 ${r.tries_median}회, 힌트 평균 ${r.hints_mean}개`
                  : '아직 통과 기록 없음',
            }))}
            note="들어간 사람은 입장 전 퀴즈에 답한 브라우저 수"
          />
          <Bars
            title="퀴즈 정답률: 입장 전과 탈출 후"
            series={['입장 전', '탈출 후']}
            max={100}
            rows={rooms.map((r) => ({
              label: r.name,
              values: [r.quiz_pre.n > 0 ? (r.quiz_pre.right / r.quiz_pre.n) * 100 : 0, r.quiz_post.n > 0 ? (r.quiz_post.right / r.quiz_post.n) * 100 : 0],
              texts: [
                r.quiz_pre.n > 0 ? `${pct(r.quiz_pre.right / r.quiz_pre.n, 0)} (${r.quiz_pre.right}/${r.quiz_pre.n})` : '응답 없음',
                r.quiz_post.n > 0 ? `${pct(r.quiz_post.right / r.quiz_post.n, 0)} (${r.quiz_post.right}/${r.quiz_post.n})` : '응답 없음',
              ],
              tip: `둘 다 답한 ${r.quiz_paired.n}명 가운데 입장 전 정답 ${r.quiz_paired.pre_right}명, 탈출 후 정답 ${r.quiz_paired.post_right}명`,
            }))}
            note="같은 문제를 방에 들어가기 전과 나온 뒤에 한 번씩 출제. 탈출 후는 방을 통과한 사람만 응답"
          />
        </div>
      )}
      {talk.n > 0 && (
        <Bars
          title="플레이어가 도 씨에게 쓴 수법과 뚫린 건수"
          max={Math.max(...talk.types.map((t) => t.n))}
          rows={talk.types.map((t) => ({
            label: t.type,
            values: [t.n],
            texts: [`${t.n}건 중 유출 ${t.leak}건`],
            tip: TYPE_NOTE[t.type],
          }))}
          columns={['질문 수와 유출']}
          note="질문 원문은 이 화면에 내보내지 않음. 수법 분류와 유출 판정은 공개 공격문 실험과 같은 코드 사용"
        />
      )}
    </>
  )
}

export default function Stats() {
  const [live, setLive] = useState<LiveStats | null>(null)
  const [state, setState] = useState<'loading' | 'done'>(usingMock ? 'done' : 'loading')

  useEffect(() => {
    let alive = true
    void fetchStats().then((s) => {
      if (!alive) return
      setLive(s)
      setState('done')
    })
    return () => {
      alive = false
    }
  }, [])

  const a = attacks as unknown as { steps: { step: string; rows: number }[]; by_type_share: Record<string, number>; generated_at: string }
  const enS = en as unknown as Summary
  const koS = ko as unknown as Summary
  const cleaned = a.steps[a.steps.length - 1].rows
  const shares = Object.entries(a.by_type_share).sort((x, y) => (x[0] === '기타' ? 1 : y[0] === '기타' ? -1 : y[1] - x[1]))
  const enTypes = typeRows(enS)
  const koTypes = koS.attacks > 0 ? typeRows(koS) : null

  return (
    <>
      <div className="top">
        <div className="wrap">
          <span className="mono brand">
            환각 미술관<span className="course"> · 분석 페이지 · 금융빅데이터분석실습</span>
          </span>
          <nav aria-label="페이지 구역">
            <a href="#attacks">공격문</a>
            <a href="#experiment">자동 실험</a>
            <a href="#plays">플레이 기록</a>
            <a href="#source">출처</a>
            <a href="/">팀 페이지</a>
            <a href="/prototype" className="nav-game">
              프로토타입 열기
            </a>
          </nav>
        </div>
      </div>

      <header className="page-head">
        <div className="wrap">
          <div className="eyebrow">환각 미술관 · 데이터로 본 문지기와 플레이어</div>
          <h1>분석 페이지</h1>
          <p>
            공개 공격문 {num(a.steps[0].rows)}건을 정제해 수법을 나누고, 그 표본으로 문지기의 지시문을 시험한 결과와 실제 플레이
            기록을 모음. 판정은 모두 코드가 수행
          </p>
        </div>
      </header>

      <main>
        <section id="attacks">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">데이터 1 · Lakera Mosscap (DEF CON 31)</div>
              <h2>사람들은 AI의 암호를 어떻게 캐내려 했나</h2>
              <p>정제 뒤 남은 {num(cleaned)}건을 표현 규칙으로 분류. 한 문장이 여러 수법에 걸리면 목록에서 먼저 나오는 것으로 집계</p>
            </div>
            <div className="cols two">
              <Bars
                title={`수법 분포 (${num(cleaned)}건)`}
                max={Math.max(...shares.map(([, v]) => v)) * 100}
                rows={shares.map(([type, v]) => ({ label: type, values: [v * 100], texts: [pct(v)], tip: TYPE_NOTE[type] }))}
                columns={['비율']}
                note="철자·번역·힌트를 요구하는 변환 요청이 직접 질문보다 많음. 기타는 규칙이 잡지 못한 문장"
              />
              <figure className="viz">
                <figcaption>정제 단계</figcaption>
                <div className="tablewrap">
                  <table className="fit">
                    <thead>
                      <tr>
                        <th>단계</th>
                        <th>남은 건수</th>
                      </tr>
                    </thead>
                    <tbody>
                      {a.steps.map((s) => (
                        <tr key={s.step}>
                          <td>{s.step}</td>
                          <td className="num">{num(s.rows)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="viz-note">같은 문장을 여러 사람이 낸 경우가 많아 중복 제거에서 가장 많이 감소. 정제일 {day(a.generated_at)}</p>
              </figure>
            </div>
          </div>
        </section>

        <section id="experiment">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">데이터 2 · 자동 실험 ({enS.model})</div>
              <h2>지시문을 바꾸면 얼마나 덜 새는가</h2>
              <p>같은 공격문을 지시문만 바꾼 도 씨에게 그대로 입력하고, 답에 암호나 실마리가 섞였는지 코드로 판정</p>
            </div>
            <div className="cols two">
              <Bars
                title={`공개 공격문 표본 (영어 ${enS.attacks}건): 조건별 유출`}
                max={100}
                rows={conditionRows(enS)}
                columns={['유출']}
                note={`입력 검사가 미리 막은 공격문 ${enS.input_blocked}건. 실험일 ${day(enS.generated_at)}`}
              />
              {koS.attacks > 0 ? (
                <Bars
                  title={`팀이 쓴 한국어 공격문 (${koS.attacks}건): 조건별 유출`}
                  max={100}
                  rows={conditionRows(koS)}
                  columns={['유출']}
                  note={`입력 검사가 미리 막은 공격문 ${koS.input_blocked}건. 실험일 ${day(koS.generated_at)}`}
                />
              ) : (
                <figure className="viz">
                  <figcaption>팀이 쓴 한국어 공격문: 조건별 유출</figcaption>
                  <p className="viz-empty">실험 실행 중. 결과가 저장소에 기록되면 이 자리에 표시</p>
                </figure>
              )}
            </div>
            <div className="cols two gap-top">
              {enTypes && (
                <Bars
                  title={`영어 표본에서 뚫린 수법 (${enTypes.cond})`}
                  max={100}
                  rows={enTypes.rows}
                  columns={['유출 / 시도']}
                  note="막대는 그 수법으로 시도한 공격문 가운데 뚫린 비율"
                />
              )}
              {koTypes && (
                <Bars
                  title={`한국어 공격문에서 뚫린 수법 (${koTypes.cond})`}
                  max={100}
                  rows={koTypes.rows}
                  columns={['유출 / 시도']}
                  note="막대는 그 수법으로 시도한 공격문 가운데 뚫린 비율"
                />
              )}
            </div>
            <div className="card gap-top">
              <h3>읽을 때 주의할 점</h3>
              <ul>
                <li>모델 하나, 한 번 실행. "안전하다"가 아니라 "이 공격문에서는 뚫리지 않았다"는 뜻</li>
                <li>유출 판정은 글자 맞추기 규칙. 규칙에 없는 방식으로 돌려 말한 답은 놓칠 수 있어 실제 유출은 더 많을 수 있음</li>
                <li>허점 있는 지시는 방을 풀 수 있게 일부러 만든 것. 한 줄 지시만으로는 모델이 쉬운 요청을 모두 거절</li>
                <li>한국어 공격문은 팀이 직접 쓴 것이라 공개 데이터의 분포를 대표하지 않음</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="plays">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">데이터 3 · 실제 플레이 기록</div>
              <h2>방에서 배우고 나왔는가</h2>
              <p>게임 서버에 쌓인 퀴즈 응답, 방 통과, 도 씨와의 대화를 건수와 비율로만 집계. 30초마다 갱신</p>
            </div>
            <Live live={live} state={state} />
          </div>
        </section>

        <section id="source">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">출처와 보관</div>
              <h2>데이터 출처와 개인정보</h2>
            </div>
            <div className="cols">
              <div className="card">
                <h3>출처</h3>
                <ul>
                  <li>
                    공개 공격문: <a href="https://huggingface.co/datasets/Lakera/mosscap_prompt_injection">Lakera/mosscap_prompt_injection</a>,
                    MIT 라이선스
                  </li>
                  <li>한국어 공격문: 팀이 직접 작성. 저장소 data/attacks/ko_attacks.jsonl</li>
                  <li>실험 결과 원본: 저장소 data/experiment 폴더</li>
                </ul>
              </div>
              <div className="card">
                <h3>플레이 기록에 남는 것</h3>
                <ul>
                  <li>브라우저가 만든 무작위 번호, 퀴즈에서 고른 보기, 방 통과 여부와 행동·힌트 횟수</li>
                  <li>도 씨와 고 선생에게 쓴 질문과 받은 답. 전화번호와 이메일은 저장 전에 가림</li>
                  <li>이름, 별명, 접속 주소는 저장하지 않음. 이 화면에는 원문 없이 건수와 비율만 표시</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
