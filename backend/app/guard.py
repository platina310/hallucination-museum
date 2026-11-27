"""요청 제한. 한 주소가 너무 자주 부르는 것과, 모델 호출 수를 막는다. 서버 메모리에만 둔다.

발표자 우선 모드가 켜져 있으면(PRESENTER_KEY) 발표자가 아닌 방문자의 모델 호출을 하루·1분 단위로 더 좁게 막아,
시연 중에 다른 사람이 몰려도 발표자 화면은 Gemini 답을 받게 한다.
"""
from __future__ import annotations

import hmac
import time
from collections import defaultdict, deque
from contextvars import ContextVar

from . import config, perf

# 지금 처리 중인 요청이 발표자의 것인지. 요청마다 미들웨어가 정한다
presenter: ContextVar[bool] = ContextVar("presenter", default=False)

_hits: dict[str, deque[float]] = defaultdict(deque)
_day = ""
_calls = 0  # 오늘 쓴 생성 호출 (전체)
_embeds = 0  # 오늘 쓴 임베딩 호출
_public_calls = 0  # 그 가운데 발표자가 아닌 방문자가 쓴 것
_public_chat: deque[float] = deque()
_public_embed: deque[float] = deque()
_presenter_seen = 0.0  # 발표자 암호를 보낸 요청이 마지막으로 온 때


def note_presenter() -> None:
    global _presenter_seen
    _presenter_seen = time.time()


def presenting() -> bool:
    """지금 발표 중인지: 발표자 암호를 보낸 요청이 최근 PRESENTER_HOLD_SECONDS 안에 있었는지.

    방문자의 1분 한도는 발표 중에만 건다. 발표자가 없을 때까지 걸어 두면, 평소 방문자가 Gemini 대신
    대본으로 답을 받는 일이 잦아진다 (11월 27일 플레이 기록에서 확인).
    하루 한도(PUBLIC_DAILY_LLM_CALLS)는 발표 전에 몫이 바닥나지 않게 늘 걸어 둔다.
    """
    return config.PRESENTER_KEY != "" and time.time() - _presenter_seen < config.PRESENTER_HOLD_SECONDS


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
    global _day, _calls, _public_calls, _embeds
    today = time.strftime("%Y-%m-%d", time.gmtime())
    if today != _day:
        _day, _calls, _public_calls, _embeds = today, 0, 0, 0


def take_llm_call() -> bool:
    """오늘 쓸 수 있는 생성 호출이 남았으면 하나 쓰고 True. 발표자가 아니면 더 좁은 한도를 먼저 본다."""
    return take_llm_calls(1)


def take_llm_calls(n: int) -> bool:
    """생성 호출 n번을 한꺼번에 쓴다. 다 쓸 수 없으면 하나도 쓰지 않고 False."""
    global _calls, _public_calls
    _today()
    if n <= 0:
        return True
    if _calls + n > config.GAME_DAILY_LLM_CALLS:
        perf.why("daily_cap")
        return False
    if config.PRESENTER_KEY and not presenter.get():
        now = time.time()
        _prune(_public_chat, now)
        if _public_calls + n > config.PUBLIC_DAILY_LLM_CALLS:
            perf.why("daily_cap")
            return False
        if presenting() and len(_public_chat) + n > config.PUBLIC_LLM_PER_MINUTE:
            perf.why("presenter_reserve")
            return False
        _public_chat.extend([now] * n)
        _public_calls += n
    _calls += n
    return True


def take_embed_call() -> bool:
    """임베딩 호출을 해도 되는지. 발표자 우선 모드에서 방문자의 검색이 몰리면 낱말 검색으로 돌린다."""
    global _embeds
    _today()
    if _embeds >= config.DAILY_EMBED_CALLS:
        perf.why("daily_cap")
        return False
    if presenting() and not presenter.get():
        now = time.time()
        _prune(_public_embed, now)
        if len(_public_embed) >= config.PUBLIC_EMBED_PER_MINUTE:
            perf.why("presenter_reserve")
            return False
        _public_embed.append(now)
    _embeds += 1
    return True


def calls_left() -> int:
    """지금 요청한 쪽이 오늘 더 쓸 수 있는 생성 호출 수"""
    _today()
    total = config.GAME_DAILY_LLM_CALLS - _calls
    if config.PRESENTER_KEY and not presenter.get():
        return max(0, min(total, config.PUBLIC_DAILY_LLM_CALLS - _public_calls))
    return max(0, total)


def reset_for_tests() -> None:
    global _day, _calls, _public_calls, _presenter_seen, _embeds
    _day, _calls, _public_calls, _presenter_seen, _embeds = "", 0, 0, 0.0, 0
    _public_chat.clear()
    _public_embed.clear()
    _hits.clear()
