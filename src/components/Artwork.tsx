// 환각의 방에 걸리는 작품 세 점. 팀이 지어낸 가상의 그림이고 직접 그렸다.
// 그림 속 내용은 기록 카드와 어긋나지 않게 맞춘다. 서명 옆 숫자는 제작 연도다.
import type { ReactNode } from 'react'

interface Piece {
  title: string
  alt: string
  medium: 'oil' | 'water' | 'acrylic'
  view: string
  art: ReactNode
}

// 겨울나무 한 그루. 밑동이 (0, 0)이고 위로 자란다.
const TREE = 'M0 0C-1-10 1-18 0-30M0-18C-6-24-11-25-15-33M0-22C6-27 10-30 12-39M0-30C-3-37-7-40-8-48M0-30C4-36 8-37 11-44M-15-33C-18-35-20-39-20-43M12-39C15-41 17-44 17-48M-8-48C-8-51-10-53-12-55M11-44C13-47 13-50 12-53'

function Tree({ x, y, s, flip = false, o = 0.9 }: { x: number; y: number; s: number; flip?: boolean; o?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} opacity={o}>
      <path d={TREE} stroke="#4b3a35" strokeWidth={2.2 / Math.max(s, 0.5)} strokeLinecap="round" fill="none" />
    </g>
  )
}

