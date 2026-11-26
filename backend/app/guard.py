"""요청 제한. 한 주소가 너무 자주 부르는 것과, 모델 호출 수를 막는다. 서버 메모리에만 둔다.

발표자 우선 모드가 켜져 있으면(PRESENTER_KEY) 발표자가 아닌 방문자의 모델 호출을 하루·1분 단위로 더 좁게 막아,
시연 중에 다른 사람이 몰려도 발표자 화면은 Gemini 답을 받게 한다.
"""
from __future__ import annotations

import hmac
import time
from collections import defaultdict, deque
from contextvars import ContextVar

from . import config

# 지금 처리 중인 요청이 발표자의 것인지. 요청마다 미들웨어가 정한다
presenter: ContextVar[bool] = ContextVar("presenter", default=False)

_hits: dict[str, deque[float]] = defaultdict(deque)
_day = ""
_calls = 0  # 오늘 쓴 생성 호출 (전체)
_public_calls = 0  # 그 가운데 발표자가 아닌 방문자가 쓴 것
_public_chat: deque[float] = deque()
_public_embed: deque[float] = deque()


def _prune(q: deque[float], now: float) -> None:
    while q and now - q[0] > 60:
        q.popleft()


def allow_request(ip: str) -> bool:
    now = time.time()
    q = _hits[ip]
    _prune(q, now)
    if len(q) >= config.RATE_PER_MINUTE:
        return False
    q.append(now)
    if len(_hits) > 5000:  # 오래 쌓이지 않게 비운다
        _hits.clear()
    return True


def is_presenter(key: str) -> bool:
    """보낸 암호가 발표자 암호와 같은지.

    틀린 암호를 보낸 주소를 잠그지는 않는다. 강의실에서는 모두가 한 주소로 보여서,
    누가 틀린 암호를 보내면 발표자까지 잠기기 때문이다. 대신 암호를 길게 쓰게 한다 (config.PRESENTER_KEY).
    """
    if config.PRESENTER_KEY == "" or key == "":
        return False
    return hmac.compare_digest(key.encode(), config.PRESENTER_KEY.encode())


def _today() -> None:
    global _day, _calls, _public_calls
    today = time.strftime("%Y-%m-%d", time.gmtime())
    if today != _day:
        _day, _calls, _public_calls = today, 0, 0


def take_llm_call() -> bool:
    """오늘 쓸 수 있는 생성 호출이 남았으면 하나 쓰고 True. 발표자가 아니면 더 좁은 한도를 먼저 본다."""
    global _calls, _public_calls
    _today()
    if _calls >= config.GAME_DAILY_LLM_CALLS:
        return False
    if config.PRESENTER_KEY and not presenter.get():
        now = time.time()
        _prune(_public_chat, now)
        if _public_calls >= config.PUBLIC_DAILY_LLM_CALLS or len(_public_chat) >= config.PUBLIC_LLM_PER_MINUTE:
            return False
        _public_chat.append(now)
        _public_calls += 1
    _calls += 1
    return True


def take_embed_call() -> bool:
    """임베딩 호출을 해도 되는지. 발표자 우선 모드에서 방문자의 검색이 몰리면 낱말 검색으로 돌린다."""
    if config.PRESENTER_KEY and not presenter.get():
        now = time.time()
        _prune(_public_embed, now)
        if len(_public_embed) >= config.PUBLIC_EMBED_PER_MINUTE:
            return False
        _public_embed.append(now)
    return True


def calls_left() -> int:
    """지금 요청한 쪽이 오늘 더 쓸 수 있는 생성 호출 수"""
    _today()
    total = config.GAME_DAILY_LLM_CALLS - _calls
    if config.PRESENTER_KEY and not presenter.get():
        return max(0, min(total, config.PUBLIC_DAILY_LLM_CALLS - _public_calls))
    return max(0, total)


def reset_for_tests() -> None:
    global _day, _calls, _public_calls
    _day, _calls, _public_calls = "", 0, 0
    _public_chat.clear()
    _public_embed.clear()
    _hits.clear()
