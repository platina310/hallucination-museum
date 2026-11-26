"""정문 자물쇠. 정답은 서버에만 둔다."""
import re

FINAL_CODE = "7823"
OLD_RULE_CODE = "2870"


def check_final(code: str) -> dict:
    c = re.sub(r"\D", "", code)
    if c == FINAL_CODE:
        return {"correct": True, "note": ""}
    if c == OLD_RULE_CODE:
        return {"correct": False, "note": "삐빅. 관장은 자신 있게 말했지만 2024년 규칙이었습니다. 게시판에서 더 최근 공지를 확인하세요."}
    return {"correct": False, "note": "삐빅. 정문이 열리지 않습니다. 단서 수첩과 게시판을 다시 대조해 보세요."}
