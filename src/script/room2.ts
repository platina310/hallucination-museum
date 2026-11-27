// 방 2 환각의 방 판정. 서버가 답하지 못할 때만 내려받아 쓴다. 서버(backend/app/room2.py)와 같다.
import { ROUNDS } from '../mock/room2'

// 라운드별로 반려해야 하는 설명 번호
const REJECT: number[][] = [
  [2, 4],
  [2, 4, 5],
  [1, 4, 5],
]

/** 통과·반려 처리 가운데 맞게 처리한 건수를 센다. 어느 것이 틀렸는지는 알려 주지 않는다. */
export function judgeRound(round: number, rejected: number[]): { correct: number; total: number } {
  const answer = REJECT[round] ?? []
  const claims = ROUNDS[round]?.claims ?? []
  const correct = claims.filter((c) => answer.includes(c.id) === rejected.includes(c.id)).length
  return { correct, total: claims.length }
}
