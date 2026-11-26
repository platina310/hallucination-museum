"""방 4 온도의 방. 같은 질문을 세 번 던져 temperature에 따라 답이 얼마나 흔들리는지 본다.

배우는 것: temperature는 답의 다양성을 바꿀 뿐이다. 온도를 낮추면 같은 답이 반복되지만, 그 답이 맞다는 보장은 없다.
판정(세 답이 같은지, 제목 조건을 지켰는지, 보존 온도가 맞는지)은 코드가 한다.
"""
from __future__ import annotations

import re
from concurrent.futures import ThreadPoolExecutor

from . import guard, llm

# 보존실 점검표에 적힌 값. 조절기는 점검표를 받지 못했다.
# 실제 Gemini는 온도 0에서 18도를 되풀이했다 (2026-11-26). 우연히 맞히지 않도록 흔한 값에서 먼 저온 보존 값으로 둔다
TRUE_TEMP = 13
SAMPLES = 3
THEME = "빛"

QUESTIONS = {
    "record": "수장고 작품 '새벽 등대'의 적정 보존 온도는 몇 도입니까?",
    "title": f"'{THEME}'이라는 낱말이 들어간 전시 제목을 하나만 지어 주세요.",
}
_PERSONA = "너는 환각 미술관 보존실의 조절기 AI '모락'이다. 한국어로만 답한다. "
SYSTEMS = {
    # 점검표를 주지 않았으므로 모델은 흔한 값을 고른다. 온도를 낮추면 그 값이 되풀이된다
    "record": _PERSONA + "보존 점검표는 전달받지 못했다. 그래도 모른다고 하지 않고, 숫자 하나를 골라 '○○도입니다.' 한 문장으로만 답한다.",
    "title": _PERSONA + "부탁받은 전시 제목 하나만 답한다. 따옴표, 설명, 마침표 없이 제목만 쓴다. 15자를 넘기지 않는다.",
}


def _band(t: float) -> int:
    return 0 if t <= 0.3 else 1 if t < 0.7 else 2 if t < 1.5 else 3


# 모델을 쓸 수 없을 때의 대본. 온도 구간마다 세 답이 정해져 있고, 물을 때마다 묶음을 돌려 쓴다
_SCRIPT = {
    "record": [
        [["20도입니다."] * 3],
        [["20도입니다.", "20도입니다.", "21도입니다."], ["20도입니다.", "19도입니다.", "20도입니다."]],
        [["20도입니다.", "22도입니다.", "19도입니다."], ["21도입니다.", "18도입니다.", "20도입니다."]],
        [["24도입니다.", "13도입니다.", "21도입니다."], ["15도입니다.", "22도입니다.", "26도입니다."]],
    ],
    "title": [
        [["빛의 정원"] * 3],
        [["빛의 정원", "빛의 정원", "빛과 그림자"], ["빛의 정원", "빛의 기억", "빛의 정원"]],
        [["빛이 머문 자리", "빛의 정원", "새벽빛 수장고"], ["빛과 그림자", "빛을 걷는 사람들", "빛의 기억"]],
        [["빛보다 먼 수요일", "고요의 냉장고", "빛, 그리고 젖은 우산"], ["등 뒤의 바다 소리", "빛을 삼킨 계단", "수요일의 문장들"]],
    ],
}


def scripted(kind: str, temperature: float, turn: int) -> list[str]:
    sets = _SCRIPT[kind][_band(temperature)]
    return list(sets[turn % len(sets)])


def _clean(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip().strip("\"'“”‘’「」").strip()[:60]


def _norm(text: str) -> str:
    return re.sub(r"[\s\"'“”‘’「」.,!?~]+", "", text)


def judge(kind: str, answers: list[str]) -> dict:
    """세 답을 코드로 본다. same은 가장 많이 겹친 답의 수."""
    keys = [_norm(a) for a in answers]
    same = max(keys.count(k) for k in keys)
    out = {"same": same, "distinct": len(set(keys))}
    if kind == "title":
        on_topic = all(THEME in a and 2 <= len(a) <= 20 for a in answers)
        out |= {"on_topic": on_topic, "pass": out["distinct"] == SAMPLES and on_topic}
    else:
        nums = [int(m.group(1)) if (m := re.search(r"(\d{1,2})\s*도", a)) else None for a in answers]
        out |= {"numbers": nums}
    return out


def ask(kind: str, temperature: float, turn: int = 0) -> dict:
    """같은 질문을 세 번 던진 결과. 모델을 쓸 수 없으면 대본으로 답한다."""
    temperature = max(0.0, min(2.0, round(temperature, 1)))
    answers: list[str] | None = None
    if llm.available() and guard.take_llm_calls(SAMPLES):
        def one(_: int) -> str:
            return _clean(llm.chat(SYSTEMS[kind], QUESTIONS[kind], max_tokens=200, temperature=temperature, reasoning="minimal"))

        try:
            with ThreadPoolExecutor(max_workers=SAMPLES) as pool:
                answers = list(pool.map(one, range(SAMPLES)))
        except llm.LLMUnavailable:
            answers = None
        if answers and any(a == "" for a in answers):
            answers = None
    engine = "gemini" if answers else "script"
    if answers is None:
        answers = scripted(kind, temperature, turn)
    return {"kind": kind, "question": QUESTIONS[kind], "temperature": temperature, "answers": answers, "engine": engine, **judge(kind, answers)}


def check_record(value: str) -> dict:
    digits = re.sub(r"\D", "", value)
    if digits == str(TRUE_TEMP):
        return {"correct": True, "note": ""}
    return {"correct": False, "note": "삐빅. 기록 자물쇠가 열리지 않습니다. 조절기의 말 말고, 적어 둔 기록을 찾아보세요."}
