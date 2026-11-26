"""요청 제한. 한 주소가 너무 자주 부르는 것과, 하루 모델 호출 수를 막는다. 서버 메모리에만 둔다."""
from __future__ import annotations

import time
from collections import defaultdict, deque

from . import config

_hits: dict[str, deque[float]] = defaultdict(deque)
_day = ""
_calls = 0


def allow_request(ip: str) -> bool:
    now = time.time()
    q = _hits[ip]
    while q and now - q[0] > 60:
        q.popleft()
    if len(q) >= config.RATE_PER_MINUTE:
        return False
    q.append(now)
    if len(_hits) > 5000:  # 오래 쌓이지 않게 비운다
        _hits.clear()
    return True


def take_llm_call() -> bool:
    """오늘 쓸 수 있는 모델 호출이 남았으면 하나 쓰고 True."""
    global _day, _calls
    today = time.strftime("%Y-%m-%d", time.gmtime())
    if today != _day:
        _day, _calls = today, 0
    if _calls >= config.GAME_DAILY_LLM_CALLS:
        return False
    _calls += 1
    return True


def calls_left() -> int:
    today = time.strftime("%Y-%m-%d", time.gmtime())
    return config.GAME_DAILY_LLM_CALLS - (_calls if today == _day else 0)
