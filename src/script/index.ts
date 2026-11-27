// 서버가 답하지 못할 때 쓰는 대본. 정답과 판정 규칙이 들어 있어 화면 코드와 다른 묶음으로 나뉜다.
// src/api.ts가 필요할 때만 내려받는다. 서버가 답하는 동안에는 브라우저에 오지 않는다.
export { checkDrawer, checkEvidence, presentReply, pressReply, scriptedReply } from './room1'
export { judgeRound } from './room2'
export { checkDoor, searchAndAnswer } from './room3'
export { askScripted, checkRecordScripted } from './room4'
export { runScripted } from './room5'
export { CLUES, checkFinal } from './final'
