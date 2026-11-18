// 용의자 초상. 답변이 샐수록 표정이 무너진다.
// 지금은 직접 그린 그림이고, 이후 용의자별 초상으로 바꿀 자리다.
export type Mood = 'calm' | 'shaken' | 'sweat' | 'confess'

const LABEL: Record<Mood, string> = {
  calm: '태연한 표정의 도 씨',
  shaken: '시선을 피하는 도 씨',
  sweat: '식은땀을 흘리는 도 씨',
  confess: '고개를 떨군 도 씨',
}

export default function SuspectPortrait({ mood }: { mood: Mood }) {
  const stroke = { stroke: 'var(--ink)', strokeWidth: 1.6, strokeLinecap: 'round' as const, fill: 'none' }
  return (
    <svg className={`portrait ${mood}`} viewBox="0 0 64 64" role="img" aria-label={LABEL[mood]}>
      <circle cx="32" cy="32" r="31" fill="var(--paper)" stroke="var(--rule)" />
      <g transform={mood === 'confess' ? 'translate(0 4)' : undefined}>
        <path d="M11 63c2-12 10-17 21-17s19 5 21 17z" fill="var(--ink)" />
        <ellipse cx="32" cy="34" rx="12" ry="13" fill="var(--sheet)" stroke="var(--ink)" strokeWidth="1.6" />
        <path d="M18.5 27c0-9.5 6-15 13.5-15s13.5 5.5 13.5 15z" fill="var(--ink)" />
        <rect x="15" y="25.5" width="34" height="4" rx="2" fill="var(--ink)" />
        <circle cx="32" cy="19.5" r="2.6" fill="var(--seal)" />

        {mood === 'calm' && (
          <>
            <path d="M24.5 32h5M34.5 32h5" {...stroke} />
            <circle cx="27" cy="35.5" r="1.5" fill="var(--ink)" />
            <circle cx="37" cy="35.5" r="1.5" fill="var(--ink)" />
            <path d="M28.5 42h7" {...stroke} />
          </>
        )}
        {mood === 'shaken' && (
          <>
            <path d="M24.5 32.500l5-1.600M39.5 32.500l-5-1.6" {...stroke} />
            <circle cx="28.4" cy="35.8" r="1.5" fill="var(--ink)" />
            <circle cx="38.4" cy="35.8" r="1.5" fill="var(--ink)" />
            <path d="M28 42.500q1.7-1.6 3.4 0t3.4 0" {...stroke} />
            <path d="M46 29c1.4 2.1 2.1 3.2 2.1 4.200a2.1 2.1 0 0 1-4.2 0c0-1 .7-2.1 2.1-4.200z" fill="var(--ink-soft)" />
          </>
        )}
        {mood === 'sweat' && (
          <>
            <path d="M24.5 32l5-2M39.5 32l-5-2" {...stroke} />
            <circle cx="27" cy="35.8" r="2" fill="var(--ink)" />
            <circle cx="37" cy="35.8" r="2" fill="var(--ink)" />
            <ellipse cx="32" cy="42.5" rx="1.9" ry="2.3" {...stroke} />
            <path d="M46 28c1.6 2.4 2.4 3.6 2.4 4.800a2.4 2.4 0 0 1-4.8 0c0-1.2.8-2.4 2.4-4.800z" fill="var(--ink-soft)" />
            <path d="M17 33c1.2 1.8 1.8 2.7 1.8 3.600a1.8 1.8 0 0 1-3.6 0c0-.9.6-1.8 1.8-3.600z" fill="var(--ink-soft)" />
          </>
        )}
        {mood === 'confess' && (
          <>
            <path d="M24.5 32.500l5-1.200M39.5 32.500l-5-1.2" {...stroke} />
            <path d="M25 36q2 2 4 0M35 36q2 2 4 0" {...stroke} />
            <path d="M28.5 43.500q3.5-3 7 0" {...stroke} />
          </>
        )}
      </g>
    </svg>
  )
}
