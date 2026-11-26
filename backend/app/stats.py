"""분석 페이지에 내보내는 집계. DB에서 꺼낸 행을 파이썬으로 센다.

원문(플레이어가 쓴 질문, 모델의 답)은 내보내지 않는다. 건수와 비율만 내보낸다.
"""
from __future__ import annotations

import statistics
import time

from . import store

# 방별 퀴즈 정답 번호. 화면의 src/game/rooms.ts와 같아야 한다. 맞았는지는 서버가 판정한다
QUIZ_ANSWERS = {1: 1, 2: 1, 3: 1, 4: 1, 5: 2}
ROOM_NAMES = {1: "지시의 방", 2: "환각의 방", 3: "서가의 방", 4: "온도의 방", 5: "문지기의 방"}

_cache: tuple[float, dict] | None = None


def quiz_correct(room: int, choice: int) -> bool:
    return QUIZ_ANSWERS.get(room) == choice


def summarize(events: list[dict], plays: list[dict]) -> dict:
    """events: game_events 행, plays: play_logs 행. 둘 다 최근 것부터."""
    sessions = {e["session"] for e in events}
    rooms = []
    for room, name in ROOM_NAMES.items():
        # 한 사람이 여러 번 보낸 경우 처음 것만 센다 (목록은 최근 것부터라서 뒤집어 본다)
        pre: dict[str, bool] = {}
        post: dict[str, bool] = {}
        clears: dict[str, dict] = {}
        for e in reversed(events):
            if e["room"] != room:
                continue
            if e["kind"] == "quiz":
                box = pre if e["data"].get("phase") == "pre" else post
                box.setdefault(e["session"], bool(e["data"].get("correct")))
            elif e["kind"] == "clear":
                clears.setdefault(e["session"], e["data"])
        both = [s for s in pre if s in post]
        tries = [int(c.get("tries", 0)) for c in clears.values()]
        hints = [int(c.get("hints", 0)) for c in clears.values()]
        rooms.append({
            "room": room,
            "name": name,
            "started": len(pre),
            "cleared": len(clears),
            "tries_median": statistics.median(tries) if tries else None,
            "hints_mean": round(sum(hints) / len(hints), 1) if hints else None,
            "quiz_pre": {"n": len(pre), "right": sum(pre.values())},
            "quiz_post": {"n": len(post), "right": sum(post.values())},
            # 같은 사람의 입장 전과 탈출 후를 짝지은 것
            "quiz_paired": {"n": len(both), "pre_right": sum(pre[s] for s in both), "post_right": sum(post[s] for s in both)},
        })
    escaped = {e["session"] for e in events if e["kind"] == "escape"}

    talks = [p for p in plays if p["room"] == 1 and p["event"] == "interrogate"]
    by_type: dict[str, dict] = {}
    for t in talks:
        row = by_type.setdefault(t["attack_type"] or "기타", {"n": 0, "leak": 0})
        row["n"] += 1
        row["leak"] += t["leak"] in ("전체", "부분")
    asks = [p for p in plays if p["room"] == 3 and p["event"] == "ask"]
    answered = [p for p in plays if p["event"] in ("interrogate", "ask", "press", "present")]
    ms = [int(p["extra"]["ms"]) for p in talks + asks if isinstance(p["extra"].get("ms"), (int, float))]
    return {
        "db": True,
        "sessions": len(sessions),
        "escaped": len(escaped),
        "rooms": rooms,
        "talk": {
            "n": len(talks),
            "types": sorted(({"type": k, **v} for k, v in by_type.items()), key=lambda r: -r["n"]),
        },
        "search": {
            "n": len(asks),
            "kinds": _count(a["extra"].get("kind", "") for a in asks),
            "methods": _count(a["extra"].get("search", "") for a in asks),
        },
        "engine": _count(p["engine"] for p in answered if p["engine"]),
        "latency_ms": {"n": len(ms), "median": int(statistics.median(ms)) if ms else None, "p90": int(sorted(ms)[int(len(ms) * 0.9) - 1]) if len(ms) >= 10 else None},
    }


def _count(values) -> dict[str, int]:
    out: dict[str, int] = {}
    for v in values:
        if v:
            out[v] = out.get(v, 0) + 1
    return out


def get() -> dict:
    """집계 결과. 30초 동안은 같은 결과를 돌려준다. DB를 쓸 수 없으면 db가 False."""
    global _cache
    now = time.time()
    if _cache and now - _cache[0] < 30:
        return _cache[1]
    events = store.recent_events()
    plays = store.recent_plays()
    if events is None or plays is None:
        return {"db": False}
    out = summarize(events, plays)
    _cache = (now, out)
    return out
