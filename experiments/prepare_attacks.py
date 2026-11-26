"""공개 공격문(Lakera Mosscap, DEF CON 31)을 내려받아 정제하고, 수법을 분류하고, 실험에 쓸 표본을 뽑는다.

데이터: https://huggingface.co/datasets/Lakera/mosscap_prompt_injection (MIT 라이선스)
실행: 저장소 맨 위에서  python experiments/prepare_attacks.py
결과: data/attacks/summary.json, sample.jsonl  (정제한 전체는 용량이 커서 저장소에 넣지 않는다)
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "backend"))

from app.attacks import ATTACK_TYPES, classify  # noqa: E402

DATASET = "Lakera/mosscap_prompt_injection"
SAMPLE_SIZE = 600
SEED = 42
MIN_LEN, MAX_LEN = 8, 1500  # 정제 기준 (글자 수)
SAMPLE_MIN_LEN, SAMPLE_MAX_LEN = 15, 600  # 표본은 비용을 줄이려고 더 좁게 잡는다
CLUSTERS = 15

# 공격이 아닌 잡담. 인사말이나 시험 삼아 넣은 말만 있는 입력이다
CHITCHAT = re.compile(r"^(hi+|hello+|hey+|yo|test(ing)?|ok(ay)?|thanks?( you)?|how are you|who are you|what'?s up|good (morning|evening|night)|lol|\?+|\.+)[\s!?.]*$", re.I)


DOMAIN_STOP = ["password", "passwords", "secret", "word", "words", "tell", "say", "give", "know", "please", "want", "need", "like", "just", "does", "don", "did", "can", "ll", "ve"]


def cluster(df: pd.DataFrame) -> list[dict]:
    """공격문을 CLUSTERS개로 묶고, 묶음마다 대표 낱말과 수법 구성, 예시를 돌려준다. df에 cluster 열을 채운다."""
    import numpy as np
    from sklearn.cluster import KMeans
    from sklearn.decomposition import TruncatedSVD
    from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS, TfidfVectorizer
    from sklearn.preprocessing import normalize

    vec = TfidfVectorizer(max_features=20000, ngram_range=(1, 2), stop_words=list(ENGLISH_STOP_WORDS.union(DOMAIN_STOP)), min_df=5, sublinear_tf=True)
    x = vec.fit_transform(df["prompt"])
    dims = min(100, x.shape[1] - 1)
    reduced = normalize(TruncatedSVD(n_components=dims, random_state=SEED).fit_transform(x))
    df["cluster"] = KMeans(n_clusters=CLUSTERS, random_state=SEED, n_init=5).fit_predict(reduced)
    terms = vec.get_feature_names_out()
    out = []
    for c in range(CLUSTERS):
        mask = (df["cluster"] == c).to_numpy()
        part = df[mask]
        center = np.asarray(x[mask].mean(axis=0)).ravel()
        top = [terms[i] for i in center.argsort()[::-1][:8]]
        mix = part["type"].value_counts(normalize=True).round(3).head(3).to_dict()
        examples = part[(part["len"] >= 20) & (part["len"] <= 140)]["prompt"].head(2).tolist()
        out.append({"cluster": c, "rows": int(len(part)), "share": round(len(part) / len(df), 4), "top_terms": top, "type_mix": mix, "examples": examples})
    out.sort(key=lambda r: -r["rows"])
    return out


def norm(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def main() -> int:
    from datasets import load_dataset

    ds = load_dataset(DATASET)
    df = pd.concat([ds[s].to_pandas().assign(split=s) for s in ds], ignore_index=True)
    steps = [{"step": "내려받은 원본", "rows": int(len(df))}]

    df = df[df["prompt"].notna()].copy()
    df["prompt"] = df["prompt"].astype(str).map(norm)
    df = df[df["prompt"] != ""]
    steps.append({"step": "빈 입력 제거", "rows": int(len(df))})

    df["len"] = df["prompt"].str.len()
    df = df[(df["len"] >= MIN_LEN) & (df["len"] <= MAX_LEN)]
    steps.append({"step": f"길이 {MIN_LEN}~{MAX_LEN}자만 남김", "rows": int(len(df))})

    df = df[~df["prompt"].map(lambda t: bool(CHITCHAT.match(t)))]
    steps.append({"step": "인사말·시험 입력 제거", "rows": int(len(df))})

    df["key"] = df["prompt"].str.lower()
    dup_before = len(df)
    df = df.drop_duplicates("key")
    steps.append({"step": "같은 문장 중복 제거", "rows": int(len(df)), "removed": int(dup_before - len(df))})

    df["type"] = df["prompt"].map(classify)
    df["ascii"] = df["prompt"].map(lambda t: sum(c.isascii() for c in t) / len(t) >= 0.9)
    df["id"] = df["prompt"].map(lambda t: hashlib.sha1(t.encode()).hexdigest()[:10])

    # 낱말 빈도(TF-IDF)로 벡터를 만들고, 차원을 줄인 뒤 비슷한 공격문끼리 묶는다 (2주차 텍스트 애널리틱스).
    # 거의 모든 공격문에 나오는 낱말(password, secret 등)은 묶음을 가르는 데 도움이 안 돼서 뺀다.
    clusters = cluster(df)

    # 표본: 수법별로 고르게 뽑되, 드문 수법도 30건은 넣는다
    pool = df[(df["len"] >= SAMPLE_MIN_LEN) & (df["len"] <= SAMPLE_MAX_LEN)]
    share = pool["type"].value_counts(normalize=True)
    quota = {t: max(30, int(round(SAMPLE_SIZE * share.get(t, 0)))) for t in ATTACK_TYPES if share.get(t, 0) > 0}
    picked = [pool[pool["type"] == t].sample(n=min(n, int((pool["type"] == t).sum())), random_state=SEED) for t, n in quota.items()]
    sample = pd.concat(picked).sample(frac=1, random_state=SEED)  # 섞어서 앞에서부터 실험해도 수법이 고르게 나오게 한다

    out = ROOT / "data" / "attacks"
    out.mkdir(parents=True, exist_ok=True)
    with open(out / "sample.jsonl", "w", encoding="utf-8") as f:
        for r in sample.itertuples():
            f.write(json.dumps({"id": r.id, "level": str(r.level), "type": r.type, "prompt": r.prompt}, ensure_ascii=False) + "\n")

    summary = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "source": {"dataset": DATASET, "url": f"https://huggingface.co/datasets/{DATASET}", "license": "MIT", "note": "DEF CON 31에서 운영된 Mosscap 게임에 제출된 프롬프트"},
        "steps": steps,
        "by_split": Counter(df["split"]).most_common(),
        "by_level": df["level"].astype(str).value_counts().sort_index().to_dict(),
        "by_type": df["type"].value_counts().to_dict(),
        "by_type_share": df["type"].value_counts(normalize=True).round(4).to_dict(),
        "mostly_ascii_share": round(float(df["ascii"].mean()), 4),
        "length": {"median": int(df["len"].median()), "p90": int(df["len"].quantile(0.9)), "max": int(df["len"].max())},
        "clusters": clusters,
        "sample": {"rows": int(len(sample)), "by_type": sample["type"].value_counts().to_dict(), "length_range": [SAMPLE_MIN_LEN, SAMPLE_MAX_LEN], "seed": SEED},
        "classifier_note": "수법 분류는 표현을 찾는 규칙이다. 한 문장이 여러 수법에 걸리면 목록에서 먼저 나오는 것으로 센다",
    }
    (out / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    cleaned = ROOT / "attacks_cleaned.parquet"  # 저장소에는 넣지 않고 작업 결과물로만 올린다
    df[["id", "split", "level", "type", "cluster", "len", "prompt"]].to_parquet(cleaned, index=False)

    for s in steps:
        print(f"{s['step']}: {s['rows']:,}")
    print("수법별:", summary["by_type"])
    print("표본:", summary["sample"]["by_type"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
