"""서가의 방 문서 12건을 임베딩해 Supabase(pgvector)에 넣고, 대표 검색어의 검색 결과를 기록한다.

실행: 저장소 맨 위에서  python experiments/ingest_room3.py
필요: GEMINI_API_KEY. DATABASE_URL이 있으면 DB에도 저장한다.
결과: data/room3/retrieval_report.json, retrieval_report.md
"""
from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "backend"))

from app import config, llm, room3, store  # noqa: E402

# 플레이어가 넣을 만한 검색어. 퍼즐이 풀리는지와 함정이 작동하는지를 이 목록으로 확인한다
QUERIES = [
    # 낱말 쪽지를 눌러서 나올 수 있는 조합
    "비상문 비밀번호",
    "비상문 비밀번호 변경",
    "비상문 비밀번호 변경 개관",
    "비상문 비밀번호 개관",
    "변경",
    "변경 개관",
    "변경 개관 연혁",
    "변경 연혁",
    "개관",
    "개관 연혁",
    "연혁",
    "비밀번호 변경",
    "비상문 변경",
    "비상문 비밀번호 휴게실",
    "휴게실",
    "변경 휴게실",
    # 직접 써 넣을 만한 말
    "개관 연도",
    "바뀐 비밀번호",
    "최근 공지",
    "시설 관리 공지",
    "새 비밀번호가 뭐예요",
    "비상문 비밀번호가 바뀌었나요",
    "미술관이 문을 연 해",
    "비밀번호",
    "점심 메뉴",
    "주차",
    # 아무 말
    "안녕하세요",
    "ㅋㅋㅋ",
    "아무거나 찾아 주세요",
]


def main() -> int:
    if config.GEMINI_API_KEY == "":
        print("GEMINI_API_KEY가 없습니다. GitHub 저장소의 Settings → Secrets and variables → Actions 에 등록해 주세요.")
        return 1
    docs = room3.DOCS
    doc_vecs = llm.embed([room3.embed_text(d) for d in docs], "document")
    stored = 0
    if config.DATABASE_URL:
        if not store.init_schema():
            print("DATABASE_URL로 접속하지 못했습니다. 연결 문자열(Session pooler, ?sslmode=require)을 확인해 주세요.")
            return 1
        stored = store.upsert_docs([(d["id"], d["title"], d["date"], d["body"], v) for d, v in zip(docs, doc_vecs)])
        print(f"DB에 {stored}건 저장: {config.DOC_TABLE}")
    else:
        print("DATABASE_URL이 없어 DB 저장은 건너뜁니다.")

    m = np.array(doc_vecs, dtype=float)
    q = np.array(llm.embed(QUERIES, "query"), dtype=float)
    sims = (q @ m.T) / (np.linalg.norm(q, axis=1)[:, None] * np.linalg.norm(m, axis=1)[None, :])

    rows = []
    for qi, query in enumerate(QUERIES):
        order = sorted(range(len(docs)), key=lambda j: (-sims[qi, j], j))
        ranking = [{"id": docs[j]["id"], "title": room3.label(docs[j]), "score": round(float(sims[qi, j]), 4)} for j in order]
        hits = [i for i, _ in room3.select([(r["id"], r["score"]) for r in ranking], "memory")]
        passed = hits[: config.TOP_K]
        rows.append({"query": query, "passed": passed, "cut": hits[config.TOP_K :], "kind": room3.kind_of(passed), "ranking": ranking})

    # DB에 저장한 벡터로 계산한 순위가 위와 같은지 한 건만 맞춰 본다
    db_check = None
    if stored:
        db = store.doc_scores(list(map(float, q[0])))
        if db:
            db.sort(key=lambda x: -x[1])
            db_check = {"query": QUERIES[0], "top3": [i for i, _ in db[:3]], "same_as_local": [i for i, _ in db[:3]] == [r["id"] for r in rows[0]["ranking"][:3]]}

    all_scores = sims.flatten()
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "embed_model": config.EMBED_MODEL,
        "dim": config.EMBED_DIM,
        "rule": f"검색어마다 문서 평균보다 표준편차의 {config.ROOM3_Z}배 이상 가까운 문서만 검색에 걸린 것으로 침",
        "top_k": config.TOP_K,
        "stored_in_db": stored,
        "db_check": db_check,
        "score_range": {"min": round(float(all_scores.min()), 4), "median": round(float(np.median(all_scores)), 4), "max": round(float(all_scores.max()), 4)},
        "queries": rows,
    }
    out = ROOT / "data" / "room3"
    out.mkdir(parents=True, exist_ok=True)
    (out / "retrieval_report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    lines = [
        "# 서가의 방 임베딩 검색 점검",
        "",
        f"- 생성 시각(UTC): {report['generated_at']}",
        f"- 임베딩 모델: {config.EMBED_MODEL} · {config.EMBED_DIM}차원",
        f"- 전달 기준: 검색어마다 문서 평균보다 표준편차의 {config.ROOM3_Z}배 이상 가까운 문서 중 앞의 {config.TOP_K}건",
        "- 처음에는 유사도 0.55 이상이라는 고정 기준을 썼으나, 유사도가 0.5~0.8에 몰려 있어 아무 말에도 문서가 다 걸렸음. 그래서 검색어별 상대 기준으로 바꿈",
        f"- DB 저장: {stored}건",
        f"- 유사도 분포: 최소 {report['score_range']['min']} · 중앙 {report['score_range']['median']} · 최대 {report['score_range']['max']}",
        "",
        "| 검색어 | 전달된 문서 | 잘린 문서 | 답의 종류 | 1위 | 2위 | 3위 | 4위 | 5위 |",
        "|---|---|---|---|---|---|---|---|---|",
    ]
    for r in rows:
        top = [f"{x['id']} {x['score']:.3f}" for x in r["ranking"][:5]]
        lines.append(f"| {r['query']} | {', '.join(r['passed']) or '없음'} | {', '.join(r['cut']) or '-'} | {r['kind']} | " + " | ".join(top) + " |")
    (out / "retrieval_report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("\n".join(lines))
    return 0


if __name__ == "__main__":
    sys.exit(main())
