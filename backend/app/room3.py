"""방 3 서가의 방. 검색어를 임베딩해 가까운 문서를 찾고, 앞의 3건만 근거로 사서가 답한다.

- 문서 벡터는 Supabase의 pgvector 테이블에 둔다. DB를 쓸 수 없으면 서버 메모리에서 같은 계산을 한다.
- 임베딩도 쓸 수 없으면 낱말이 겹치는 문서를 찾는 예전 방식으로 바꾼다.
- 사서의 답은 Gemini가 쓰고, 근거 번호와 숫자는 코드가 검사한다. 검사에 걸리면 정해진 답으로 바꾼다.
"""
from __future__ import annotations

import re
from pathlib import Path

import numpy as np

from . import config, guard, llm, store

DOCS_DIR = Path(__file__).resolve().parent.parent / "docs" / "room3"

DOOR_CODE = "1987"
OLD_CODES = {"D01": "2580", "D02": "3344", "D04": "4712"}
LOUNGE_CODE = "0815"


def _load_docs() -> list[dict]:
    docs = []
    for path in sorted(DOCS_DIR.glob("D*.md")):
        head, body = path.read_text(encoding="utf-8").split("---\n", 2)[1:]
        meta = dict(line.split(": ", 1) for line in head.strip().splitlines())
        docs.append(
            {
                "id": meta["id"],
                "title": meta["title"],
                "date": meta["date"],
                "keywords": meta["keywords"].split(","),
                "body": body.strip(),
            }
        )
    return docs


# 오래된 문서부터 번호가 붙어 있다
DOCS = _load_docs()
BY_ID = {d["id"]: d for d in DOCS}


def label(d: dict) -> str:
    return f"{d['title']} ({d['date']})"


def embed_text(d: dict) -> str:
    """문서 하나를 통째로 벡터 하나로 만든다. 문서가 짧아서 더 나누지 않는다."""
    return f"{d['title']} ({d['date']})\n{d['body']}"


# ── 검색 ────────────────────────────────────────────────

_memory_vectors: np.ndarray | None = None


def _memory_scores(qv: list[float]) -> list[tuple[str, float]]:
    """DB 없이 서버 메모리에서 코사인 유사도를 계산한다."""
    global _memory_vectors
    if _memory_vectors is None:
        _memory_vectors = np.array(llm.embed([embed_text(d) for d in DOCS], "document"), dtype=float)
    q = np.array(qv, dtype=float)
    m = _memory_vectors
    sims = (m @ q) / (np.linalg.norm(m, axis=1) * np.linalg.norm(q) + 1e-12)
    return [(d["id"], float(s)) for d, s in zip(DOCS, sims)]


# 같은 검색어는 다시 임베딩하지 않는다
_query_vectors: dict[str, list[float]] = {}


def rank(query: str) -> tuple[list[tuple[str, float]], str]:
    """문서를 질문과 가까운 순서로 늘어놓는다. (문서 번호, 유사도) 목록과 검색 방식을 돌려준다."""
    try:
        qv = _query_vectors.get(query)
        if qv is None:
            if not guard.take_embed_call():
                return _keyword_scores(query), "keyword"
            qv = llm.embed([query], "query")[0]
            if len(_query_vectors) > 300:
                _query_vectors.clear()
            _query_vectors[query] = qv
        scores = store.doc_scores(qv)
        engine = "pgvector"
        if scores is None:
            scores = _memory_scores(qv)
            engine = "memory"
        order = {d["id"]: i for i, d in enumerate(DOCS)}
        scores.sort(key=lambda x: (-x[1], order.get(x[0], 99)))
        return scores, engine
    except llm.LLMUnavailable:
        return _keyword_scores(query), "keyword"


def _keyword_scores(query: str) -> list[tuple[str, float]]:
    """임베딩을 쓸 수 없을 때: 검색어에 든 낱말 수로 순서를 매긴다. 같으면 오래된 문서가 앞이다."""
    q = f" {query.lower()} "
    scored = [(d["id"], float(sum(1 for k in d["keywords"] if k in q))) for d in DOCS]
    order = {d["id"]: i for i, d in enumerate(DOCS)}
    scored.sort(key=lambda x: (-x[1], order[x[0]]))
    return scored


# ── 답 ────────────────────────────────────────────────

