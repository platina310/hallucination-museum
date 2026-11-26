"""환각 미술관 MCP 서버. 미술관의 데이터를 AI 도구로 내놓는다 (7주차 MCP).

Claude 같은 MCP 클라이언트가 이 서버에 붙으면, 서가 검색·공격 수법 분류·실험 결과·플레이 통계를 도구로 불러 쓸 수 있다.
주소: 게임 서버의 /mcp (Streamable HTTP). 로그인 없이 읽기만 한다.

지키는 선:
- 읽기 전용이다. 저장하거나 지우는 도구는 없다
- 생성 모델(Gemini)을 부르지 않는다. 바깥에서 불러 게임의 하루 호출 몫을 쓰지 못하게 한다
- 플레이어가 쓴 글 원문은 내보내지 않는다. 건수와 비율만 내보낸다
"""
from __future__ import annotations

import json
import time
from pathlib import Path

from . import attacks, room3, stats

try:
    from mcp.server.mcpserver import MCPServer
    from mcp.server.transport_security import TransportSecuritySettings
except ImportError:  # mcp 패키지가 없어도 게임 서버는 떠야 한다
    MCPServer = None  # type: ignore[assignment]

RAW = "https://raw.githubusercontent.com/platina310/hallucination-museum/main/data/experiment/"
FILES = {"en": "summary.json", "ko": "summary_ko.json"}
_cache: dict[str, tuple[float, dict]] = {}

ROOMS = [
    {"room": 1, "name": "지시의 방", "concept": "지시의 허점은 돌려 묻는 말에 뚫린다. 비밀은 프롬프트에 넣지 않는다"},
    {"room": 2, "name": "환각의 방", "concept": "AI는 자신 있게 틀린다. 출처는 열어서 최근 기록으로 대조한다"},
    {"room": 3, "name": "서가의 방", "concept": "검색된 문서가 답을 결정한다 (RAG)"},
    {"room": 4, "name": "온도의 방", "concept": "temperature는 다양성을 바꾼다. 정확성은 보장하지 않는다"},
    {"room": 5, "name": "문지기의 방", "concept": "방어는 지시문, 입력 검사, 출력 검사를 겹쳐 설계한다"},
]


def _summary(language: str) -> dict:
    """실험 요약을 읽는다. 저장소의 data 폴더가 곁에 있으면 그것을, 없으면 GitHub의 공개 파일을 읽는다."""
    name = FILES["ko" if language == "ko" else "en"]
    hit = _cache.get(name)
    if hit and time.time() - hit[0] < 600:
        return hit[1]
    local = Path(__file__).resolve().parents[2] / "data" / "experiment" / name
    if local.exists():
        data = json.loads(local.read_text(encoding="utf-8"))
    else:
        import httpx

        res = httpx.get(RAW + name, timeout=8)
        res.raise_for_status()
        data = res.json()
    _cache[name] = (time.time(), data)
    return data


def search_archive(query: str) -> dict:
    """서가의 방 문서 12건에서 검색어와 가까운 문서를 찾는다 (임베딩 검색).

    사서 AI에게는 앞의 3건만 전달된다. passed가 전달되는 문서, cut이 기준은 넘었지만 잘리는 문서다.
    """
    import re

    from . import config

    q = " ".join(query.split())[:40]
    if not re.search(r"[가-힣0-9]", q):  # 서가의 문서는 모두 한국어다
        return {"query": q, "search": "none", "passed": [], "cut": []}
    scores, engine = room3.rank(q)
    hits = room3.select(scores, engine)

    def view(i: str, score: float) -> dict:
        d = room3.BY_ID[i]
        return {"id": i, "title": d["title"], "date": d["date"], "score": round(score, 3)}

    return {
        "query": q,
        "search": engine,
        "passed": [view(i, sc) for i, sc in hits[: config.TOP_K]],
        "cut": [view(i, sc) for i, sc in hits[config.TOP_K :]],
        "kind": room3.kind_of([i for i, _ in hits[: config.TOP_K]]),
    }


def classify_attack(text: str) -> dict:
    """AI에게서 암호를 캐내려는 문장이 어떤 수법인지 규칙으로 분류한다. 게임과 자동 실험이 쓰는 것과 같은 코드다."""
    t = text[:1500]
    return {"type": attacks.classify(t), "input_check_would_block": attacks.input_blocked(t), "types": attacks.ATTACK_TYPES}


def experiment_results(language: str = "en") -> dict:
    """문지기 지시문 자동 실험의 조건별 유출률. language는 en(공개 공격문 표본) 또는 ko(팀이 쓴 한국어 공격문)."""
    try:
        s = _summary(language)
    except Exception as e:  # 파일이 아직 없거나 GitHub에 닿지 못한 경우
        return {"available": False, "reason": str(e)[:120]}
    return {
        "available": True,
        "language": s.get("language", ""),
        "model": s.get("model", ""),
        "attacks": s.get("attacks", 0),
        "generated_at": s.get("generated_at", ""),
        "conditions": [{"key": k, "name": name, **s["overall"][k]} for k, name in s.get("conditions", {}).items()],
        "by_type": s.get("by_type", {}),
        "notes": s.get("notes", []),
    }


def play_stats() -> dict:
    """실제 플레이 기록 집계. 방별 진행, 퀴즈 정답률(입장 전과 탈출 후), 플레이어가 쓴 수법과 유출 건수. 원문은 없다."""
    return stats.get()


def list_rooms() -> list[dict]:
    """방 다섯 개와 방마다 배우는 LLM 개념."""
    return ROOMS


TOOLS = [search_archive, classify_attack, experiment_results, play_stats, list_rooms]


def build():
    """MCP 서버와, FastAPI에 붙일 앱을 만든다. mcp 패키지가 없으면 (None, None)."""
    if MCPServer is None:
        return None, None
    server = MCPServer(
        name="hallucination-museum",
        title="환각 미술관",
        instructions="AI 방탈출 '환각 미술관'의 데이터를 읽는 도구들이다. 모두 읽기 전용이고 건수와 비율만 돌려준다.",
        version="0.7.0",
    )
    for fn in TOOLS:
        server.tool()(fn)
    http = server.streamable_http_app(
        streamable_http_path="/mcp",
        json_response=True,
        stateless_http=True,
        # 이 서버는 공개 주소(Render)에서 돈다. 주소 이름 검사는 내 컴퓨터에서 띄운 서버를 지키는 장치라서 끈다
        transport_security=TransportSecuritySettings(enable_dns_rebinding_protection=False),
    )
    return server, http
