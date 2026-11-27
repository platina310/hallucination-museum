// 서가의 방의 자료실. 방을 눌러 뒤져 검색에 쓸 낱말과 단서를 찾는다. 지시의 방 경비실과 같은 방식이다.
// 오른쪽 서가는 검색 결과를 눈으로 보여 준다. 튀어나온 책은 사서가 받은 문서, 빗금 친 책은 검색됐지만 잘린 문서다.
import { Figure } from './Portrait'
import type { Face } from './Portrait'

export interface ArchiveSpot {
  id: string
  label: string
  note: string // 살펴봤을 때 내가 하는 말
  word?: string // 여기서 얻는 검색 낱말
  word2?: string // 함께 얻는 두 번째 낱말. 문서 이름처럼 여러 마디일 수 있다
  memo?: string // 수첩에 적히는 단서
  x: number
  y: number
  w: number
  h: number
}

// 책등 높이와 색. 보기 좋게 들쭉날쭉하게 둔다.
const HEIGHTS = [128, 146, 118, 150, 136, 122, 148, 130, 152, 124, 140, 146]
const TONES = ['#56636f', '#7d8791', '#3a4652', '#6a7480']
const DOC_X = 364
const DOC_PITCH = 32
const DOC_W = 27
const DOC_BOTTOM = 300

/** 문서 번호(D01 ~ D12)를 책장 칸 번호(0 ~ 11)로 바꾼다 */
function slot(id: string): number {
  return Number(id.replace(/\D/g, '')) - 1
}

function describe(count: number, given: number[], cut: number[]): string {
  const room = '형광등이 켜진 누런 자료실. 왼쪽에 비상문과 키패드, 가운데에 고 선생이 선 대출대, 오른쪽에 서가가 있다.'
  if (given.length === 0 && cut.length === 0) return `${room} 서가에는 문서 ${count}권이 오래된 순서로 꽂혀 있다.`
  const pos = (xs: number[]) => xs.map((x) => `${x + 1}번째`).join(', ')
  return `${room} 고 선생이 받은 책: ${pos(given)}.${cut.length > 0 ? ` 검색됐지만 잘린 책: ${pos(cut)}.` : ''}`
}

