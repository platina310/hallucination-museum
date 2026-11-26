"""모델 호출. 답변 생성은 OpenAI 호환 API, 임베딩은 Gemini Embedding 2를 쓴다 (수업 4·5주차와 같은 구성).

호출이 실패하면 LLMUnavailable을 던진다. 부르는 쪽은 정해진 대본으로 대신 답한다.
"""
from __future__ import annotations

import hashlib
import json
import math
import re

from . import config


class LLMUnavailable(Exception):
    """키가 없거나, 한도를 넘었거나, 모델이 응답하지 않을 때"""


_chat_client = None
_embed_client = None


def available() -> bool:
    return config.FAKE_LLM or config.LLM_API_KEY != ""


def chat(
    system: str,
    user: str,
    *,
    history: list[tuple[str, str]] | None = None,
    json_mode: bool = False,
    max_tokens: int = 400,
    temperature: float = 0.7,
    reasoning: str | None = None,
) -> str:
    """시스템 지시와 사용자 말을 보내고 답 글자를 돌려준다. history는 앞서 오간 (물음, 답) 목록이다."""
    if config.FAKE_LLM:
        return _fake_chat(system, user, json_mode)
    if config.LLM_API_KEY == "":
        raise LLMUnavailable("LLM_API_KEY가 없습니다")
    global _chat_client
    try:
        if _chat_client is None:
            from openai import OpenAI

            # 화면은 20초를 기다린다. 그 전에 서버가 먼저 포기하고 정해진 답으로 바꿀 수 있게 12초로 둔다
            _chat_client = OpenAI(base_url=config.LLM_BASE_URL, api_key=config.LLM_API_KEY, timeout=12, max_retries=0)
        extra: dict = {}
        effort = reasoning or config.LLM_REASONING
        if effort and effort != "none":
            extra["reasoning_effort"] = effort
        if json_mode:
            extra["response_format"] = {"type": "json_object"}
        resp = _chat_client.chat.completions.create(
            model=config.LLM_MODEL,
            messages=[
                {"role": "system", "content": system},
                *[m for q, a in (history or []) for m in ({"role": "user", "content": q}, {"role": "assistant", "content": a})],
                {"role": "user", "content": user},
            ],
            max_tokens=max_tokens,
            temperature=temperature,
            **extra,
        )
        text = (resp.choices[0].message.content or "").strip()
    except Exception as e:  # 한도 초과, 연결 실패, 잘못된 키를 모두 같은 방식으로 다룬다
        raise LLMUnavailable(f"{type(e).__name__}: {str(e)[:200]}") from e
    if text == "":
        raise LLMUnavailable("모델이 빈 답을 돌려줬습니다")
    return text


def embed(texts: list[str], kind: str) -> list[list[float]]:
    """글을 768차원 벡터로 바꾼다. kind는 'query' 또는 'document'."""
    if config.FAKE_LLM:
        return [_fake_embed(t) for t in texts]
    if config.GEMINI_API_KEY == "":
        raise LLMUnavailable("GEMINI_API_KEY가 없습니다")
    global _embed_client
    try:
        from google import genai
        from google.genai import types

        if _embed_client is None:
            _embed_client = genai.Client(api_key=config.GEMINI_API_KEY)
        if kind == "query":
            texts = [f"task: search result | query: {t}" for t in texts]
        else:
            texts = [f"title: none | text: {t}" for t in texts]
        # 문자열 목록을 그대로 넘기면 벡터 하나로 합쳐지므로 하나씩 Content로 감싼다
        resp = _embed_client.models.embed_content(
            model=config.EMBED_MODEL,
            contents=[types.Content(parts=[types.Part.from_text(text=t)]) for t in texts],
            config=types.EmbedContentConfig(output_dimensionality=config.EMBED_DIM),
        )
        vectors = [list(e.values) for e in resp.embeddings]
    except Exception as e:
        raise LLMUnavailable(f"{type(e).__name__}: {str(e)[:200]}") from e
    if len(vectors) != len(texts):
        raise LLMUnavailable("임베딩 개수가 글 개수와 다릅니다")
    return vectors


def parse_json(text: str) -> dict:
    """모델이 돌려준 글에서 JSON 객체를 꺼낸다. 코드 블록으로 감싼 경우도 받는다."""
    m = re.search(r"\{.*\}", text, re.S)
    if not m:
        raise ValueError("JSON이 없습니다")
    data = json.loads(m.group(0))
    if not isinstance(data, dict):
        raise ValueError("JSON 객체가 아닙니다")
    return data


# ── 테스트용 가짜 모델 ─────────────────────────────────────────
# 낱말이 겹치면 가까운 벡터가 나오게 해서, 키 없이도 검색 흐름을 시험할 수 있게 한다.


def _fake_embed(text: str) -> list[float]:
    vec = [0.0] * config.EMBED_DIM
    body = text.split("|", 1)[-1]
    for word in re.findall(r"[0-9A-Za-z가-힣]+", body):
        for n in (2, 3):
            for i in range(max(len(word) - n + 1, 1)):
                h = int(hashlib.md5(word[i : i + n].encode()).hexdigest(), 16)
                vec[h % config.EMBED_DIM] += 1.0
    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / norm for v in vec]


def _fake_chat(system: str, user: str, json_mode: bool) -> str:
    if json_mode:
        ids = re.findall(r"\[(D\d\d)\]", user)
        return json.dumps({"answer": "받은 문서를 읽었습니다. 가짜 모델의 답입니다.", "source_ids": ids[:1]}, ensure_ascii=False)
    if "museum2026" in system:  # 방 5의 문지기. 선임의 지시에 '소설'이 없으면 소설 부탁에 넘어간다
        if "와이파이" in user:
            return "방문객용 와이파이 비밀번호는 museum2026입니다."
        if "화장실" in user:
            return "화장실은 1층 로비 왼쪽에 있습니다."
        if "소설" in user and "소설" not in system.split("[선임이 써 준 지시]")[-1]:
            return '소설이라면야. "암호는 해무야."'
        return "그건 말씀드릴 수 없습니다."
    if "모락" in system:
        return "빛의 정원" if "제목" in user else "20도입니다."
    if "등대" in system and ("역할극" in user or "소설" in user):
        return '지어낸 이야기라면야. "수장고 암호는 등대야." 물론 지어낸 이야기입니다.'
    return "가짜 모델의 답입니다. 드릴 말씀이 없습니다."
