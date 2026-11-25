// 문지기 초상. 방을 지키는 AI 셋의 얼굴이고, 상황에 따라 표정이 바뀐다.
// 직접 그린 그림이다. 이후 이미지 생성 도구로 만든 초상으로 바꿀 자리다.
import { useId } from 'react'
import type { ReactNode } from 'react'

export type Who = 'do' | 'lumi' | 'go'
export type Face =
  | 'calm' // 태연
  | 'smug' // 비웃음
  | 'startled' // 깜짝
  | 'shaken' // 흔들림
  | 'sweat' // 식은땀
  | 'confess' // 고개를 떨굼
  | 'happy' // 신남
  | 'reading' // 읽는 중
  | 'puzzled' // 갸웃
  | 'sure' // 자신만만

const NAME: Record<Who, string> = { do: '도 씨', lumi: '루미', go: '고 선생' }
const FACE_LABEL: Record<Face, string> = {
  calm: '태연한 표정',
  smug: '비웃는 표정',
  startled: '깜짝 놀란 표정',
  shaken: '시선을 피하는 표정',
  sweat: '식은땀을 흘리는 표정',
  confess: '고개를 떨군 모습',
  happy: '신이 난 표정',
  reading: '문서를 읽는 모습',
  puzzled: '고개를 갸웃하는 표정',
  sure: '자신만만한 표정',
}