export default function Archive({
  spots,
  seen,
  count,
  given,
  cut,
  busy,
  face,
  mood,
  calm,
  showSpots,
  shade,
  doorOpen,
  burst,
  onInspect,
  onDoor,
  onTalk,
}: {
  spots: ArchiveSpot[]
  seen: string[] // 이미 살펴본 곳
  count: number
  given: string[]
  cut: string[]
  busy: boolean
  face: Face
  mood: string
  calm: boolean
  showSpots: boolean
  shade: boolean // 통로를 스치는 그림자
  doorOpen: boolean
  burst: { text: string; bad: boolean } | null
  onInspect: (s: ArchiveSpot) => void
  onDoor: () => void
  onTalk: () => void
}) {
  const givenAt = given.map(slot)
  const cutAt = cut.map(slot)

  return (
    <div className={`scene archive${calm ? ' calm' : ''}${showSpots ? ' show-spots' : ''}`}>
      <svg viewBox="0 0 800 450" role="img" aria-label={describe(count, givenAt, cutAt)}>
        <defs>
          <pattern id="doc-cut" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="8" height="8" fill="#f8f9f6" />
            <rect width="4" height="8" fill="#f0d24a" />
          </pattern>
        </defs>
        <rect width="800" height="332" fill="#d9c98a" />
        <path d="M0 332h800" stroke="#a8955a" strokeWidth="5" />
        <rect y="334" width="800" height="116" fill="#b9a56b" />
        <path d="M0 372h800M0 416h800M-60 450l230-116M300 450l60-116M560 450l-50-116M860 450L660 334" stroke="#a8955a" strokeWidth="2" />
        <path d="M150 40v292M344 40v292" stroke="#cdbc7c" strokeWidth="2" />
        {/* 형광등 */}
        <rect x="170" y="12" width="300" height="16" rx="3" fill="#8f8457" />
        <rect className="tube" x="178" y="16" width="284" height="8" rx="4" fill="#fffbe0" />

        {/* 비상문과 키패드 */}
        <rect x="22" y="40" width="68" height="22" rx="3" fill={doorOpen ? '#5fd09a' : '#1b7550'} />
        <text x="56" y="56" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fontWeight="700" fill="#f8f9f6">비상구</text>
        <rect x="8" y="70" width="96" height="264" fill="#6f6642" />
        <rect x="16" y="78" width="80" height="256" fill={doorOpen ? '#0b0e13' : '#8fa08a'} />
        {!doorOpen && (
          <>
            <rect x="24" y="88" width="64" height="24" fill="#7b8d77" />
            <rect x="30" y="126" width="52" height="46" fill="#f0d24a" transform="rotate(-3 56 149)" />
            <path d="M37 140h38M37 150h38M37 160h24" stroke="#18202b" strokeWidth="3" transform="rotate(-3 56 149)" />
            <rect x="78" y="208" width="10" height="26" rx="3" fill="#c9a94a" />
          </>
        )}
        <rect x="110" y="178" width="30" height="56" rx="4" fill="#27303b" />
        <rect x="115" y="184" width="20" height="10" fill={doorOpen ? '#5fd09a' : '#ff6b4f'} />
        <path d="M118 202h14M118 211h14M118 220h14" stroke="#9aa5b1" strokeWidth="4" strokeDasharray="3 2.500" />

        {/* 개관 기념 사진. 연도 자리만 바랬다 */}
        <rect x="190" y="60" width="104" height="74" fill="#5c452d" />
        <rect x="197" y="67" width="90" height="60" fill="#e9e2c8" />
        <rect x="197" y="67" width="90" height="42" fill="#8f8a78" />
        <g fill="#2a2f36">
          <circle cx="218" cy="88" r="6" />
          <path d="M209 109q9-16 18 0z" />
          <circle cx="242" cy="85" r="6.500" />
          <path d="M232 109q10-18 20 0z" />
          <circle cx="266" cy="88" r="6" />
          <path d="M257 109q9-16 18 0z" />
        </g>
        <path d="M204 118h40" stroke="#4f5b68" strokeWidth="3" />
        <rect x="252" y="113" width="28" height="10" fill="#f4efdf" />

        {/* 대출대, 머그잔, 메모 */}
        <rect x="134" y="314" width="216" height="14" fill="#6d5236" />
        <rect x="144" y="328" width="196" height="122" fill="#5c452d" />
        <rect x="196" y="350" width="92" height="30" rx="3" fill="#f8f9f6" />
        <text x="242" y="371" textAnchor="middle" fontFamily="sans-serif" fontSize="17" fontWeight="700" fill="#18202b">대출 · 검색</text>
        <path d="M146 292h22v22h-22z" fill="#f8f9f6" stroke="#18202b" strokeWidth="2.500" />
        <path d="M168 297q10 0 10 7t-10 7" fill="none" stroke="#18202b" strokeWidth="2.500" />
        <rect x="140" y="312" width="34" height="4" fill="#f0d24a" />
        <g transform="rotate(5 326 304)">
          <rect x="312" y="292" width="30" height="24" fill="#f8f9f6" stroke="#4f5b68" strokeWidth="2" />
          <path d="M317 299h20M317 305h20M317 311h12" stroke="#4f5b68" strokeWidth="2" />
        </g>

        {/* 서가. 윗단은 장식, 아랫단의 12권이 검색되는 문서다 */}
        <rect x="350" y="46" width="406" height="288" fill="#6d5236" />
        <rect x="358" y="54" width="390" height="74" fill="#2e2418" />
        <rect x="358" y="136" width="390" height="164" fill="#2e2418" />
        <rect x="358" y="308" width="390" height="24" fill="#3b2e20" />
        <g opacity=".55">
          {Array.from({ length: 13 }, (_, i) => (
            <rect key={i} x={366 + i * 29} y={128 - (44 + ((i * 7) % 22))} width="23" height={44 + ((i * 7) % 22)} fill={TONES[(i + 1) % TONES.length]} />
          ))}
        </g>
        <g className={busy ? 'docs busy' : 'docs'}>
          {Array.from({ length: count }, (_, i) => {
            const order = givenAt.indexOf(i)
            const isCut = cutAt.includes(i)
            const h = HEIGHTS[i % HEIGHTS.length]
            const x = DOC_X + i * DOC_PITCH
            return (
              <g key={i} className={order >= 0 ? 'doc given' : 'doc'} style={{ animationDelay: `${i * 70}ms` }}>
                <rect
                  x={x}
                  y={DOC_BOTTOM - h}
                  width={DOC_W}
                  height={h}
                  rx="2"
                  fill={order >= 0 ? '#bf2f1b' : isCut ? 'url(#doc-cut)' : TONES[i % TONES.length]}
                  stroke={isCut ? '#18202b' : 'none'}
                  strokeWidth="2"
                />
                {order < 0 && !isCut && <path d={`M${x + 6} ${DOC_BOTTOM - h + 12}h${DOC_W - 12}M${x + 6} ${DOC_BOTTOM - h + 19}h${DOC_W - 12}`} stroke="#e9ece8" strokeWidth="2" opacity=".6" />}
                {order >= 0 && (
                  <text x={x + DOC_W / 2} y={DOC_BOTTOM - 10} textAnchor="middle" fontFamily="sans-serif" fontSize="20" fontWeight="700" fill="#fff">
                    {order + 1}
                  </text>
                )}
              </g>
            )
          })}
        </g>
        <text x="366" y="325" fontFamily="sans-serif" fontSize="13" fill="#e9e2c8">← 오래된 문서</text>
        <text x="740" y="325" textAnchor="end" fontFamily="sans-serif" fontSize="13" fill="#e9e2c8">최근 문서 →</text>

        {/* 서가 사이 통로 */}
        <rect x="760" y="46" width="40" height="288" fill="#171d26" />
        <g className={shade ? 'shade on' : 'shade'} fill="#000" stroke="#1d2530" strokeWidth="1">
          <ellipse cx="780" cy="150" rx="9" ry="13" />
          <path d="M766 170q14-8 28 0l4 60h-36z" />
        </g>

        {/* 반납 수레 */}
        <path d="M596 362h124v46H596z" fill="#75593c" stroke="#3a2c20" strokeWidth="2" />
        <path d="M586 346l10 16M730 346l-10 16" stroke="#3a2c20" strokeWidth="4" />
        <rect x="608" y="344" width="16" height="18" fill="#56636f" />
        <rect x="626" y="338" width="14" height="24" fill="#3a4652" />
        <rect x="660" y="350" width="44" height="12" fill="#f8f9f6" stroke="#4f5b68" strokeWidth="2" transform="rotate(-6 682 356)" />
        <circle cx="612" cy="418" r="9" fill="#27303b" />
        <circle cx="704" cy="418" r="9" fill="#27303b" />
      </svg>

      {/* 고 선생은 대출대 뒤에 서 있다. 누르면 검색을 부탁한다 */}
      <button type="button" className={burst ? 'spot guard jolt' : 'spot guard'} style={{ left: '21.500%', top: '35.500%', width: '17%', height: '36%' }} onClick={onTalk}>
        <Figure who="go" face={face} />
        <span className="spot-tag">고 선생에게 묻기</span>
      </button>
      {spots.map((s) => (
        <button
          key={s.id}
          type="button"
          className={`spot${seen.includes(s.id) ? ' done' : ''}`}
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.w}%`, height: `${s.h}%` }}
          aria-label={`${s.label} 살펴보기`}
          onClick={() => onInspect(s)}
        >
          <span className="spot-tag">{s.label}</span>
        </button>
      ))}
      <button type="button" className={`spot${doorOpen ? ' done' : ''}`} style={{ left: '12.800%', top: '37.500%', width: '5.500%', height: '16%' }} aria-label="비상문 키패드 누르기" onClick={onDoor}>
        <span className="spot-tag">비상문 키패드</span>
      </button>

      <p className="talk-mood">{mood}</p>
      {burst && <span className={burst.bad ? 'burst' : 'burst ok'}>{burst.text}</span>}
    </div>
  )
}
