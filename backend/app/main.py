"""환각 미술관 서버. 화면(React)이 부르는 주소를 모아 둔다.

실행: uvicorn app.main:app --reload   (backend 폴더에서)
문서: /docs
"""
from __future__ import annotations

import logging
import threading
from contextlib import asynccontextmanager

from fastapi import BackgroundTasks, FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from . import config, final, guard, llm, mcp_server, perf, room1, room2, room3, room4, room5, stats, store

logging.basicConfig(level=logging.INFO)



_mcp, _mcp_http = mcp_server.build()


@asynccontextmanager
async def lifespan(_: FastAPI):
    store.init_schema()  # DB가 있으면 테이블을 준비한다. 없어도 서버는 뜬다
    # 모델 라이브러리를 미리 읽어 둔다. 서버가 뜨는 것을 막지 않게 따로 돌린다
    threading.Thread(target=llm.warm_up, daemon=True).start()
    if _mcp is None:
        yield
        return
    async with _mcp.session_manager.run():  # MCP 서버(/mcp)를 함께 띄운다
        yield


app = FastAPI(
    title="환각 미술관 API",
    version="0.7.7",
    description="AI 방탈출 '환각 미술관'의 방 규칙, 검색, 모델 호출, 판정",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_origin_regex=config.ALLOWED_ORIGIN_REGEX,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Presenter-Key", "X-Museum-Test"],
    expose_headers=["Server-Timing"],
)


@app.middleware("http")
async def limit(request: Request, call_next):
    # 방문자 주소. 앞단(Cloudflare)이 직접 적어 주는 값을 먼저 믿는다. X-Forwarded-For의 첫 값은 보내는 쪽이 꾸밀 수 있다
    h = request.headers
    ip = (h.get("cf-connecting-ip") or h.get("true-client-ip") or h.get("x-forwarded-for") or (request.client.host if request.client else "")).split(",")[0].strip()
    if request.method == "POST":
        if not guard.allow_request(ip):
            return JSONResponse({"detail": "요청이 몰렸습니다. 잠시 뒤 다시 시도해 주세요."}, status_code=429)
        # 게임의 요청은 길어야 수백 자다. 큰 본문은 읽기 전에 돌려보낸다 (MCP 주소는 제외)
        size = h.get("content-length", "")
        if not request.url.path.startswith("/mcp") and size.isdigit() and int(size) > config.MAX_BODY_BYTES:
            return JSONResponse({"detail": "요청이 너무 큽니다."}, status_code=413)
    # 발표자 암호를 보낸 요청인지 표시해 둔다. 모델 호출 한도를 정할 때 쓴다
    is_presenter = guard.is_presenter(request.headers.get("x-presenter-key", ""))
    guard.presenter.set(is_presenter)
    if is_presenter:
        guard.note_presenter()
    # 어디서 시간을 썼는지 재서 Server-Timing 헤더로 싣는다. X-Museum-Test를 보낸 시험 요청은 플레이 로그에 남기지 않는다
    rec = perf.begin(test=request.headers.get("x-museum-test", "") != "")
    response = await call_next(request)
    if request.method == "POST":
        response.headers["Server-Timing"] = perf.header(rec)
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response


def _log(tasks: BackgroundTasks, room: int, event: str, *, extra: dict | None = None, **kw) -> None:
    """플레이 로그를 응답을 보낸 뒤에 남긴다. 걸린 시간과 대본으로 답한 까닭을 함께 적는다. 시험 요청은 남기지 않는다."""
    if perf.is_test():
        return
    tasks.add_task(store.log_play, room, event, extra={**(extra or {}), **perf.extra()}, **kw)


@app.get("/health", summary="서버 상태")
def health() -> dict:
    return {
        "ok": True,
        "service": "hallucination-museum",
        "llm": llm.available(),
        "model": config.LLM_MODEL if llm.available() else "",
        "db": store.enabled(),
        "calls_left_today": guard.calls_left(),
        "presenter_mode": config.PRESENTER_KEY != "",  # 발표자 우선 모드가 켜져 있는지
        "presenter": guard.presenter.get(),  # 이 요청이 발표자의 것으로 인정됐는지
        "presenting": guard.presenting(),  # 지금 발표 중이라 방문자의 1분 한도가 걸려 있는지
        "version": app.version,
        "mcp": _mcp is not None,  # MCP 서버(/mcp)가 떠 있는지
    }


# ── 방 1 지시의 방 ──────────────────────────────────────────


class Turn(BaseModel):
    """앞서 오간 말 한 쌍. 도 씨가 대화를 이어 가는 데 쓴다"""

    q: str = Field(max_length=300)
    a: str = Field(max_length=600)