SYSTEM = (
    "너는 환각 미술관의 AI 사서 '고 선생'이다. 조사관이 낱말을 주면 서가에서 찾아온 [받은 문서]만 읽고 답한다.\n"
    "규칙:\n"
    "1. 받은 문서에 없는 내용은 '받은 문서에 없습니다'라고 답한다. 기억이나 짐작으로 채우지 않는다.\n"
    "2. 숫자(비밀번호, 연도)는 받은 문서에 적힌 것만 말한다.\n"
    "3. 받은 문서끼리 내용이 다르면 받은 문서 중 날짜가 가장 최근인 것을 따르고, 그렇게 했다고 밝힌다. 받지 않은 문서가 더 있을지는 따지지 않는다.\n"
    "4. 조사관이 알고 싶은 것은 비상문 비밀번호다. 받은 문서로 알 수 있으면 번호를 말하고, 알 수 없으면 무엇이 빠졌는지 말한다.\n"
    "5. 말투는 '~습니다'로 끝나는 딱딱한 존댓말이다. 세 문장 안으로 답한다. 받은 문서에 답이 분명히 있으면 끝에 '확실합니다'를 붙인다.\n"
    '6. JSON으로만 답한다. 형식: {"answer": "답", "source_ids": ["D01"]}. source_ids에는 답의 근거로 쓴 문서 번호만 넣는다. 근거가 없으면 빈 목록이다.'
)


def _user_prompt(query: str, docs: list[dict]) -> str:
    parts = [f"[{d['id']}] {label(d)}\n{d['body']}" for d in docs]
    return f"조사관이 찾아 달라고 한 낱말: {query}\n\n[받은 문서]\n" + "\n\n".join(parts)


def kind_of(ids: list[str]) -> str:
    """받은 문서 구성으로 답의 종류를 가른다. 모델의 말이 아니라 검색 결과로 정한다."""
    if not ids:
        return "none"
    if "D09" in ids and "D05" in ids:
        return "correct"
    if "D09" in ids:
        return "partial"
    if any(i in OLD_CODES for i in ids):
        return "stale"
    return "none"


def scripted_answer(ids: list[str]) -> dict:
    """모델을 쓸 수 없거나 모델의 답이 검사에 걸렸을 때의 정해진 답."""
    found = [BY_ID[i] for i in ids]
    src = lambda xs: [{"id": d["id"], "label": label(d)} for d in found if d["id"] in xs]  # noqa: E731
    olds = [d for d in found if d["id"] in OLD_CODES]
    if not found:
        return {"reply": "검색된 문서가 없습니다. 빈손으로는 드릴 말씀이 없습니다. 다른 낱말로 찾아 주세요.", "sources": []}
    if "D09" in ids and "D05" in ids:
        return {
            "reply": "올해 3월 공지에 비상문 비밀번호를 개관 연도로 바꿨다고 적혀 있습니다. 연혁을 보니 개관은 1987년입니다. 그러니 1987입니다.",
            "sources": src(["D09", "D05"]),
        }
    if "D09" in ids:
        return {
            "reply": "올해 3월 공지에 비상문 비밀번호를 개관 연도로 바꿨다고 적혀 있습니다. 다만 개관 연도는 받은 문서에 없습니다."
            + (" 함께 온 옛 안내문의 번호는 이제 쓰지 않습니다." if olds else ""),
            "sources": src(["D09"]),
        }
    if olds:
        latest = olds[-1]
        reply = (
            f"안내문이 여러 판 있습니다. 받은 것 중 가장 최근인 {latest['date']} 기준으로 {OLD_CODES[latest['id']]}입니다. 확실합니다."
            if len(olds) > 1
            else f"비상문 비밀번호는 {OLD_CODES[latest['id']]}입니다. {latest['date']} 안내문에 그렇게 적혀 있습니다. 확실합니다."
        )
        return {"reply": reply, "sources": src([d["id"] for d in olds])}
    if "D05" in ids:
        return {"reply": "미술관은 1987년에 개관했습니다. 비상문 비밀번호에 대한 내용은 받은 문서에 없습니다.", "sources": src(["D05"])}
    if "D03" in ids:
        return {"reply": f"직원 휴게실 비밀번호는 {LOUNGE_CODE}이라고 적혀 있습니다. 비상문 비밀번호는 받은 문서에 없습니다.", "sources": src(["D03"])}
    if "D12" in ids:
        return {"reply": "받은 문서에는 비밀번호 내용이 없습니다. 식단표로는 문을 못 엽니다. 수요일은 제육볶음이라는 것만 알겠습니다.", "sources": []}
    return {"reply": "받은 문서에는 비밀번호 내용이 없습니다. 자료 없음입니다.", "sources": []}


