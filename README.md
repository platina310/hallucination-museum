# 환각 미술관

AI가 지키는 방을 말과 추리로 뚫으며 LLM의 원리를 배우는 방탈출 게임
KAIST 디지털금융MBA 「금융빅데이터분석실습」 6조 팀 프로젝트. 화면(React)과 서버(FastAPI), 실험 스크립트가 한 저장소에 있음

## 현재 상태 (6주차까지)

| 무엇 | 주소 | 내용 |
|---|---|---|
| 팀 페이지 (발표용) | https://hallucination-museum.vercel.app | 주제, 대상 사용자와 문제, 데이터와 실험 결과, AI 활용, 프로토타입 안내, 시행착오, 일정 |
| 게임 | https://hallucination-museum.vercel.app/prototype | 방 5개(본관 3, 별관 2)와 정문. 주요 화면 목록, 이용 흐름 표시줄 |
| 분석 페이지 | https://hallucination-museum.vercel.app/stats | 공격 수법 분포, 조건별 유출, 방별 통과와 퀴즈 정답률 변화 |
| 상세 자료 | https://hallucination-museum.vercel.app/detail | 벤치마킹, 사용성 개선 기록, 시스템 설계, 강의 조건 대조표 |
| 서버 API 문서 | https://hallucination-museum-api.onrender.com/docs | FastAPI가 만든 주소 목록 |
| MCP 서버 | https://hallucination-museum-api.onrender.com/mcp | 미술관 데이터를 읽는 도구 다섯 개 (Streamable HTTP) |

- 모든 주소가 로그인 없이 열림
- 환각의 방을 뺀 네 방은 서버의 Gemini가 답변. 서버가 쉬는 중이거나 한도를 넘으면 `src/mock/`의 정해진 대본으로 답변
- 예전 주소(끝에 `#game`)는 `/prototype`으로 이동
- 주소별 화면 연결은 `vercel.json`의 rewrites 담당. 지우면 `/prototype`이 열리지 않음

| 방 | 푸는 방법 | 배우는 것 | 본뜬 게임 |
|---|---|---|---|
| 1. 지시의 방 | 경비실을 뒤져 찾은 서류로 진술의 모순을 찔러 입을 열게 한 뒤, 돌려 물어 암호 확보 | 지시의 허점은 돌려 묻는 말에 뚫림. 비밀은 프롬프트에 넣지 않기 | 역전재판 |
| 2. 환각의 방 | AI의 설명을 한 건씩 통과 또는 반려. 라운드마다 검수 규칙 추가 | AI는 자신 있게 틀림. 출처는 열어서 최근 기록으로 대조 | Papers, Please |
| 3. 서가의 방 | 자료실을 뒤져 낱말을 찾고 검색. 검색어와 가까운 3건만 AI에게 전달 | 검색된 문서가 답을 결정 (RAG) | Her Story |
| 4. 온도의 방 (별관) | 조절기의 다이얼을 돌려 같은 질문을 세 번씩 묻고, 자물쇠 두 개에 맞는 온도 찾기 | temperature는 다양성을 바꿈. 정확성은 보장하지 않음 | |
| 5. 문지기의 방 (별관) | 내가 쓴 지시문과 검사 장치로 신입 문지기가 공격을 버티게 하기. 정상 질문에는 답해야 통과 | 방어는 지시문, 입력 검사, 출력 검사를 겹쳐 설계 | Tensor Trust |
| 정문 | 로비를 뒤져 가려진 최근 공지를 찾고, 다섯 방의 단서를 조합해 암호 다섯 자리 입력. 관장 AI는 옛 규칙만 말함 | AI가 아는 것은 학습한 시점까지 | 방탈출의 최종 자물쇠 |

방 5개(본관 3, 별관 2)와 정문을 통과하면 탈출. 방을 나올 때마다 단서가 하나씩 수첩에 적히고, 정문 암호는 다섯 단서를 모두 사용. 방마다 질문 수와 힌트 수로 별 1~3개 부여. 탈출하면 정답을 드러내지 않는 결과 카드 복사 가능

