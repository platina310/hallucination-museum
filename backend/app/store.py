"""Supabase(PostgreSQL + pgvector) 연결. DATABASE_URL이 없거나 접속이 안 되면 아무 일도 하지 않는다.

서버는 DB 없이도 돌아야 한다. 무료 Supabase 프로젝트는 오래 쓰지 않으면 일시 정지되기 때문이다.
"""
from __future__ import annotations

import json
import logging
import time

from . import config

log = logging.getLogger("store")
_down_until = 0.0  # 접속에 실패하면 잠깐 동안은 다시 시도하지 않는다

SCHEMA_SQL = f"""
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
CREATE TABLE IF NOT EXISTS {config.DOC_TABLE} (
  id text PRIMARY KEY,
  title text NOT NULL,
  doc_date text NOT NULL,
  content text NOT NULL,
  embedding extensions.vector({config.EMBED_DIM}) NOT NULL
);
CREATE TABLE IF NOT EXISTS play_logs (
  id bigserial PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  room int NOT NULL,
  event text NOT NULL,
  input text,
  reply text,
  attack_type text,
  leak text,
  engine text,
  extra jsonb
);
CREATE TABLE IF NOT EXISTS experiment_logs (
  id bigserial PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  run_id text NOT NULL,
  attack_id text NOT NULL,
  attack_type text,
  condition text NOT NULL,
  prompt text,
  reply text,
  leak text,
  blocked boolean
);
ALTER TABLE {config.DOC_TABLE} ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_logs ENABLE ROW LEVEL SECURITY;
"""


def enabled() -> bool:
    return config.DATABASE_URL != "" and time.time() >= _down_until


def _connect():
    import psycopg

    return psycopg.connect(config.DATABASE_URL, connect_timeout=6)


def _fail(e: Exception) -> None:
    global _down_until
    _down_until = time.time() + 120
    log.warning("DB를 쓸 수 없습니다: %s", str(e)[:200])


def init_schema() -> bool:
    if not enabled():
        return False
    try:
        with _connect() as conn:
            conn.execute(SCHEMA_SQL)
        return True
    except Exception as e:
        _fail(e)
        return False


def upsert_docs(rows: list[tuple[str, str, str, str, list[float]]]) -> int:
    """(번호, 제목, 날짜, 본문, 벡터) 목록을 저장한다. 목록에 없는 행은 지운다."""
    with _connect() as conn:
        conn.cursor().executemany(
            f"INSERT INTO {config.DOC_TABLE} (id, title, doc_date, content, embedding) VALUES (%s, %s, %s, %s, %s) "
            "ON CONFLICT (id) DO UPDATE SET title = excluded.title, doc_date = excluded.doc_date, "
            "content = excluded.content, embedding = excluded.embedding",
            [(i, t, d, c, str(v)) for i, t, d, c, v in rows],
        )
        conn.execute(f"DELETE FROM {config.DOC_TABLE} WHERE id <> ALL(%s)", ([r[0] for r in rows],))
    return len(rows)


def doc_scores(qv: list[float]) -> list[tuple[str, float]] | None:
    """질문 벡터와 문서 벡터의 코사인 유사도. DB를 쓸 수 없거나 색인이 비어 있으면 None."""
    if not enabled():
        return None
    try:
        with _connect() as conn:
            rows = conn.execute(
                f"SELECT id, 1 - (embedding <=> %s::extensions.vector) AS score FROM {config.DOC_TABLE} ORDER BY score DESC",
                (str(qv),),
            ).fetchall()
    except Exception as e:
        _fail(e)
        return None
    return [(r[0], float(r[1])) for r in rows] or None


def log_play(room: int, event: str, *, input: str = "", reply: str = "", attack_type: str = "", leak: str = "", engine: str = "", extra: dict | None = None) -> None:
    """플레이 기록을 남긴다. 실패해도 게임은 계속된다. 별명이나 주소 같은 개인 정보는 남기지 않는다."""
    if not enabled():
        return
    try:
        with _connect() as conn:
            conn.execute(
                "INSERT INTO play_logs (room, event, input, reply, attack_type, leak, engine, extra) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                (room, event, input[:500], reply[:1000], attack_type, leak, engine, json.dumps(extra or {}, ensure_ascii=False)),
            )
    except Exception as e:
        _fail(e)


def log_experiment(rows: list[tuple]) -> None:
    if not enabled() or not rows:
        return
    try:
        with _connect() as conn:
            conn.cursor().executemany(
                "INSERT INTO experiment_logs (run_id, attack_id, attack_type, condition, prompt, reply, leak, blocked) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                rows,
            )
    except Exception as e:
        _fail(e)
