// 환각의 방 자료. 백엔드가 없을 때 쓰는 시연용이다.
// 지어낸 설명은 미리 정해 둔다. 실제 환각에 맡기면 풀 수 없는 문제가 나올 수 있기 때문이다.
export interface RecordCard {
  id: string
  label: string
  text: string
}

export interface Statement {
  id: number
  text: string
  cite: string // 도슨트가 대는 출처 이름
}

export const CARDS: RecordCard[] = [
  { id: 'K1', label: '작품 대장', text: '「새벽 항구」. 1962년 작. 캔버스에 유화. 가로 91cm, 세로 65cm. 1988년 기증으로 소장.' },
  { id: 'K2', label: '대여 기록', text: '「새벽 항구」 대여 1건. 2019년 부산 순회전. 그 밖의 외부 대여 없음.' },
  { id: 'K3', label: '보존 일지', text: '2021년 3월 표면 세척. 같은 달 액자 교체. 이후 특이 사항 없음.' },
  { id: 'K4', label: '전시실 배치도', text: '3전시실 북쪽 벽. 조도 150럭스. 관람 거리 1.5m.' },
]

export const STATEMENTS: Statement[] = [
  { id: 1, text: '「새벽 항구」는 1962년에 그려진 유화입니다.', cite: '작품 대장' },
  { id: 2, text: '작가는 이 그림을 파리 유학 시절에 완성했습니다.', cite: '작가 노트' },
  { id: 3, text: '2019년에는 부산 순회전에 대여되었습니다.', cite: '대여 기록' },
  { id: 4, text: '1970년 국제 비엔날레에서 금상을 받은 작품이기도 합니다.', cite: '작품 대장' },
  { id: 5, text: '2021년에는 표면을 세척하고 액자를 바꿨습니다.', cite: '보존 일지' },
]

const FABRICATED = [2, 4]

/** 지목한 설명 가운데 실제로 지어낸 말이 몇 개인지 센다 */
export function countHits(selected: number[]): number {
  return selected.filter((id) => FABRICATED.includes(id)).length
}

export const FABRICATED_COUNT = FABRICATED.length