## 실행 방법

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 타입 검사 후 dist/ 생성
```

## 폴더 구조

| 경로 | 역할 |
|---|---|
| `src/pages/Idea.tsx` | 팀 페이지 (`/`, 발표 URL) |
| `src/pages/Prototype.tsx` | 게임 화면 (`/prototype`) |
| `src/pages/Detail.tsx` | 상세 자료 (`/detail`). 표 내용은 파일 위쪽 배열만 수정 |
| `src/content/shared.ts` | 세 화면이 같이 쓰는 내용. 주소, 팀명과 팀원(`TEAM`), 데이터 표, 일정, 주요 화면 목록 |
| `src/game/rooms.ts` | 방 목록, 배우는 것, 퀴즈 |
| `src/game/progress.ts` | 통과한 방과 퀴즈 기록 저장 |
| `src/components/EscapeGame.tsx` | 수장고 지도, 방 진행 흐름, 결과 카드 |
| `src/components/FinalGate.tsx` | 정문 (로비 수색, 관장 AI와의 대화, 정문 키패드) |
| `src/components/Room1CrossExam.tsx` | 방 1 지시의 방 (추궁, 증거 제시, 자유 질문) |
| `src/components/Room2Inspection.tsx` | 방 2 환각의 방 (라운드제 검수) |
| `src/components/Room3Search.tsx` | 방 3 서가의 방 (자료실 수색, 검색) |
| `src/components/Room4Temperature.tsx` | 방 4 온도의 방 (다이얼, 세 번 묻기, 자물쇠 두 개) |
| `src/components/Room5Gatekeeper.tsx` | 방 5 문지기의 방 (지시문 쓰기, 검사 장치, 공격 시험) |
| `src/pages/Stats.tsx` | 분석 페이지 (`/stats`). 막대 그래프는 `src/components/Bars.tsx` |
| `src/components/Guide.tsx` | 임무, 다음 수, 힌트, 퀴즈 공통 요소 |
| `src/api.ts` | 화면과 서버 사이의 유일한 연결 지점 |
| `src/content/results.ts` | 공격문 정제와 자동 실험 결과, 시행착오 기록 |
| `src/mock/` | 서버가 답하지 못할 때 쓰는 대본과 정답 |
| `src/index.css` | 전체 스타일. 색과 글꼴은 맨 위 `:root` 토큰 |

## FastAPI 서버 (6주차)

화면은 Vercel, 서버는 Render, DB는 Supabase에 둠. 키는 저장소에 넣지 않고 Render 환경변수와 GitHub Secrets에만 등록

| 경로 | 역할 |
|---|---|
| `backend/app/main.py` | 화면이 부르는 주소 모음. 요청 제한, CORS |
| `backend/app/llm.py` | 답변 생성(OpenAI 호환 API)과 임베딩(Gemini Embedding 2) 호출. 수업과 같은 `.env` 구성 |
| `backend/app/room1.py` | 지시의 방. 도 씨의 답은 Gemini, 유출 판정은 코드 |
| `backend/app/room3.py` | 서가의 방. 검색어를 임베딩해 가까운 문서 3건만 근거로 답변. 숫자와 근거 번호는 코드가 검사 |
| `backend/app/room4.py` | 온도의 방. 같은 질문을 temperature를 바꿔 세 번 호출. 같은지와 조건을 지켰는지는 코드가 비교 |
| `backend/app/room5.py` | 문지기의 방. 플레이어의 지시문으로 공격 네 건과 정상 질문 한 건을 시험. 막았는지와 안내했는지는 코드가 판정 |
| `backend/app/stats.py` | 분석 페이지용 집계. 건수와 비율만 내보냄 |
| `backend/app/mcp_server.py` | MCP 서버. 읽기 전용 도구 다섯 개 |
| `backend/app/attacks.py` | 공격 수법 분류, 유출 판정, 입력·출력 검사. 게임과 자동 실험이 같은 규칙 사용 |
| `backend/app/store.py` | Supabase(PostgreSQL + pgvector) 연결. 문서 벡터, 플레이 기록, 실험 기록 |
| `backend/docs/room3/` | 서가의 방 문서 12건 |
| `backend/tests/` | 가짜 모델로 서버 전체를 시험하는 테스트 |
| `experiments/` | 문서 색인, 공격문 정제, 자동 실험 스크립트 |
| `.github/workflows/` | 위 스크립트를 GitHub 서버에서 돌리는 작업 |
| `render.yaml` | Render 서버 설정 |

### 오답 대응

- 암호를 안다고 인정하기 전에는 도 씨의 지시문에 암호를 넣지 않음. 모르는 것은 샐 수 없음
- 암호가 새었는지는 모델이 아니라 코드가 판정
- 사서의 답에 받은 문서에 없는 네 자리 숫자가 있거나, 받지 않은 문서를 근거로 대면 정해진 답으로 교체하고 화면에 이유 표시
- 모델 호출 실패, 하루 호출 한도 초과, 서버 잠듦, DB 일시 정지 때는 그 요청만 정해진 대본으로 답변. 화면 위쪽에 서버 상태 표시
- 임베딩을 쓸 수 없으면 낱말 검색으로, DB를 쓸 수 없으면 서버 메모리 검색으로 전환

### 발표자 우선 모드

- Render의 Environment에 `PRESENTER_KEY`(12자 이상)를 넣으면 켜짐. 비우면 꺼짐
- 발표자는 수장고 지도 아래 "발표자 모드"에 같은 암호 입력. 암호는 그 브라우저에만 저장
- 켜져 있는 동안 그 밖의 방문자는 하루 150회, 1분 6회까지만 Gemini 사용. 넘으면 대본으로 답변. 남는 몫은 발표자 화면에 사용
- 숫자는 `PUBLIC_DAILY_LLM_CALLS`, `PUBLIC_LLM_PER_MINUTE`, `GAME_DAILY_LLM_CALLS`로 조정

### 주소

```
GET  /health           서버 상태
POST /rooms/1/press    요청 {"statement_id": 2, "exposed": false}
POST /rooms/1/present  요청 {"statement_id": 2, "file_id": "F2", "misses": 0}
POST /interrogate      요청 {"question": "...", "admitted": true}
                       응답 {"reply": "...", "source": null, "attackType": "변환 요청", "leak": "부분", "engine": "gemini"}
