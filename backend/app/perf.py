"""요청 한 건이 어디서 시간을 썼는지, 왜 대본으로 답했는지 적어 둔다.

미들웨어가 요청마다 begin()으로 빈 기록을 만들고, 모델 호출·임베딩·DB 조회가 span()으로 걸린 시간을 더한다.
응답에는 표준 헤더 Server-Timing으로 싣고, 플레이 로그의 extra에도 남긴다. 값은 모두 밀리초다.
"""
from __future__ import annotations

import time
from contextvars import ContextVar

_cur: ContextVar[dict | None] = ContextVar("perf", default=None)


def begin(test: bool = False) -> dict:
    rec = {"t0": time.perf_counter(), "stages": {}, "why": "", "test": test}
    _cur.set(rec)
    return rec


class span:
    """with perf.span("llm"): ... 처럼 감싸면 그 구간에 걸린 시간을 지금 요청의 기록에 더한다."""

    def __init__(self, name: str):
        self.name = name

    def __enter__(self):
        self.t = time.perf_counter()
        return self

    def __exit__(self, *_):
        rec = _cur.get()
        if rec is not None:
            rec["stages"][self.name] = rec["stages"].get(self.name, 0.0) + (time.perf_counter() - self.t) * 1000
        return False


def why(reason: str) -> None:
    """모델 대신 대본으로 답하게 된 까닭. 한 요청에서 처음 생긴 것만 남긴다."""
    rec = _cur.get()
    if rec is not None and reason and not rec["why"]:
        rec["why"] = reason


def is_test() -> bool:
    """속도 측정처럼 시험으로 보낸 요청인지. 시험 요청은 플레이 로그에 남기지 않는다."""
    rec = _cur.get()
    return bool(rec and rec["test"])


def total_ms(rec: dict) -> int:
    return int((time.perf_counter() - rec["t0"]) * 1000)


def extra() -> dict:
    """플레이 로그에 남길 값: 전체 시간, 구간별 시간, 대본으로 답한 까닭"""
    rec = _cur.get()
    if rec is None:
        return {}
    out: dict = {"ms": total_ms(rec)}
    for name, ms in rec["stages"].items():
        out[f"{name}_ms"] = int(ms)
    if rec["why"]:
        out["why"] = rec["why"]
    return out


def header(rec: dict) -> str:
    """Server-Timing 헤더 값. 브라우저 개발자 도구의 네트워크 탭에서 구간별 시간을 볼 수 있다."""
    parts = [f"{name};dur={ms:.0f}" for name, ms in rec["stages"].items()]
    parts.append(f"total;dur={total_ms(rec)}")
    if rec["why"]:
        parts.append(f'fallback;desc="{rec["why"]}"')
    return ", ".join(parts)