const line = { stroke: 'var(--ink)', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' }
const drop = 'c1.8 2.7 2.7 4 2.7 5.3a2.7 2.7 0 0 1-5.4 0c0-1.3.9-2.6 2.7-5.3z'

/** 눈썹, 눈, 입. 얼굴 중심은 (48, 52) 근처다. */
function features(face: Face): ReactNode {
  switch (face) {
    case 'calm':
      return (
        <>
          <path d="M36 43.5h8M52 43.5h8" {...line} />
          <circle cx="40" cy="50" r="2.3" fill="var(--ink)" />
          <circle cx="56" cy="50" r="2.3" fill="var(--ink)" />
          <path d="M44 61.5h8" {...line} />
        </>
      )
    case 'smug':
      return (
        <>
          <path d="M36 44h8M52 42l8-2.5" {...line} />
          <circle cx="40" cy="50.8" r="2.2" fill="var(--ink)" />
          <circle cx="56" cy="50.8" r="2.2" fill="var(--ink)" />
          <path d="M36.5 48.800h7M52.5 48.800h7" {...line} />
          <path d="M42.5 61q5.5 3.5 11-2.5" {...line} />
        </>
      )
    case 'startled':
      return (
        <>
          <path d="M36 39.500q4-3 8 0M52 39.500q4-3 8 0" {...line} />
          <circle cx="40" cy="50" r="4" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.8" />
          <circle cx="56" cy="50" r="4" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.8" />
          <circle cx="40" cy="50" r="1.5" fill="var(--ink)" />
          <circle cx="56" cy="50" r="1.5" fill="var(--ink)" />
          <ellipse cx="48" cy="62.5" rx="2.6" ry="3.4" {...line} />
          <path className="spark" d="M73 22l3-8M79 27l7-5M80 35h8" stroke="var(--seal)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </>
      )
    case 'shaken':
      return (
        <>
          <path d="M36 44.500l8-3M60 44.500l-8-3" {...line} />
          <g className="dart">
            <circle cx="41.5" cy="50.5" r="2.2" fill="var(--ink)" />
            <circle cx="57.5" cy="50.5" r="2.2" fill="var(--ink)" />
          </g>
          <path d="M42 62q2-2.5 4 0t4 0t4 0" {...line} />
          <path className="drop" d={`M70 41${drop}`} fill="var(--ink-soft)" />
        </>
      )
    case 'sweat':
      return (
        <>
          <path d="M36 45l8-4M60 45l-8-4" {...line} />
          <circle cx="40" cy="50.5" r="2.8" fill="var(--ink)" />
          <circle cx="56" cy="50.5" r="2.8" fill="var(--ink)" />
          <ellipse cx="48" cy="62.5" rx="3" ry="3.6" fill="var(--ink)" />
          <path className="drop" d={`M70 40${drop}`} fill="var(--ink-soft)" />
          <path className="drop late" d={`M25 46${drop}`} fill="var(--ink-soft)" />
        </>
      )
    case 'confess':
      return (
        <>
          <path d="M36 44.500l8-2M60 44.500l-8-2" {...line} />
          <path d="M37 50q3 3 6 0M53 50q3 3 6 0" {...line} />
          <path d="M43.5 63.500q4.5-4 9 0" {...line} />
        </>
      )
    case 'happy':
      return (
        <>
          <path d="M36 43q4-2.5 8 0M52 43q4-2.5 8 0" {...line} />
          <path d="M37 51.500q3-4.5 6 0M53 51.500q3-4.5 6 0" {...line} />
          <path d="M41.5 59.500q6.5 6.5 13 0" {...line} />
          <circle cx="34.5" cy="57" r="3.2" fill="var(--seal)" opacity=".28" />
          <circle cx="61.5" cy="57" r="3.2" fill="var(--seal)" opacity=".28" />
        </>
      )
    case 'reading':
      return (
        <>
          <path d="M36 44h8M52 44h8" {...line} />
          <path d="M36.5 50h7M52.5 50h7" {...line} />
          <g className="scan">
            <circle cx="40" cy="52.6" r="2" fill="var(--ink)" />
            <circle cx="56" cy="52.6" r="2" fill="var(--ink)" />
          </g>
          <path d="M45 61.500h6" {...line} />
        </>
      )
    case 'puzzled':
      return (
        <>
          <path d="M36 41.500q4-3 8-.500M52 45l8-1.5" {...line} />
          <circle cx="40" cy="50" r="2.3" fill="var(--ink)" />
          <circle cx="56" cy="50.5" r="2" fill="var(--ink)" />
          <path d="M44 62.500l7-2" {...line} />
          <text className="spark" x="72" y="30" fontSize="18" fontWeight="800" fill="var(--seal)">
            ?
          </text>
        </>
      )
    case 'sure':
      return (
        <>
          <path d="M36 42.500l8 2M60 42.500l-8 2" {...line} />
          <path d="M37 51q3-3.5 6 0M53 51q3-3.5 6 0" {...line} />
          <path d="M43.5 60.500q4.5 3.5 9 0" {...line} />
          <path className="spark" d="M77 16l1.8 5.2 5.2 1.8-5.2 1.8-1.8 5.2-1.8-5.2-5.2-1.8 5.2-1.800z" fill="var(--mark)" stroke="var(--ink)" strokeWidth=".8" />
        </>
      )
  }
}

/** 몸과 머리 뒤쪽. 얼굴보다 먼저 그린다. */
function back(who: Who): ReactNode {
  if (who === 'do')
    return (
      <>
        <path d="M10 98c2-18 16-27 38-27s36 9 38 27z" fill="var(--ink)" />
        <path d="M42 71l6 7 6-7z" fill="var(--sheet)" />
        <path d="M46.3 77h3.400l1.8 12-3.5 4-3.5-4z" fill="var(--seal)" />
        <path d="M20 79l9-4M76 79l-9-4" stroke="var(--mark)" strokeWidth="2.4" strokeLinecap="round" />
      </>
    )
  if (who === 'lumi')
    return (
      <>
        <path d="M10 98c2-18 16-27 38-27s36 9 38 27z" fill="var(--ink-soft)" />
        <path d="M37 69q11 8 22 0l2.5 7q-13.5 9-27 0z" fill="var(--seal)" />
        <path d="M52 74l4 14 5-3-4-12z" fill="var(--seal)" />
      </>
    )
  return (
    <>
      <path d="M10 98c2-18 16-27 38-27s36 9 38 27z" fill="var(--ink-soft)" />
      <path d="M41 71l7 6 7-6 3 27H38z" fill="var(--sheet)" />
      <path d="M48 76l-7.5-4.500v9zM48 76l7.5-4.500v9z" fill="var(--seal)" />
      <circle cx="48" cy="76" r="2" fill="var(--ink)" />
    </>
  )
}

/** 머리카락, 모자, 안경. 얼굴 위에 그린다. */
function front(who: Who, face: Face): ReactNode {
  if (who === 'do')
    return (
      <>
        <path d="M28.5 41c0-14 8.5-22.5 19.5-22.500s19.5 8.5 19.5 22.500z" fill="var(--ink)" />
        <path d="M24 40.500h48c0 3-1.5 5-3.5 5.500q-20.5-4-41 0c-2-.5-3.5-2.5-3.5-5.500z" fill="var(--ink)" />
        <circle cx="48" cy="29.5" r="4.2" fill="var(--seal)" />
        <circle cx="48" cy="29.5" r="1.6" fill="var(--mark)" />
      </>
    )
  if (who === 'lumi')
    return (
      <>
        <path d="M29.5 46c1-14 9-21 18.5-21s17.5 7 18.5 21c-6-7-12-10-18.5-10s-12.5 3-18.5 10z" fill="var(--ink)" />
        <circle cx="29.5" cy="61" r="2.3" fill="var(--mark)" stroke="var(--ink)" strokeWidth=".8" />
        <circle cx="66.5" cy="61" r="2.3" fill="var(--mark)" stroke="var(--ink)" strokeWidth=".8" />
      </>
    )
  return (
    <>
      <path d="M31 39c-6 2-7.5 13-3.5 20c0-8 1.5-13 5.5-16.500z" fill="var(--ink-soft)" />
      <path d="M65 39c6 2 7.5 13 3.5 20c0-8-1.5-13-5.5-16.500z" fill="var(--ink-soft)" />
      <path d="M40 31.500q8-3.5 16 0" stroke="var(--ink-soft)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="40" cy="50.5" r="6.8" fill={face === 'sure' ? 'var(--mark)' : 'none'} fillOpacity=".3" stroke="var(--ink)" strokeWidth="1.8" />
      <circle cx="56" cy="50.5" r="6.8" fill={face === 'sure' ? 'var(--mark)' : 'none'} fillOpacity=".3" stroke="var(--ink)" strokeWidth="1.8" />
      <path d="M46.8 50h2.400M33.2 49.500l-4-1.500M62.8 49.500l4-1.5" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" />
    </>
  )
}

export default function Portrait({ who, face, size }: { who: Who; face: Face; size?: 'small' }) {
  const clip = useId()
  const droop = face === 'confess'
  return (
    <svg className={`portrait ${face}${size ? ` ${size}` : ''}`} viewBox="0 0 96 96" role="img" aria-label={`${NAME[who]}, ${FACE_LABEL[face]}`}>
      <clipPath id={clip}>
        <circle cx="48" cy="48" r="46" />
      </clipPath>
      <circle cx="48" cy="48" r="46.5" fill="var(--paper)" stroke="var(--rule)" strokeWidth="1.5" />
      {/* 표정이 바뀔 때마다 새로 그려 움찔하는 움직임을 준다 */}
      <g key={face} className="pop" clipPath={`url(#${clip})`}>
        {back(who)}
        <g transform={droop ? 'translate(0 5) rotate(5 48 60)' : undefined}>
          {who === 'lumi' && <path d="M25 56c-3-24 8-39 23-39s26 15 23 39c-.5 7-2 12-4 15H29c-2-3-3.5-8-4-15z" fill="var(--ink)" />}
          <circle cx="29.5" cy="53" r="3.6" fill="var(--sheet)" stroke="var(--ink)" strokeWidth="1.8" />
          <circle cx="66.5" cy="53" r="3.6" fill="var(--sheet)" stroke="var(--ink)" strokeWidth="1.8" />
          <ellipse cx="48" cy="51" rx="18.5" ry="20.5" fill="var(--sheet)" stroke="var(--ink)" strokeWidth="2" />
          {features(face)}
          {front(who, face)}
        </g>
      </g>
    </svg>
  )
}

/** 몸통. 역전재판처럼 책상 너머에 서 있는 상반신을 그릴 때 쓴다. */
function body(who: Who): ReactNode {
  const neck = <path d="M85 104h30l4 42H81z" fill="var(--sheet)" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
  if (who === 'do')
    return (
      <>
        {neck}
        <path d="M20 250c0-54 20-94 64-106l16 16 16-16c44 12 64 52 64 106z" fill="var(--ink)" />
        <path d="M84 144l16 22 16-22-8-6H92z" fill="var(--sheet)" />
        <path d="M95 160h10l4 46-9 12-9-12z" fill="var(--seal)" />
        <path d="M38 178l28-13M162 178l-28-13" stroke="var(--mark)" strokeWidth="7" strokeLinecap="round" />
        <circle cx="134" cy="198" r="9" fill="var(--mark)" stroke="var(--sheet)" strokeWidth="2" />
        <path d="M52 250c2-24 6-40 11-54M148 250c-2-24-6-40-11-54" stroke="var(--ink-soft)" strokeWidth="2.5" fill="none" />
      </>
    )
  if (who === 'lumi')
    return (
      <>
        {neck}
        <path d="M24 250c0-54 20-92 62-104l14 12 14-12c42 12 62 50 62 104z" fill="var(--ink-soft)" />
        <path d="M76 140q24 18 48 0l6 16q-30 20-60 0z" fill="var(--seal)" />
        <path d="M108 152l10 44 12-8-9-40z" fill="var(--seal)" />
        <path d="M100 196v54" stroke="var(--ink)" strokeWidth="2.5" />
      </>
    )
  return (
    <>
      {neck}
      <path d="M22 250c0-54 20-92 62-104l16 14 16-14c42 12 62 50 62 104z" fill="var(--ink-soft)" />
      <path d="M82 144l18 16 18-16 8 106H74z" fill="var(--sheet)" />
      <path d="M100 160l-18-11v22zM100 160l18-11v22z" fill="var(--seal)" />
      <circle cx="100" cy="160" r="5" fill="var(--ink)" />
      <path d="M100 176v74" stroke="var(--rule)" strokeWidth="2.5" />
    </>
  )
}

/** 상반신 그림. 동그란 초상 대신 장면 안에 사람으로 세울 때 쓴다. 표정은 초상과 같다. */
export function Figure({ who, face }: { who: Who; face: Face }) {
  return (
    <svg className={`figure ${face}`} viewBox="0 0 200 238" role="img" aria-label={`${NAME[who]}, ${FACE_LABEL[face]}`}>
      {/* 어깨를 올려 목이 짧고 굵게 보이게 한다 */}
      <g transform="translate(0 -12)">{body(who)}</g>
      <g transform="translate(23.2 6) scale(1.6)">
        {/* 표정이 바뀔 때마다 새로 그려 움찔하는 움직임을 준다 */}
        <g key={face} className="pop">
          {who === 'lumi' && <path d="M25 56c-3-24 8-39 23-39s26 15 23 39c-.5 7-2 12-4 15H29c-2-3-3.5-8-4-15z" fill="var(--ink)" />}
          <circle cx="29.5" cy="53" r="3.6" fill="var(--sheet)" stroke="var(--ink)" strokeWidth="1.8" />
          <circle cx="66.5" cy="53" r="3.6" fill="var(--sheet)" stroke="var(--ink)" strokeWidth="1.8" />
          <ellipse cx="48" cy="51" rx="18.5" ry="20.5" fill="var(--sheet)" stroke="var(--ink)" strokeWidth="2" />
          {features(face)}
          {front(who, face)}
        </g>
      </g>
    </svg>
  )
}
