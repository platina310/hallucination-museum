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