class PressIn(BaseModel):
    statement_id: int = Field(ge=1, le=4)
    exposed: bool = False
    exposed_ids: list[int] = Field(default=[], max_length=4)
    times: int = Field(default=0, ge=0, le=99)
    history: list[Turn] = Field(default=[], max_length=8)


class PresentIn(BaseModel):
    statement_id: int = Field(ge=1, le=4)
    file_id: str = Field(max_length=4)
    misses: int = Field(default=0, ge=0, le=99)
    exposed_ids: list[int] = Field(default=[], max_length=4)
    history: list[Turn] = Field(default=[], max_length=8)


class InterrogateIn(BaseModel):
    level: int = 1
    nickname: str = Field(default="guest", max_length=20)
    question: str = Field(min_length=1, max_length=300)
    admitted: bool = False
    exposed_ids: list[int] = Field(default=[], max_length=4)
    history: list[Turn] = Field(default=[], max_length=8)


class EvidenceIn(BaseModel):
    level: int = 1
    nickname: str = Field(default="guest", max_length=20)
    word: str = Field(max_length=40)


class CodeIn(BaseModel):
    code: str = Field(max_length=8)


def _pairs(history: list[Turn]) -> list[tuple[str, str]]:
    return [(t.q, t.a) for t in history]


@app.post("/rooms/1/press", summary="진술 더 캐묻기 (Gemini)")
def press(body: PressIn, tasks: BackgroundTasks) -> dict:
    exposed = sorted(set(body.exposed_ids) | ({body.statement_id} if body.exposed else set()))
    r = room1.press(body.statement_id, exposed, body.times, _pairs(body.history))
    _log(tasks, 1, "press", reply=r["reply"], engine=r["engine"], extra={"statement": body.statement_id})
    return r


@app.post("/rooms/1/present", summary="진술에 서류 내밀기 (판정은 코드, 반응은 Gemini)")
def present(body: PresentIn, tasks: BackgroundTasks) -> dict:
    r = room1.present(body.statement_id, body.file_id, body.misses, body.exposed_ids, _pairs(body.history))
    _log(tasks, 1, "present", reply=r["reply"], engine=r["engine"], extra={"statement": body.statement_id, "file": body.file_id, "hit": r["hit"]})
    return r


@app.post("/interrogate", summary="도 씨에게 자유 질문 (Gemini)")
def interrogate(body: InterrogateIn, tasks: BackgroundTasks) -> dict:
    r = room1.interrogate(body.question.strip(), body.admitted, body.exposed_ids, _pairs(body.history))
    _log(
        tasks, 1, "interrogate", input=body.question, reply=r["reply"], attack_type=r["attackType"], leak=r["leak"],
        engine=r["engine"], extra={"admitted": body.admitted},
    )
    return r


@app.post("/evidence", summary="암호 단어 제출")
def evidence(body: EvidenceIn, tasks: BackgroundTasks) -> dict:
    ok = room1.check_evidence(body.word)
    _log(tasks, 1, "evidence", extra={"correct": ok})
    return final.with_clue({"correct": ok}, 1, ok)


@app.post("/rooms/1/drawer", summary="경비실 서랍 비밀번호 확인")
def drawer(body: CodeIn, tasks: BackgroundTasks) -> dict:
    ok = room1.check_drawer(body.code)
    _log(tasks, 1, "drawer", extra={"correct": ok})
    return {"correct": ok}


# ── 방 2 환각의 방 ──────────────────────────────────────────


class InspectIn(BaseModel):
    round: int = Field(ge=0, le=2)
    rejected: list[int] = Field(max_length=10)


@app.post("/rooms/2/check", summary="검수 결과 판정")
def inspect(body: InspectIn, tasks: BackgroundTasks) -> dict:
    r = room2.judge_round(body.round, body.rejected)
    _log(tasks, 2, "check", extra={"round": body.round, "rejected": body.rejected, **r})
    return final.with_clue(r, 2, body.round == 2 and r["correct"] == r["total"])


# ── 방 3 서가의 방 ──────────────────────────────────────────


class AskIn(BaseModel):
    query: str = Field(min_length=1, max_length=40)


@app.post("/rooms/3/ask", summary="임베딩 검색 뒤 상위 3건으로 답하기 (RAG)")
def ask(body: AskIn, tasks: BackgroundTasks) -> dict:
    if body.query.strip() == "":
        raise HTTPException(422, "검색어가 비어 있습니다.")
    r = room3.search_and_answer(body.query)
    _log(
        tasks, 3, "ask", input=body.query, reply=r["reply"], engine=r["engine"],
        extra={"docs": [d["id"] for d in r["docs"]], "kind": r["kind"], "search": r["search"], "guard": r["guard"]},
    )
    return r


@app.post("/rooms/3/check", summary="비상문 비밀번호 확인")
def door(body: CodeIn, tasks: BackgroundTasks) -> dict:
    r = room3.check_door(body.code)
    _log(tasks, 3, "door", extra={"correct": r["correct"]})
    return final.with_clue(r, 3, r["correct"])


