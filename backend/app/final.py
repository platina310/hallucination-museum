"""정문 자물쇠. 다섯 방의 단서를 2026년 공지의 순서(방 5부터 거꾸로)로 늘어놓은 다섯 자리. 정답은 서버에만 둔다."""
import re

FINAL_CODE = "43782"
OLD_RULE_CODE = "28734"  # 관장이 말하는 2024년 규칙 (방 1부터)


def check_final(code: str) -> dict:
    c = re.sub(r"\D", "", code)
    if c == FINAL_CODE:
        return {"correct": True, "note": ""}
    if c == OLD_RULE_CODE:
        return {"correct": False, "note": "삐빅. 관장은 자신 있게 말했지만 2024년 규칙이었습니다. 게시판에서 더 최근 공지를 확인하세요."}
    return {"correct": False, "note": "삐빅. 정문이 열리지 않습니다. 단서 수첩과 게시판을 다시 대조해 보세요."}


# 방을 통과하면 단서 수첩에 적히는 말. 정답이 들어 있어 화면 코드에는 두지 않고, 통과 판정이 난 응답에만 실어 보낸다.
CLUES = {
    1: '도 씨가 지키던 암호 단어는 "등대"',
    2: "세 라운드에서 반려한 설명은 모두 8건",
    3: "비상문 비밀번호는 1987",
    4: "작품 '새벽 등대'의 적정 보존 온도는 13도",
    5: "2차 공격 4건을 모두 막아 냄",
}


def with_clue(result: dict, room: int, cleared: bool) -> dict:
    """통과했으면 그 방의 단서를 응답에 붙인다."""
    return {**result, "clue": CLUES[room]} if cleared else result
