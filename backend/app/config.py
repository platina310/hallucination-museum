"""실행 설정. 값은 모두 환경변수에서 읽는다. 키는 코드에 적지 않는다."""
import os

from dotenv import load_dotenv

load_dotenv()


def _env(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


GEMINI_API_KEY = _env("GEMINI_API_KEY")
LLM_BASE_URL = _env("LLM_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai/")
# 답변 생성 키를 따로 주지 않으면 임베딩과 같은 Gemini 키를 쓴다
LLM_API_KEY = _env("LLM_API_KEY") or GEMINI_API_KEY
LLM_MODEL = _env("LLM_MODEL", "gemini-3.5-flash-lite")
LLM_REASONING = _env("LLM_REASONING", "low")
# 온도의 방만 쓰는 모델. gemini-3.5-flash-lite는 temperature를 무시해서(구글 문서, 2026-11-27 측정으로 확인)
# 다이얼을 돌려도 답이 달라지지 않는다. 이 방은 temperature를 받는 모델로 답한다
ROOM4_MODEL = _env("ROOM4_MODEL", "gemini-3.1-flash-lite")
# 이 모델은 무료 등급에서 붐빌 때 답이 늦거나 503으로 실패한다 (2026-11-27 밤 측정: 한 번에 0.5~9초, 20초 넘게 멈춘 것도 있음. 실패는 5번에 1~2번).
# 그래서 ROOM4_ASKS번을 한꺼번에 묻고 먼저 온 세 답을 쓴다. ROOM4_WAIT_SECONDS 안에 세 답이 모이지 않으면 대본으로 답하고,
# 그 뒤 ROOM4_REST_SECONDS 동안은 모델을 부르지 않고 바로 대본으로 답한다 (붐비는 동안 플레이어를 매번 기다리게 하지 않으려고)
ROOM4_ASKS = int(_env("ROOM4_ASKS", "4"))
ROOM4_WAIT_SECONDS = float(_env("ROOM4_WAIT_SECONDS", "4"))
ROOM4_REST_SECONDS = float(_env("ROOM4_REST_SECONDS", "60"))
# 온도의 방이 하루에 쓰는 호출 한도. 다른 방과 모델이 달라 몫을 따로 센다
ROOM4_DAILY_CALLS = int(_env("ROOM4_DAILY_CALLS", "600"))
# 도 씨와의 대화는 따질 것이 적어 사고 수준을 가장 낮게 둔다. 답이 빨라진다. Gemini가 아닌 모델이면 none으로 바꾼다
TALK_REASONING = _env("TALK_REASONING", "minimal")
DATABASE_URL = _env("DATABASE_URL")

EMBED_MODEL = "gemini-embedding-2"
EMBED_DIM = 768
DOC_TABLE = "room3_docs_gemini_768"

# 테스트용 가짜 모델. 1이면 바깥으로 요청을 보내지 않는다
FAKE_LLM = _env("FAKE_LLM") == "1"

# 서가의 방: 사서에게 넘기는 문서 수와, 검색에 걸린 것으로 치는 기준.
# Gemini 임베딩의 유사도는 0.5~0.8에 몰려 있어 고정된 점수로는 가를 수 없었다 (data/room3 점검 결과).
# 그래서 검색어마다 문서 12건의 평균보다 표준편차의 ROOM3_Z배 이상 가까운 문서만 걸린 것으로 친다.
TOP_K = 3
ROOM3_Z = float(_env("ROOM3_Z", "0.5"))

# 무료 등급 한도를 게임이 다 쓰지 않도록 하루 생성 호출 수를 막아 둔다. 넘으면 정해진 대본으로 답한다
GAME_DAILY_LLM_CALLS = int(_env("GAME_DAILY_LLM_CALLS", "250"))
# 한 주소가 1분에 보낼 수 있는 요청 수. 강의실처럼 여럿이 같은 와이파이를 쓰면 모두 한 주소로 보이므로 넉넉히 둔다.
# 사람이 누르는 속도로는 닿지 않고, 프로그램으로 마구 부르는 것만 막는다
RATE_PER_MINUTE = int(_env("RATE_PER_MINUTE", "600"))

# 발표자 우선 모드. PRESENTER_KEY를 넣어 두면, 같은 암호를 보낸 화면(발표자)의 요청에 Gemini 몫을 남겨 둔다.
# 그 밖의 방문자는 하루 PUBLIC_DAILY_LLM_CALLS회까지만 Gemini를 쓰고, 발표 중에는 1분 PUBLIC_LLM_PER_MINUTE회로 더 줄인다. 넘으면 대본으로 답한다.
# 비워 두거나 12자보다 짧으면 이 모드는 꺼지고 모두가 같은 한도를 쓴다.
PRESENTER_KEY = _env("PRESENTER_KEY")
if len(PRESENTER_KEY) < 12:  # 짧은 암호는 맞히기 쉬우므로 받지 않는다
    PRESENTER_KEY = ""
PUBLIC_DAILY_LLM_CALLS = int(_env("PUBLIC_DAILY_LLM_CALLS", "150"))
PUBLIC_LLM_PER_MINUTE = int(_env("PUBLIC_LLM_PER_MINUTE", "6"))
PUBLIC_EMBED_PER_MINUTE = int(_env("PUBLIC_EMBED_PER_MINUTE", "20"))
# 방문자의 1분 한도는 발표 중에만 건다. 발표자 화면의 요청이 이 시간(초) 안에 있었으면 발표 중으로 본다
PRESENTER_HOLD_SECONDS = int(_env("PRESENTER_HOLD_SECONDS", "900"))
# 요청 본문의 최대 크기. 게임의 요청은 길어야 수백 자다
MAX_BODY_BYTES = int(_env("MAX_BODY_BYTES", "20000"))
# 하루 임베딩 호출 한도. 넘으면 서가의 방과 MCP 검색이 낱말 검색으로 돈다. 같은 검색어는 다시 세지 않는다
DAILY_EMBED_CALLS = int(_env("DAILY_EMBED_CALLS", "1000"))

ALLOWED_ORIGINS = [
    o.strip()
    for o in _env(
        "ALLOWED_ORIGINS",
        "https://hallucination-museum.vercel.app,http://localhost:5173,http://localhost:4173",
    ).split(",")
    if o.strip()
]
# Vercel 미리보기 주소
ALLOWED_ORIGIN_REGEX = r"https://hallucination-museum-[a-z0-9-]+\.vercel\.app"