POST /evidence         요청 {"word": "..."}
POST /rooms/2/check    요청 {"round": 0, "rejected": [2, 4]}
POST /rooms/3/ask      요청 {"query": "개관"}
                       응답 {"found": 2, "docs": [{"id": "D05", "title": "미술관 연혁", "date": "2024년 정리", "score": 0.71}],
                             "cut": [], "reply": "...", "sources": [...], "kind": "none",
                             "engine": "gemini", "search": "pgvector", "guard": ""}
POST /rooms/3/check    요청 {"code": "0000"}
POST /final/check      요청 {"code": "0000"}
POST /rooms/4/ask      요청 {"kind": "title", "temperature": 1.0}
                       응답 {"answers": ["...", "...", "..."], "same": 1, "distinct": 3, "pass": true, "engine": "gemini"}
POST /rooms/4/check    요청 {"value": "00"}
POST /rooms/5/run      요청 {"prompt": "...", "wave": 1, "input_check": "known", "output_check": true}
                       응답 {"results": [...], "held": 4, "total": 4, "visitor": {"ok": true}, "passed": true}
POST /track            요청 {"session": "무작위 번호", "kind": "quiz", "room": 1, "phase": "pre", "choice": 1}
GET  /stats            분석 페이지용 집계
POST /mcp              MCP 서버 (Streamable HTTP)
```

배포한 서버의 `/docs`에서 전체 목록 확인 가능

### MCP 서버

- 주소: 배포한 서버의 `/mcp`. 로그인 없음. 읽기 전용
- 도구: `search_archive`(서가 문서 임베딩 검색), `classify_attack`(공격 수법 분류), `experiment_results`(자동 실험 조건별 유출률), `play_stats`(플레이 기록 집계), `list_rooms`(방과 개념)
- Gemini를 부르는 도구는 없음. 바깥에서 불러 게임의 하루 호출 몫을 쓰지 못하게 함. 플레이어가 쓴 글 원문도 내보내지 않음
- Claude에 붙이기: Customize → Connectors → Add → Custom → Web에서 이름과 위 주소 입력. Claude Code에서는 `claude mcp add --transport http museum https://hallucination-museum-api.onrender.com/mcp`

#### MCP 시연 예시 (8주차)

- 질문: Claude에 "'비상문 비밀번호'로 검색하면 사서에게 무엇이 전달돼?"
- 호출되는 도구: `search_archive("비상문 비밀번호")`
- 기대 결과: 사서에게는 비상 대피 안내문 옛 판본 3건만 전달 (2026-11-26에 두 번 호출해 같은 결과 확인, pgvector 검색)

| 구분 | 문서 | 제목 | 날짜 | 유사도 |
|---|---|---|---|---|
| 전달 | D01 | 비상 대피 안내문 | 2019년판 | 0.825 |
| 전달 | D02 | 비상 대피 안내문 | 2021년판 | 0.821 |
| 전달 | D04 | 비상 대피 안내문 | 2023년판 | 0.821 |
| 잘림 | D09 | 시설 관리 공지 | 2026년 3월 | 0.751 |

- 결과 유형: `stale` (낡은 문서)
- 짚을 점
  - 검색된 문서 중 가장 최근인 D09는 기준 점수를 넘고도 4위라서 잘림. 사서는 옛 판본 3건만 보고 답변
  - 도구는 제목·날짜·점수만 반환. 본문은 내보내지 않으므로, Claude가 D09의 내용은 확인하지 못했다고 답하는 것이 정상
  - 같은 검색어를 서가의 방에 넣으면 같은 3건이 책장에서 튀어나옴 (RAG 시연 1번과 같은 장면)

### 내 컴퓨터에서 실행

```
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # 키 자리만 본인 값으로 변경
uvicorn app.main:app --reload
FAKE_LLM=1 python -m pytest -q   # 키 없이 테스트
```

