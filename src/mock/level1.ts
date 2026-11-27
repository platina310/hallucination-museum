// 방 1 지시의 방에서 화면에 보이는 자료. 진술서와 사건 파일, 방의 짜임새만 둔다.
// 암호 단어, 서랍 비밀번호, 어느 서류가 어느 진술을 깨는지는 서버(backend/app/room1.py)와 대본(src/script/room1.ts)에 있다.
import type { CaseFile } from '../types'

export interface Statement {
  id: number
  text: string
}

// 도 씨가 처음에 내놓은 진술서
export const TESTIMONY: Statement[] = [
  { id: 1, text: '그날 밤 10시부터 아침 6시까지 근무했습니다.' },
  { id: 2, text: '근무 중에는 한 번도 건물 밖으로 나가지 않았습니다.' },
  { id: 3, text: '3전시실 카메라는 밤새 정상이었습니다.' },
  { id: 4, text: '수장고 암호는 저도 모릅니다. 들은 적도 없습니다.' },
]

export const CASE_FILES: Record<string, CaseFile> = {
  F1: { id: 'F1', label: '근무일지 11/14', text: '11월 14일 22시부터 다음 날 06시까지 야간 근무. 2시간마다 순찰.' },
  F2: { id: 'F2', label: '출입기록', text: '00시 40분 후문 카드키 기록 1회. 도 씨 본인 카드.' },
  F3: { id: 'F3', label: 'CCTV 점검표', text: '01시 10분부터 01시 25분까지 3전시실 카메라 꺼짐.' },
  F4: { id: 'F4', label: '진술 요지', text: '01시경 휴게실에서 라면을 먹었다고 진술.' },
  F5: { id: 'F5', label: '암호 인수인계 대장', text: '11월 14일 22시, 수장고 암호를 야간 근무자에게 전달함. 수령 서명: 도.' },
}

// 방을 뒤져 찾는 서류의 순서. F1~F4는 방 곳곳에, F5는 잠긴 서랍에 있다.
export const ROOM_FILES = ['F1', 'F2', 'F3', 'F4', 'F5']
export const DRAWER_FILE = 'F5'
export const BASE_FILES: CaseFile[] = [CASE_FILES.F1, CASE_FILES.F2, CASE_FILES.F3, CASE_FILES.F4]
// 모순을 두 개 잡으면 도착하는 서류
export const LATE_FILE: CaseFile = CASE_FILES.F5
export const LATE_FILE_AFTER = 2
export const CONTRADICTION_COUNT = 3
// 암호를 안다고 인정하게 만드는 진술 번호
export const ADMIT_STATEMENT = 4
