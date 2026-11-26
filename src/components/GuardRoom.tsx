// 지시의 방의 경비실. 방을 눌러 뒤져 사건 파일을 찾는다. 스팀 방탈출 게임의 방 수색 화면을 본떴다.
// 찾은 서류만 도 씨에게 내밀 수 있다. 잠긴 서랍은 방 안의 다른 서류를 읽어야 열린다.
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { CaseFile } from '../types'
import { DRAWER_CODE, DRAWER_FILE, ROOM_FILES } from '../mock/level1'
import { Figure } from './Portrait'
import type { Dread, Face } from './Portrait'

// 방 안의 살펴볼 곳. 자리는 그림 크기에 대한 백분율이다.
interface Spot {
  id: string
  label: string
  file?: string // 여기서 나오는 사건 파일
  note: string // 살펴봤을 때 나오는 말
  x: number
  y: number
  w: number
  h: number
}

const SPOTS: Spot[] = [
  { id: 'board', label: '게시판', file: 'F4', note: '게시판에 진술 요지가 꽂혀 있어요.', x: 4, y: 14, w: 20, h: 28 },
  { id: 'clip', label: 'CCTV 옆 점검표', file: 'F3', note: '모니터 옆에 점검표가 걸려 있어요. 화면 하나는 꺼져 있네요.', x: 55, y: 15, w: 9, h: 24 },
  { id: 'reader', label: '카드 리더기', file: 'F2', note: '리더기에서 출입기록이 한 장 삐져나와 있어요.', x: 72, y: 38, w: 8, h: 20 },
  { id: 'log', label: '책상 위 일지', file: 'F1', note: '펼쳐진 근무일지예요.', x: 40, y: 60, w: 17, h: 14 },
  { id: 'cup', label: '컵라면', note: '컵라면 용기. 국물이 아직 따뜻해요. 누가 방금까지 먹은 걸까요.', x: 60, y: 58, w: 8, h: 14 },
  { id: 'window', label: '문에 난 창', note: '복도는 캄캄해요. …방금 뭔가 지나간 것 같은데, 기분 탓이겠죠.', x: 84.5, y: 16, w: 9, h: 20 },
]
const DRAWER = { x: 56, y: 76, w: 17, h: 15 }

