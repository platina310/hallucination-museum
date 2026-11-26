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
RATE_PER_MINUTE = int(_env("RATE_PER_MINUTE", "30"))

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
