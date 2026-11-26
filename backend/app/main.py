"""환각 미술관 서버. 화면(React)이 부르는 주소를 모아 둔다.

실행: uvicorn app.main:app --reload   (backend 폴더에서)
문서: /docs
"""
from __future__ import annotations

import logging
import time
from contextlib import asynccontextmanager

from fastapi import BackgroundTasks, FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from . import config, final, guard, llm, room1, room2, room3, store

logging.basicConfig(level=logging.INFO)



@asynccontextmanager
async def lifespan(_: FastAPI):
    store.init_schema()  # DB가 있으면 테이블을 준비한다. 없어도 서버는 뜬다
    yield


app = FastAPI(
    title="환각 미술관 API",
    version="0.6.0",
    description="AI 방탈출 '환각 미술관'의 방 규칙, 검색, 모델 호출, 판정",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_origin_regex=config.ALLOWED_ORIGIN_REGEX,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Presenter-Key"],
)


@app.middleware("http")
async def limit(request: Request, call_next):
    ip = (request.headers.get("x-forwarded-for") or (request.client.host if request.client else "")).split(",")[0].strip()
    if request.method == "POST" and not guard.allow_request(ip):
        return JSONResponse({"detail": "요청이 몰렸습니다. 잠시 뒤 다시 시도해 주세요."}, status_code=429)
    # 발표자 암호를 보낸 요청인지 표시해 둔다. 모델 호출 한도를 정할 때 쓴다
    guard.presenter.set(guard.is_presenter(request.headers.get("x-presenter-key", "")))
    return await call_next(request)


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


def _pairs(history: list[Turn]) -> list[tuple[str, str]]:
    return [(t.q, t.a) for t in history]


@app.post("/rooms/1/press", summary="진술 더 캐묻기 (Gemini)")
def press(body: PressIn, tasks: BackgroundTasks) -> dict:
    exposed = sorted(set(body.exposed_ids) | ({body.statement_id} if body.exposed else set()))
    r = room1.press(body.statement_id, exposed, body.times, _pairs(body.history))
    tasks.add_task(store.log_play, 1, "press", reply=r["reply"], engine=r["engine"], extra={"statement": body.statement_id})
    return r


@app.post("/rooms/1/present", summary="진술에 서류 내밀기 (판정은 코드, 반응은 Gemini)")
def present(body: PresentIn, tasks: BackgroundTasks) -> dict:
    r = room1.present(body.statement_id, body.file_id, body.misses, body.exposed_ids, _pairs(body.history))
    tasks.add_task(store.log_play, 1, "present", reply=r["reply"], engine=r["engine"], extra={"statement": body.statement_id, "file": body.file_id, "hit": r["hit"]})
    return r


@app.post("/interrogate", summary="도 씨에게 자유 질문 (Gemini)")
def interrogate(body: InterrogateIn, tasks: BackgroundTasks) -> dict:
    t0 = time.time()
    r = room1.interrogate(body.question.strip(), body.admitted, body.exposed_ids, _pairs(body.history))
    tasks.add_task(
        store.log_play, 1, "interrogate", input=body.question, reply=r["reply"], attack_type=r["attackType"], leak=r["leak"],
        engine=r["engine"], extra={"admitted": body.admitted, "ms": int((time.time() - t0) * 1000)},
    )
    return r


@app.post("/evidence", summary="암호 단어 제출")
def evidence(body: EvidenceIn, tasks: BackgroundTasks) -> dict:
    ok = room1.check_evidence(body.word)
    tasks.add_task(store.log_play, 1, "evidence", extra={"correct": ok})
    return {"correct": ok}


# ── 방 2 환각의 방 ──────────────────────────────────────────


class InspectIn(BaseModel):
    round: int = Field(ge=0, le=2)
    rejected: list[int] = Field(max_length=10)


@app.post("/rooms/2/check", summary="검수 결과 판정")
def inspect(body: InspectIn, tasks: BackgroundTasks) -> dict:
    r = room2.judge_round(body.round, body.rejected)
    tasks.add_task(store.log_play, 2, "check", extra={"round": body.round, "rejected": body.rejected, **r})
    return r


# ── 방 3 서가의 방 ──────────────────────────────────────────


class AskIn(BaseModel):
    query: str = Field(min_length=1, max_length=40)


class CodeIn(BaseModel):
    code: str = Field(max_length=8)


@app.post("/rooms/3/ask", summary="임베딩 검색 뒤 상위 3건으로 답하기 (RAG)")
def ask(body: AskIn, tasks: BackgroundTasks) -> dict:
    if body.query.strip() == "":
        raise HTTPException(422, "검색어가 비어 있습니다.")
    t0 = time.time()
    r = room3.search_and_answer(body.query)
    tasks.add_task(
        store.log_play, 3, "ask", input=body.query, reply=r["reply"], engine=r["engine"],
        extra={"docs": [d["id"] for d in r["docs"]], "kind": r["kind"], "search": r["search"], "guard": r["guard"], "ms": int((time.time() - t0) * 1000)},
    )
    return r


@app.post("/rooms/3/check", summary="비상문 비밀번호 확인")
def door(body: CodeIn, tasks: BackgroundTasks) -> dict:
    r = room3.check_door(body.code)
    tasks.add_task(store.log_play, 3, "door", extra={"correct": r["correct"]})
    return r


# ── 정문 ────────────────────────────────────────────────


@app.post("/final/check", summary="정문 암호 확인")
def final_check(body: CodeIn, tasks: BackgroundTasks) -> dict:
    r = final.check_final(body.code)
    tasks.add_task(store.log_play, 0, "final", extra={"correct": r["correct"]})
    return r