export default function GuardRoom({
  files,
  found,
  drawerOpen,
  face,
  dread,
  calm,
  onCalm,
  onFind,
  onDrawerOpen,
  onTalk,
}: {
  files: Record<string, CaseFile>
  found: string[]
  drawerOpen: boolean
  face: Face
  dread: Dread // 하드 모드에서 모순을 잡을 때마다 도 씨가 변하는 정도
  calm: boolean // 깜빡임과 그림자 끄기. 심문 화면과 같이 쓴다
  onCalm: (v: boolean) => void
  onFind: (fileId: string) => void
  onDrawerOpen: () => void
  onTalk: () => void
}) {
  const [look, setLook] = useState<{ title: string; text: string; file?: CaseFile; fresh?: boolean } | null>(null)
  const [showSpots, setShowSpots] = useState(false)
  const [atDrawer, setAtDrawer] = useState(false)
  const [code, setCode] = useState('')
  const [wrong, setWrong] = useState('')
  const [shade, setShade] = useState(false) // 창밖을 스치는 그림자
  const shadeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(shadeTimer.current), [])

  // 단서를 찾을 때 가끔 창밖으로 뭔가 지나간다. 무섭게 하려는 게 아니라 분위기용이라 짧게 한 번씩만.
  function maybeShade(count: number) {
    if (calm || (count !== 2 && count !== 4)) return
    setShade(true)
    clearTimeout(shadeTimer.current)
    shadeTimer.current = setTimeout(() => setShade(false), 900)
  }

  function inspect(s: Spot) {
    setAtDrawer(false)
    const file = s.file ? files[s.file] : undefined
    const fresh = file !== undefined && !found.includes(file.id)
    if (file && fresh) {
      onFind(file.id)
      maybeShade(found.length + 1)
    }
    setLook({ title: s.label, text: s.note, file, fresh })
  }

  function openDrawerPanel() {
    setLook(null)
    setWrong('')
    setAtDrawer(true)
  }

  function tryDrawer(e: FormEvent) {
    e.preventDefault()
    if (code.length < 4) return
    if (code === DRAWER_CODE) {
      onDrawerOpen()
      onFind(DRAWER_FILE)
      maybeShade(found.length + 1)
      setAtDrawer(false)
      setLook({ title: '잠겨 있던 서랍', text: '딸깍. 서랍이 열렸어요. 안에 대장이 한 권 들어 있어요.', file: files[DRAWER_FILE], fresh: true })
    } else {
      setWrong(found.includes('F3') ? '안 열려요. 점검표에 적힌 시각을 네 자리로 다시 확인해 보세요.' : '안 열려요. 카메라가 언제 꺼졌는지 적힌 서류가 이 방 어딘가에 있을 거예요.')
    }
    setCode('')
  }

  const foundFiles = ROOM_FILES.filter((id) => found.includes(id)).map((id) => files[id])

  return (
    <div className="scene-wrap">
      <div className={`scene${calm ? ' calm' : ''}${showSpots ? ' show-spots' : ''}${dread ? ` dread-${dread}` : ''}`}>
        <svg viewBox="0 0 800 450" role="img" aria-label="형광등이 켜진 누런 경비실. 왼쪽에 게시판, 가운데에 CCTV 모니터와 책상, 오른쪽에 문과 카드 리더기가 있다.">
          <rect width="800" height="330" fill="#d9c98a" />
          <path d="M0 330h800" stroke="#a8955a" strokeWidth="5" />
          <rect y="332" width="800" height="118" fill="#b9a56b" />
          <path d="M0 370h800M0 415h800M-60 450l230-118M280 450l80-118M520 450l-60-118M860 450L650 332" stroke="#a8955a" strokeWidth="2" />
          <path d="M170 60v270M360 60v270M560 60v270" stroke="#cdbc7c" strokeWidth="2" />
          {/* 형광등 */}
          <rect x="250" y="14" width="300" height="16" rx="3" fill="#8f8457" />
          <rect className="tube" x="258" y="18" width="284" height="8" rx="4" fill="#fffbe0" />
          {/* 게시판 */}
          <rect x="34" y="64" width="158" height="124" fill="#8a6a44" />
          <rect x="42" y="72" width="142" height="108" fill="#c9a66b" />
          <rect x="54" y="84" width="54" height="68" fill="#f8f9f6" />
          <path d="M62 98h38M62 110h38M62 122h26" stroke="#4f5b68" strokeWidth="3" />
          <circle cx="81" cy="86" r="4" fill="#bf2f1b" />
          <rect x="120" y="92" width="52" height="36" fill="#f0d24a" />
          <rect x="124" y="138" width="44" height="30" fill="#e9ece8" />
          {/* CCTV 모니터 넷. 하나는 꺼져 있다 */}
          <rect x="226" y="60" width="210" height="132" rx="4" fill="#27303b" />
          <rect x="236" y="70" width="92" height="52" fill="#4d6b7a" />
          <rect x="334" y="70" width="92" height="52" fill="#4d6b7a" />
          <rect x="236" y="130" width="92" height="52" fill="#0b0e13" />
          <rect x="334" y="130" width="92" height="52" fill="#4d6b7a" />
          <path d="M246 112l22-18 18 12 16-20 18 26M344 112l18-14 22 8 14-18 20 24M344 172l26-16 16 10 28-22" stroke="#9fc0cc" strokeWidth="2" fill="none" />
          <text x="282" y="160" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fill="#ff6b4f">신호 없음</text>
          {/* 점검표 */}
          <path d="M476 64v10" stroke="#6b7786" strokeWidth="3" />
          <rect x="446" y="74" width="60" height="92" rx="3" fill="#75593c" />
          <rect x="452" y="84" width="48" height="76" fill="#f8f9f6" />
          <rect x="464" y="70" width="24" height="10" rx="2" fill="#c9a94a" />
          <path d="M458 98h36M458 110h36M458 122h24M458 134h36" stroke="#4f5b68" strokeWidth="3" />
          {/* 문과 카드 리더기 */}
          <rect x="652" y="52" width="124" height="280" fill="#6f6642" />
          <rect x="662" y="62" width="104" height="270" fill="#9a8d5c" />
          <rect x="682" y="78" width="64" height="76" fill="#0b0e13" />
          <g className={shade ? 'shade on' : 'shade'} fill="#000">
            <ellipse cx="714" cy="100" rx="11" ry="15" />
            <path d="M698 122q16-9 32 0l4 32h-40z" />
          </g>
          <circle cx="750" cy="204" r="7" fill="#c9a94a" />
          <rect x="588" y="176" width="40" height="58" rx="4" fill="#27303b" />
          <rect x="596" y="184" width="24" height="12" fill="#5fd09a" />
          <rect x="598" y="226" width="20" height="34" fill="#f8f9f6" />
          <path d="M602 236h12M602 244h12M602 252h8" stroke="#4f5b68" strokeWidth="2" />
          {/* 책상, 일지, 컵라면, 서랍 */}
          <rect x="150" y="270" width="470" height="16" fill="#6d5236" />
          <rect x="166" y="286" width="438" height="140" fill="#5c452d" />
          <g transform="rotate(-4 388 262)">
            <rect x="330" y="246" width="116" height="30" fill="#f8f9f6" stroke="#4f5b68" strokeWidth="2" />
            <path d="M388 246v30M340 256h38M340 266h30M398 256h38M398 266h26" stroke="#4f5b68" strokeWidth="2" />
          </g>
          <path d="M490 232h44l-6 38h-32z" fill="#f8f9f6" stroke="#bf2f1b" strokeWidth="3" />
          <path d="M500 226q4-10 0-18M514 226q4-10 0-18" stroke="#f8f9f6" strokeWidth="2" fill="none" opacity=".7" />
          <rect x="456" y="340" width="130" height="62" fill="#75593c" stroke="#3a2c20" strokeWidth="2" />
          <circle cx="521" cy="372" r="7" fill={drawerOpen ? '#5fd09a' : '#c9a94a'} />
          {!drawerOpen && <rect x="494" y="346" width="54" height="16" fill="#f0d24a" />}
          <rect x="196" y="304" width="120" height="100" fill="#75593c" />
        </svg>

        {/* 도 씨는 책상 뒤에 앉아 있다. 누르면 말을 건다 */}
        <button type="button" className="spot guard" style={{ left: '23.500%', top: '27%', width: '15%', height: '33.500%' }} onClick={onTalk}>
          <Figure who="do" face={face} dread={dread} />
          <span className="spot-tag">도 씨에게 말 걸기</span>
        </button>
        {SPOTS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`spot${s.file && found.includes(s.file) ? ' done' : ''}`}
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.w}%`, height: `${s.h}%` }}
            aria-label={`${s.label} 살펴보기`}
            onClick={() => inspect(s)}
          >
            <span className="spot-tag">{s.label}</span>
          </button>
        ))}
        <button
          type="button"
          className={`spot${drawerOpen ? ' done' : ''}`}
          style={{ left: `${DRAWER.x}%`, top: `${DRAWER.y}%`, width: `${DRAWER.w}%`, height: `${DRAWER.h}%` }}
          aria-label={drawerOpen ? '열린 서랍 살펴보기' : '잠긴 서랍 살펴보기'}
          onClick={() => (drawerOpen ? setLook({ title: '열린 서랍', text: '대장을 꺼낸 빈 서랍이에요.', file: files[DRAWER_FILE] }) : openDrawerPanel())}
        >
          <span className="spot-tag">{drawerOpen ? '열린 서랍' : '잠긴 서랍'}</span>
        </button>
      </div>

      <div className="scene-bar">
        <span>
          <b>경비실</b> <span className="muted">눈에 띄는 곳을 눌러 살펴보세요</span>
        </span>
        <span className="scene-ctl">
          <button type="button" className="toggle" aria-pressed={showSpots} onClick={() => setShowSpots((v) => !v)}>
            살펴볼 곳 표시
          </button>
          <button type="button" className="toggle" aria-pressed={calm} onClick={() => onCalm(!calm)}>
            깜빡임 끄기
          </button>
        </span>
      </div>

      {/* 화면이 작으면 그림 속 물건을 누르기 어렵다. 같은 곳을 단추로도 고를 수 있게 한다 */}
      <div className={showSpots ? 'spot-list on' : 'spot-list'} role="group" aria-label="살펴볼 곳 목록">
        <button type="button" className="toggle talk" onClick={onTalk}>
          도 씨에게 말 걸기
        </button>
        {SPOTS.map((s) => (
          <button key={s.id} type="button" className="toggle" onClick={() => inspect(s)}>
            {s.file && found.includes(s.file) ? '✓ ' : ''}
            {s.label}
          </button>
        ))}
        <button type="button" className="toggle" onClick={() => (drawerOpen ? setLook({ title: '열린 서랍', text: '대장을 꺼낸 빈 서랍이에요.', file: files[DRAWER_FILE] }) : openDrawerPanel())}>
          {drawerOpen ? '✓ 열린 서랍' : '잠긴 서랍'}
        </button>
      </div>

      <div className="scene-look" role="status">
        {atDrawer ? (
          <form className="drawer" onSubmit={tryDrawer}>
            <p>
              <b>잠긴 서랍</b> 노란 쪽지가 붙어 있어요. <mark>"비밀번호는 카메라가 꺼진 시각. 네 자리."</mark>
            </p>
            <div className="drawer-row">
              <label htmlFor="drawer-code" className="sr-only">
                서랍 비밀번호 네 자리
              </label>
              <input
                id="drawer-code"
                className="code-input"
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                placeholder="0000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              />
              <button className="btn" type="submit" disabled={code.length < 4}>
                열어 보기
              </button>
            </div>
            {wrong !== '' && <p className="drawer-wrong">{wrong}</p>}
          </form>
        ) : look ? (
          <>
            <p>
              <b>{look.title}</b> {look.text}
            </p>
            {look.file && (
              <div className={look.fresh ? 'found-card fresh' : 'found-card'}>
                <span className="mono">{look.fresh ? '단서 획득' : '이미 챙긴 단서'}</span>
                <b>{look.file.label}</b>
                <span>{look.file.text}</span>
              </div>
            )}
          </>
        ) : (
          <p className="muted">아직 살펴본 곳이 없어요. 서류가 있을 만한 곳부터 눌러 보세요.</p>
        )}
      </div>

      <div className="bag">
        <span className="shelf-label">
          단서 가방 <span className="muted">{foundFiles.length} / {ROOM_FILES.length}</span>
        </span>
        <div className="bag-items">
          {foundFiles.length === 0 && <span className="muted">비어 있어요</span>}
          {foundFiles.map((f) => (
            <button key={f.id} type="button" className="toggle" onClick={() => { setAtDrawer(false); setLook({ title: '단서 가방', text: '챙겨 둔 서류를 다시 읽어요.', file: f }) }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
