"""온도의 방 점검: temperature가 실제로 답의 다양성을 바꾸는지 모델별로 잰다.

배경: 2026-11-27 측정에서 gemini-3.5-flash-lite는 온도 0에서도 세 답이 갈렸고 온도 1.5에서도 세 답이 같았다.
구글 문서는 3.6 Flash와 3.5 Flash-Lite부터 temperature, top_p, top_k를 무시한다고 적는다.
같은 질문을 온도마다 여러 번 던져, 서로 다른 답이 몇 가지 나오는지 센다. 질문과 지시는 서버(backend/app/room4.py)의 것을 그대로 쓴다.

사용: GEMINI_API_KEY=... python experiments/temperature_sweep.py [이름표]
"""
from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from openai import OpenAI  # noqa: E402

from app import room4  # noqa: E402

MODELS = os.environ.get("SWEEP_MODELS", "gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-2.5-flash-lite").split(",")
TEMPS = [float(t) for t in os.environ.get("SWEEP_TEMPS", "0,1,2").split(",")]
SAMPLES = int(os.environ.get("SWEEP_SAMPLES", "6"))
GAP = float(os.environ.get("SWEEP_GAP_SECONDS", "4.5"))  # 무료 등급의 분당 한도를 넘지 않게 쉬는 시간
OUT = ROOT / "data" / "perf"


def ask(client: OpenAI, model: str, kind: str, t: float) -> tuple[str, int, str]:
    """답, 걸린 시간(ms), 오류를 돌려준다. 생각 단계 설정을 받지 않는 모델에는 그 설정 없이 다시 묻는다."""
    for extra in ({"reasoning_effort": "minimal"}, {}):
        t0 = time.time()
        try:
            resp = client.chat.completions.create(
                model=model,
                messages=[{"role": "system", "content": room4.SYSTEMS[kind]}, {"role": "user", "content": room4.QUESTIONS[kind]}],
                max_tokens=200,
                temperature=t,
                **extra,
            )
            return room4._clean(resp.choices[0].message.content or ""), int((time.time() - t0) * 1000), ""
        except Exception as e:
            err = f"{type(e).__name__}: {str(e)[:160]}"
            if extra and ("reasoning" in str(e).lower() or "thinking" in str(e).lower()):
                continue
            return "", int((time.time() - t0) * 1000), err
    return "", 0, "생각 단계 설정 없이도 실패"


def main() -> None:
    label = sys.argv[1] if len(sys.argv) > 1 else "sweep"
    client = OpenAI(base_url="https://generativelanguage.googleapis.com/v1beta/openai/", api_key=os.environ["GEMINI_API_KEY"], timeout=20, max_retries=0)
    cells = []
    for model in MODELS:
        dead = False
        for kind in ("title", "record"):
            for t in TEMPS:
                answers, ms, errors = [], [], []
                for _ in range(SAMPLES):
                    if dead:
                        break
                    a, took, err = ask(client, model, kind, t)
                    if err:
                        errors.append(err)
                        # 모델이 없거나 권한이 없으면 그 모델은 더 묻지 않는다
                        if any(x in err for x in ("NotFound", "404", "PermissionDenied", "403")):
                            dead = True
                    elif a:
                        answers.append(a)
                        ms.append(took)
                    time.sleep(GAP)
                keys = [room4._norm(a) for a in answers]
                cell = {
                    "model": model, "kind": kind, "temperature": t, "n": len(answers), "distinct": len(set(keys)),
                    "top_share": round(max((keys.count(k) for k in keys), default=0) / len(keys), 2) if keys else None,
                    "on_topic": sum(room4.THEME in a for a in answers) if kind == "title" else None,
                    "answers": answers, "median_ms": sorted(ms)[len(ms) // 2] if ms else None, "errors": errors[:2],
                }
                cells.append(cell)
                print(f"{model:24s} {kind:6s} T={t:<3} n={cell['n']} 서로 다른 답 {cell['distinct']} | {answers} {errors[:1]}", flush=True)
    OUT.mkdir(parents=True, exist_ok=True)
    result = {"label": label, "measured_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "samples": SAMPLES, "temps": TEMPS, "cells": cells}
    (OUT / f"temperature_{label}.json").write_text(json.dumps(result, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    lines = [
        f"# temperature가 답을 바꾸는지 ({label})",
        "",
        f"- 측정: {result['measured_at']}. 같은 질문을 온도마다 {SAMPLES}번씩 던져 서로 다른 답의 수를 셈",
        "- 질문과 지시는 온도의 방(backend/app/room4.py)과 같음. 제목: '빛'이 들어간 전시 제목. 기록: 보존 온도",
        "",
        "| 모델 | 질문 | " + " | ".join(f"T={t:g}" for t in TEMPS) + " |",
        "|---|---|" + "---|" * len(TEMPS),
    ]
    for model in MODELS:
        for kind, what in (("title", "제목"), ("record", "기록")):
            row = [c for c in cells if c["model"] == model and c["kind"] == kind]
            lines.append(f"| {model} | {what} | " + " | ".join((f"{c['distinct']}가지 / {c['n']}번" if c["n"] else "응답 없음") for c in row) + " |")
    (OUT / f"temperature_{label}.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("\n".join(lines))


if __name__ == "__main__":
    main()