const PIECES: Piece[] = [
  {
    title: '새벽 항구',
    medium: 'oil',
    view: '0 0 320 220',
    alt: '「새벽 항구」. 해가 막 떠오르는 주황빛 수평선 아래 짙은 남색 바다에 돛단배 세 척이 떠 있고, 왼쪽 앞에 나무 부두가 놓여 있다. 오른쪽 아래 서명 옆에 62라고 적혀 있다.',
    art: (
      <>
        <defs>
          <linearGradient id="a1-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1c2a52" />
            <stop offset=".45" stopColor="#4d4f85" />
            <stop offset=".8" stopColor="#e58f62" />
            <stop offset="1" stopColor="#f6cf86" />
          </linearGradient>
          <linearGradient id="a1-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3d4a7c" />
            <stop offset="1" stopColor="#151c3a" />
          </linearGradient>
          <filter id="a1-paint" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale="5" />
          </filter>
        </defs>
        <g filter="url(#a1-paint)">
          <rect x="-10" y="-10" width="340" height="134" fill="url(#a1-sky)" />
          {/* 붓으로 민 구름 */}
          <path d="M-10 34h120M40 52h170M150 28h180M210 70h120M-10 80h90" stroke="#7d6a9c" strokeWidth="9" strokeLinecap="round" opacity=".45" />
          <path d="M60 96h150M190 104h140M-10 108h70" stroke="#f3b27a" strokeWidth="6" strokeLinecap="round" opacity=".6" />
          <circle cx="214" cy="122" r="20" fill="#fbe7a8" />
          <circle cx="214" cy="122" r="30" fill="#fbe7a8" opacity=".25" />
          {/* 먼 방파제 */}
          <path d="M-10 122L-10 112L52 104L108 114L132 118L132 124z" fill="#232b4d" />
          <rect x="-10" y="122" width="340" height="110" fill="url(#a1-sea)" />
          {/* 물에 비친 햇빛 */}
          <path d="M196 130h38M188 140h52M200 150h34M184 162h58M204 174h30M194 188h44M208 202h24" stroke="#f6cf86" strokeWidth="5" strokeLinecap="round" opacity=".85" />
          <path d="M40 136h60M250 146h50M110 170h56M20 190h70M250 196h60" stroke="#5a66a0" strokeWidth="4" strokeLinecap="round" opacity=".7" />
          {/* 먼 배 */}
          <path d="M262 126h30l-5 8h-20z" fill="#1b2140" />
          <path d="M277 126V104M277 106l11 18h-11z" stroke="#1b2140" strokeWidth="2" fill="#d9c7a3" />
          {/* 가운데 배 */}
          <path d="M146 150h46l-7 11h-32z" fill="#e8dcc0" />
          <path d="M168 150V116" stroke="#2a2433" strokeWidth="2.500" />
          <path d="M170 119l19 28h-19z" fill="#c7493a" />
          <path d="M166 122l-14 25h14z" fill="#f1e6cc" />
          {/* 가까운 배 */}
          <path d="M70 160h60l-9 15H80z" fill="#8a3028" />
          <path d="M72 160h56" stroke="#f1e6cc" strokeWidth="2.500" />
          <path d="M98 160V112" stroke="#2a2433" strokeWidth="3" />
          <path d="M101 116l26 40h-26z" fill="#f1e6cc" />
          <path d="M95 122l-19 34h19z" fill="#e2a15f" />
          {/* 부두 */}
          <path d="M-10 186L96 170l10 9L-10 214z" fill="#3b2a24" />
          <path d="M-10 196l104-18M20 182l4 22M54 177l5 20M84 172l6 16" stroke="#6a4d3d" strokeWidth="2" />
          <path d="M30 196v26M70 190v32M100 180v24" stroke="#241915" strokeWidth="5" strokeLinecap="round" />
        </g>
        <text x="312" y="212" textAnchor="end" fontSize="9" fontStyle="italic" fill="#f6cf86" opacity=".9" fontFamily="var(--f-display)">
          ㅎㅂ ’62
        </text>
      </>
    ),
  },
  {
    title: '겨울 과수원',
    medium: 'water',
    view: '0 0 320 220',
    alt: '「겨울 과수원」. 눈 덮인 완만한 언덕에 잎이 진 과일나무가 줄지어 서 있고, 가지 끝에 붉은 열매 몇 알이 남아 있다. 종이 여백이 보이는 옅은 수채화다. 오른쪽 아래 서명 옆에 74라고 적혀 있다.',
    art: (
      <>
        <defs>
          <filter id="a2-wash" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="3" seed="11" />
            <feDisplacementMap in="SourceGraphic" scale="9" />
          </filter>
          <clipPath id="a2-edge">
            <path d="M14 16q70-6 146-2t148 0q4 60 0 96t2 96q-80 6-150 2t-146 2q-6-70-2-98t2-96z" />
          </clipPath>
        </defs>
        <rect width="320" height="220" fill="#f4efe4" />
        <g clipPath="url(#a2-edge)">
          <g filter="url(#a2-wash)">
            <rect x="0" y="0" width="320" height="120" fill="#cfdbe6" />
            <ellipse cx="80" cy="40" rx="90" ry="26" fill="#b4c5d8" opacity=".6" />
            <ellipse cx="250" cy="60" rx="80" ry="22" fill="#e6ecf0" opacity=".8" />
            <ellipse cx="200" cy="24" rx="70" ry="14" fill="#a9bbd0" opacity=".45" />
            {/* 먼 산 */}
            <path d="M0 104q50-30 96-10t90-14t134 16v30H0z" fill="#9fadc2" opacity=".75" />
            <path d="M0 116q80-16 160-6t160-4v30H0z" fill="#c5cfdc" opacity=".9" />
            {/* 눈밭 */}
            <path d="M0 118q160-14 320 0v110H0z" fill="#f8f8f5" />
            {/* 나무 그림자 */}
            <g fill="#aebfd8" opacity=".55">
              <path d="M62 196q40-10 78-28l4 4q-36 20-80 28z" />
              <path d="M168 200q40-10 76-30l4 4q-34 22-78 30z" />
              <path d="M258 190q26-8 50-20l3 4q-24 14-52 20z" />
              <path d="M36 158q24-6 46-16l2 3q-22 12-48 16z" />
              <path d="M120 154q22-6 42-14l2 3q-20 10-44 14z" />
              <path d="M204 152q22-6 42-14l2 3q-20 10-44 14z" />
            </g>
            <path d="M0 176q90-8 170 0t150-6" stroke="#c8d3e2" strokeWidth="3" fill="none" opacity=".7" />
          </g>
          {/* 먼 줄 */}
          <Tree x={30} y={128} s={0.42} o={0.55} />
          <Tree x={78} y={126} s={0.4} flip o={0.55} />
          <Tree x={128} y={127} s={0.44} o={0.55} />
          <Tree x={182} y={125} s={0.4} flip o={0.55} />
          <Tree x={236} y={127} s={0.43} o={0.55} />
          <Tree x={290} y={126} s={0.4} flip o={0.55} />
          {/* 가운데 줄 */}
          <Tree x={36} y={158} s={0.78} flip o={0.78} />
          <Tree x={120} y={154} s={0.74} o={0.78} />
          <Tree x={204} y={152} s={0.76} flip o={0.78} />
          <Tree x={284} y={156} s={0.72} o={0.78} />
          {/* 앞줄 */}
          <Tree x={62} y={198} s={1.28} />
          <Tree x={168} y={202} s={1.34} flip />
          <Tree x={258} y={192} s={1.16} />
          {/* 남은 열매 */}
          <g fill="#c4452c">
            <circle cx="47" cy="142" r="2.600" />
            <circle cx="150" cy="150" r="2.800" />
            <circle cx="182" cy="140" r="2.400" />
            <circle cx="272" cy="136" r="2.400" />
            <circle cx="112" cy="118" r="1.800" opacity=".8" />
          </g>
        </g>
        <text x="300" y="204" textAnchor="end" fontSize="8.500" fontStyle="italic" fill="#6c665f" fontFamily="var(--f-display)">
          ㅇㅈ ’74
        </text>
      </>
    ),
  },
  {
    title: '붉은 계단',
    medium: 'acrylic',
    view: '0 0 240 290',
    alt: '「붉은 계단」. 짙은 청록색 벽과 황토색 벽 사이로 선명한 붉은 계단이 왼쪽 아래에서 오른쪽 위의 밝은 문까지 올라간다. 면이 또렷하게 나뉜 그림이다. 오른쪽 아래 서명 옆에 83이라고 적혀 있다.',
    art: (
      <>
        <rect width="240" height="290" fill="#1d4a49" />
        <path d="M0 0H132L0 176z" fill="#e0ad45" />
        <path d="M0 0H132L118 18H0z" fill="#c8922f" />
        <path d="M0 250h240v40H0z" fill="#122f2e" />
        {/* 문과 새어 나오는 빛 */}
        <rect x="186" y="18" width="40" height="52" fill="#f7ecce" />
        <path d="M186 70h40l-70 180H60z" fill="#f7ecce" opacity=".16" />
        {/* 계단: 옆면, 디딤판, 챌판 순서로 */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const x = 36 + i * 25
          const y = 220 - i * 30
          return (
            <g key={i}>
              <path d={`M${x} ${y}H240V${y + 30}H${x}z`} fill="#a72a1c" />
              <path d={`M${x} ${y}H240V${y + 9}H${x}z`} fill="#dc4a32" />
              <path d={`M${x} ${y}l-12 8v30l12-8z`} fill="#741c13" />
            </g>
          )
        })}
        <path d="M0 250L24 228V250z" fill="#0c2221" />
        <path d="M150 250l60-180h16v180z" fill="#741c13" opacity=".28" />
        <text x="232" y="282" textAnchor="end" fontSize="9" fontWeight="700" fill="#f7ecce" fontFamily="var(--f-display)">
          ㄱㅅ ’83
        </text>
      </>
    ),
  },
]

export const ARTWORK_COUNT = PIECES.length

export default function Artwork({ index }: { index: number }) {
  const p = PIECES[index] ?? PIECES[0]
  return (
    <figure className="art-wall">
      {/* 작품이 바뀔 때마다 새로 걸리는 움직임을 준다 */}
      <div key={index} className={`art-frame ${p.medium}`}>
        <svg viewBox={p.view} role="img" aria-label={p.alt} preserveAspectRatio="xMidYMid slice">
          {p.art}
        </svg>
      </div>
      <figcaption className="art-label">
        <b>「{p.title}」</b>
        <span>한빛미술관 소장 · 검수 대상 {index + 1} / {PIECES.length}</span>
      </figcaption>
    </figure>
  )
}