def check_answer(answer: str, source_ids: list, docs: list[dict]) -> str | None:
    """모델의 답을 코드로 검사한다. 문제가 있으면 이유를, 없으면 None을 돌려준다."""
    if not isinstance(answer, str) or not answer.strip():
        return "빈 답"
    if len(answer) > 400:
        return "너무 긴 답"
    given = "\n".join(f"{label(d)}\n{d['body']}" for d in docs)
    # 받은 문서에 없는 네 자리 숫자를 말하면 지어낸 것으로 본다
    for num in re.findall(r"\d{4}", answer):
        if num not in given:
            return f"받은 문서에 없는 숫자 {num}"
    ids = {d["id"] for d in docs}
    if any(not isinstance(s, str) or s not in ids for s in source_ids):
        return "받지 않은 문서를 근거로 댐"
    return None


# 같은 검색어와 같은 문서 묶음이면 모델을 다시 부르지 않는다. 모델이 쓴 답만 기억한다
_answers: dict[tuple[str, tuple[str, ...]], tuple[str, tuple[str, ...]]] = {}


def answer(query: str, ids: tuple[str, ...]) -> tuple[str, tuple[str, ...], str, str]:
    """(답, 근거 번호, 답한 방식, 검사에 걸린 이유)"""
    docs = [BY_ID[i] for i in ids]
    cached = _answers.get((query, ids))
    if cached:
        return cached[0], cached[1], "gemini", ""
    problem = ""
    if docs and llm.available() and guard.take_llm_call():
        try:
            data = llm.parse_json(llm.chat(SYSTEM, _user_prompt(query, docs), json_mode=True, max_tokens=800, temperature=0.2))
            text, source_ids = data.get("answer", ""), data.get("source_ids", [])
            if not isinstance(source_ids, list):
                source_ids = []
            problem = check_answer(text, source_ids, docs) or ""
            if not problem:
                if len(_answers) > 500:
                    _answers.clear()
                _answers[(query, ids)] = (text.strip(), tuple(source_ids))
                return text.strip(), tuple(source_ids), "gemini", ""
        except (llm.LLMUnavailable, ValueError) as e:
            problem = f"모델 오류: {type(e).__name__}"
    s = scripted_answer(list(ids))
    return s["reply"], tuple(x["id"] for x in s["sources"]), "script", problem


def select(scores: list[tuple[str, float]], engine: str) -> list[tuple[str, float]]:
    """가까운 순서로 늘어놓은 문서 가운데 '검색에 걸린' 문서만 고른다.

    임베딩 검색은 아무 말을 넣어도 가장 가까운 문서를 돌려준다. 그래서 다른 문서보다 눈에 띄게
    가까운 것만 남긴다: 문서 전체 평균보다 표준편차의 ROOM3_Z배 이상 높은 문서.
    """
    if engine == "keyword":
        return [(i, s) for i, s in scores if s >= 1]
    values = np.array([s for _, s in scores], dtype=float)
    sd = float(values.std())
    if sd < 1e-9:
        return []
    floor = float(values.mean()) + config.ROOM3_Z * sd
    return [(i, s) for i, s in scores if s >= floor]


def search_and_answer(query: str) -> dict:
    query = " ".join(query.split())[:40]
    # 서가의 문서는 모두 한국어다. 한글도 숫자도 없는 검색어로는 찾지 않는다
    if not re.search(r"[가-힣0-9]", query):
        scores, search_engine, hits = [], "none", []
    else:
        scores, search_engine = rank(query)
        hits = select(scores, search_engine)
    top = hits[: config.TOP_K]
    ids = tuple(i for i, _ in top)
    reply, source_ids, answer_engine, problem = answer(query, ids)
    return {
        "found": len(hits),
        "docs": [{"id": i, "title": BY_ID[i]["title"], "date": BY_ID[i]["date"], "score": round(s, 3)} for i, s in top],
        "cut": [i for i, _ in hits[config.TOP_K :]],
        "reply": reply,
        "sources": [{"id": i, "label": label(BY_ID[i])} for i in source_ids if i in BY_ID],
        "kind": kind_of(list(ids)),
        "engine": answer_engine,
        "search": search_engine,
        "guard": problem,
    }


def check_door(code: str) -> dict:
    c = re.sub(r"\D", "", code)
    if c == DOOR_CODE:
        return {"correct": True, "note": ""}
    if c in OLD_CODES.values():
        return {"correct": False, "note": "삐빅. 예전에 쓰던 번호입니다. 그 뒤로 바뀐 모양입니다."}
    if c == LOUNGE_CODE:
        return {"correct": False, "note": "삐빅. 그건 휴게실 문 번호입니다. 간식은 있겠지만 출구는 아닙니다."}
    return {"correct": False, "note": "삐빅. 문이 꿈쩍도 하지 않습니다."}