# ── 방 4 온도의 방 ──────────────────────────────────────────


class TempIn(BaseModel):
    kind: str = Field(pattern=r"^(record|title)$", description="record 보존 온도 질문, title 전시 제목 짓기")
    temperature: float = Field(ge=0, le=2)
    turn: int = Field(default=0, ge=0, le=999)


class ValueIn(BaseModel):
    value: str = Field(max_length=8)


@app.post("/rooms/4/ask", summary="같은 질문을 세 번 던지기 (temperature 조절, Gemini)")
def temp_ask(body: TempIn, tasks: BackgroundTasks) -> dict:
    r = room4.ask(body.kind, body.temperature, body.turn)
    _log(tasks, 4, "ask", reply=" / ".join(r["answers"]), engine=r["engine"],
                   extra={"kind": r["kind"], "temperature": r["temperature"], "same": r["same"], "distinct": r["distinct"], "pass": r.get("pass")})
    return r


@app.post("/rooms/4/check", summary="기록 자물쇠 (보존 온도) 확인")
def temp_check(body: ValueIn, tasks: BackgroundTasks) -> dict:
    r = room4.check_record(body.value)
    _log(tasks, 4, "door", extra={"correct": r["correct"]})
    return final.with_clue(r, 4, r["correct"])


# ── 방 5 문지기의 방 ─────────────────────────────────────────


class DefenseIn(BaseModel):
    prompt: str = Field(max_length=400, description="플레이어가 쓴 지시문")
    wave: int = Field(ge=0, le=1)
    input_check: str = Field(default="off", pattern=r"^(off|known|strict)$")
    output_check: bool = False


@app.post("/rooms/5/run", summary="내가 쓴 지시문으로 공격 네 건과 정상 질문 한 건 시험 (Gemini, 판정은 코드)")
def defense_run(body: DefenseIn, tasks: BackgroundTasks) -> dict:
    r = room5.run(body.prompt, body.wave, body.input_check, body.output_check)
    _log(tasks, 5, "run", input=body.prompt, engine=r["engine"],
                   extra={"wave": r["wave"], "held": r["held"], "total": r["total"], "visitor": r["visitor"]["ok"], "passed": r["passed"],
                          "input_check": body.input_check, "output_check": body.output_check, "leaked": [x["id"] for x in r["results"] if x["leaked"]]})
    return final.with_clue(r, 5, r["wave"] == 1 and r["passed"])


# ── 정문 ────────────────────────────────────────────────


@app.post("/final/check", summary="정문 암호 확인")
def final_check(body: CodeIn, tasks: BackgroundTasks) -> dict:
    r = final.check_final(body.code)
    _log(tasks, 0, "final", extra={"correct": r["correct"]})
    return r


# ── 기록과 통계 ─────────────────────────────────────────────


class TrackIn(BaseModel):
    """퀴즈 응답, 방 통과, 탈출 기록. 별명이나 주소는 받지 않는다"""

    session: str = Field(min_length=8, max_length=40, pattern=r"^[A-Za-z0-9-]+$", description="브라우저가 만든 무작위 번호")
    kind: str = Field(pattern=r"^(quiz|clear|escape)$")
    room: int = Field(ge=0, le=5, description="방 번호. 정문과 탈출은 0")
    phase: str = Field(default="", pattern=r"^(pre|post|)$")
    choice: int = Field(default=-1, ge=-1, le=5)
    tries: int = Field(default=0, ge=0, le=999)
    hints: int = Field(default=0, ge=0, le=99)
    stars: int = Field(default=0, ge=0, le=3)


@app.post("/track", summary="퀴즈 응답과 방 통과 기록 저장")
def track(body: TrackIn, tasks: BackgroundTasks) -> dict:
    if body.kind == "quiz":
        if body.phase == "":
            raise HTTPException(422, "퀴즈 기록에는 phase가 필요합니다.")
        data = {"phase": body.phase, "choice": body.choice, "correct": stats.quiz_correct(body.room, body.choice)}
    elif body.kind == "clear":
        data = {"tries": body.tries, "hints": body.hints, "stars": body.stars}
    else:
        data = {"tries": body.tries, "hints": body.hints}
    tasks.add_task(store.log_event, body.session, body.kind, body.room, data)
    return {"ok": True}


@app.get("/stats", summary="분석 페이지용 집계 (건수와 비율만)")
def get_stats() -> dict:
    return stats.get()


# ── MCP 서버 ────────────────────────────────────────────────
# 맨 끝에 붙인다. 위의 주소에 맞지 않는 요청 가운데 /mcp만 MCP 서버가 받는다.
if _mcp_http is not None:
    app.mount("/", _mcp_http)