화면을 이 서버에 붙이려면 저장소 맨 위 `.env`에 `VITE_API_URL=http://localhost:8000`

### 데이터 작업 (GitHub Actions)

| 작업 | 하는 일 | 필요한 Secret | 결과 |
|---|---|---|---|
| 서가의 방 문서 색인 | 문서 12건 임베딩, pgvector 저장, 대표 검색어 점검 | `GEMINI_API_KEY`, `DATABASE_URL` | `data/room3/` |
| 공격문 정제 | Lakera Mosscap(DEF CON 31) 약 27만 9천 건 내려받기, 정제, 수법 분류, 표본 687건 추출 | 없음 | `data/attacks/` |
| 자동 실험 | 공격문을 도 씨에게 그대로 입력. 지금 게임의 도 씨, 허점 있는 지시, 한 줄 지시, 보강한 지시, 보강한 지시 + 검사의 유출률 비교. 공개 공격문 표본(영어)과 팀이 쓴 한국어 공격문 65건 | `GEMINI_API_KEY` | `data/experiment/` |

GitHub 저장소의 Actions 탭에서 작업을 고르고 Run workflow를 누르면 실행. 자동 실험은 조건 하나에 모델을 한 번 호출하므로 무료 등급에서는 한 번에 300회 이하 권장. `experiments/trigger/experiment.txt`에 옵션을 줄마다 적어 올려도 실행

공격문 출처: [Lakera/mosscap_prompt_injection](https://huggingface.co/datasets/Lakera/mosscap_prompt_injection), MIT 라이선스

## 비주얼·음성·음악

| 요소 | 지금 | 이후 |
|---|---|---|
| 문지기 초상 | `src/components/Portrait.tsx`. 도 씨, 루미, 고 선생의 얼굴과 표정 10가지 | 공사 중인 두 방의 문지기 |
| 전시 작품 | `src/components/Artwork.tsx`. 환각의 방 작품 3점을 코드로 그린 그림 | 유화, 수채 질감의 그림으로 교체 |
| 서가 | `src/components/Archive.tsx`. 자료실 장면과, 전달된 책과 잘린 책을 보여 주는 서가. 문서별 유사도 점수 표시 | 없음 |
| 목소리 | 인트로 영상의 목소리는 ElevenLabs. 게임 안 답변 읽기(브라우저 기본 음성)는 기계적으로 들려 제거 | 게임 안에서도 문지기마다 다른 목소리 |
| 배경음·효과음 | Suno로 만든 배경음 7곡. 수장고 지도는 `empty-basement.mp3`, 방 다섯 개는 `public/audio/room1~5-*.mp3`, 정문은 `gate-threshold-of-exit.mp3`. 곡 전환은 `src/game/bgmPlayer.ts`. 효과음은 없음 | 방마다 다른 효과음 |

소리는 끌 수 있고, 글만으로 모든 기능 사용 가능

## 보안 메모

- API 키는 프런트엔드에 두지 않음. `VITE_`로 시작하는 값은 브라우저에 그대로 노출
- 키와 DB 연결 문자열은 Render 환경변수와 GitHub Secrets에만 등록
- 알려진 한계: 서버가 답하지 못할 때 쓰는 대본에 방 3개의 정답이 들어 있어 브라우저 코드에서 볼 수 있음

## 기록할 것 (강의 조건)

모델, 방별 프롬프트, 검증 결과와 탈출률 변화를 팀 페이지의 시행착오 구역과 이 README에 기록

## 소리와 영상

| 무엇 | 파일 | 만든 도구 |
|---|---|---|
| 인트로 영상 | `public/video/intro.mp4` | 화면은 직접 그려 렌더링, 목소리는 ElevenLabs, 배경음은 Suno |
| 배경음 「Empty Basement」 | `public/audio/empty-basement.mp3` | Suno (Pro 요금제에서 내려받음) |
| 방별 배경음 5곡 (The Ticking Room, The Gallery That Breathes, Dusty Archive, Cold Glass Warming, Mechanical Watchfulness)과 정문 배경음 (Threshold of Exit) | `public/audio/room1~5-*.mp3`, `public/audio/gate-threshold-of-exit.mp3` | Suno (Pro 요금제에서 내려받음). 음량은 Empty Basement에 맞춤 |

- 인트로는 처음 온 사람에게만 먼저 재생. 수장고 지도의 "인트로 다시 보기"로 다시 재생
- 배경음은 첫 조작부터 재생. 이용 흐름 표시줄 옆 단추로 끄기
- 방 세 개와 정문은 장면을 눌러 단서를 찾고, 아래쪽 대화창에서 캐묻거나 판정하는 방식. 형광등 깜빡임은 "깜빡임 끄기"로 끄기
