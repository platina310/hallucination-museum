// 발표자 우선 모드. 시연하는 사람이 암호를 넣어 두면, 다른 사람이 몰려도 이 화면은 Gemini 답을 받는다.
// 서버 주소가 없으면(대본만 쓰는 화면) 보여 주지 않는다.
import { useState, useSyncExternalStore } from 'react'
import type { FormEvent } from 'react'
import { getPresenterState, setPresenterKey, subscribeServer, usingMock } from '../api'

const NOTE = {
  off: '',
  checking: '확인하는 중이에요.',
  on: '발표자 모드가 켜졌어요. 이 브라우저의 요청은 Gemini 몫을 먼저 받아요.',
  wrong: '암호가 맞지 않아요. 다시 넣어 주세요.',
  unavailable: '서버에 확인하지 못했어요. 서버가 깨어난 뒤 다시 해 보세요. 서버에 발표자 암호가 설정돼 있지 않아도 이렇게 나와요.',
} as const

export default function Presenter() {
  const state = useSyncExternalStore(subscribeServer, getPresenterState, getPresenterState)
  const [open, setOpen] = useState(false)
  const [key, setKey] = useState('')
  const [busy, setBusy] = useState(false)

  if (usingMock) return null

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (busy || key.trim() === '') return
    setBusy(true)
    await setPresenterKey(key.trim())
    setKey('')
    setBusy(false)
  }

  if (state === 'on') {
    return (
      <div className="presenter on">
        <span className="pill ok" role="status">
          발표자 모드
        </span>
        <span className="muted">이 브라우저의 요청은 Gemini 몫을 먼저 받아요.</span>
        <button type="button" className="toggle" data-no-bgm onClick={() => void setPresenterKey('')}>
          끄기
        </button>
      </div>
    )
  }

  return (
    <div className="presenter">
      <button type="button" className="toggle" data-no-bgm aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        발표자 모드
      </button>
      {open && (
        <form onSubmit={(e) => void submit(e)}>
          <label htmlFor="presenter-key" className="sr-only">
            발표자 암호
          </label>
          <input
            id="presenter-key"
            type="password"
            autoComplete="off"
            placeholder="발표자 암호"
            maxLength={100}
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
          <button className="btn small" type="submit" disabled={busy || key.trim() === ''}>
            켜기
          </button>
          <p className="muted" role="status">
            {state === 'off' ? '시연하는 사람만 쓰는 기능이에요. 암호는 이 브라우저에만 저장돼요.' : NOTE[state]}
          </p>
        </form>
      )}
    </div>
  )
}
