"""방 2 환각의 방. 반려해야 하는 설명 번호는 서버에만 둔다."""

# 라운드별 설명 수와, 반려해야 하는 설명 번호
CLAIM_COUNT = [4, 5, 6]
REJECT = [[2, 4], [2, 4, 5], [1, 4, 5]]


def judge_round(round_no: int, rejected: list[int]) -> dict:
    """맞게 처리한 건수만 알려 준다. 어느 것이 틀렸는지는 알려 주지 않는다."""
    if round_no < 0 or round_no >= len(REJECT):
        return {"correct": 0, "total": 0}
    answer = set(REJECT[round_no])
    picked = set(rejected)
    total = CLAIM_COUNT[round_no]
    correct = sum(1 for cid in range(1, total + 1) if (cid in answer) == (cid in picked))
    return {"correct": correct, "total": total}
