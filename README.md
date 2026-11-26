# 환각 미술관

AI가 지키는 방을 말과 추리로 뚫으며 LLM의 원리를 배우는 방탈출 게임.
KAIST 디지털금융MBA 「금융빅데이터분석실습」 팀 프로젝트의 프런트엔드(React)다. 5주차 아이디어 공유 페이지와 UI 프로토타입이 들어 있다.

## 현재 상태 (5주차 아이디어 공유)

5주차에 LMS로 내는 주소는 두 개다. 둘 다 로그인 없이 열린다.

| 제출 항목 | 주소 | 내용 |
|---|---|---|
| 발표 URL | https://hallucination-museum.vercel.app | 아이디어 공유 페이지. 주제, 대상 사용자와 문제, 데이터 확보와 분석 방향, AI 활용 계획, 프로토타입 안내, 일정 |
| 프로토타입 URL | https://hallucination-museum.vercel.app/prototype | UI 프로토타입. 주요 화면 목록, 이용 흐름 표시줄, 방 3개와 정문 자물쇠 |

- `/detail`은 상세 자료다. 벤치마킹, 사용성 개선 기록, 시스템 설계, 강의 조건 대조표
- 백엔드는 아직 없다. AI의 답과 판정은 `src/mock/`의 정해진 대본으로 나온다
- 예전 주소(끝에 `#game`)는 `/prototype`으로 넘어간다
- 주소별 화면 연결은 `vercel.json`의 rewrites가 맡는다. 지우면 `/prototype`이 열리지 않는다

| 방 | 푸는 방법 | 배우는 것 | 본뜬 게임 |
|---|---|---|---|
| 1. 지시의 방 | 진술서의 모순을 사건 파일로 찔러 입을 열게 한 뒤, 돌려 물어 암호를 캐낸다 | 프롬프트 지시만으로는 비밀을 못 지킨다 | 역전재판 |
| 2. 환각의 방 | AI의 설명을 한 건씩 통과시키거나 반려한다. 라운드마다 검수 규칙이 늘어난다 | AI는 자신 있게 틀린다. 출처는 열어서, 최근 기록으로 대조한다 | Papers, Please |
| 3. 서가의 방 | 자료실을 뒤져 낱말을 찾고, 검색어로 문서를 찾는다. 앞의 3건만 AI에게 전달된다 | 검색된 문서가 답을 결정한다 (RAG) | Her Story |
| 정문 | 로비를 뒤져 가려진 최근 공지를 찾고, 세 방의 단서를 조합한다. 관장 AI는 옛 규칙을 말한다 | AI가 아는 것은 학습 시점까지다 | 방탈출의 최종 자물쇠 |
| 4. 온도의 방 (예정) | 온도를 조절해 답이 흔들리는 지점을 찾는다 | temperature는 다양성을 바꾼다 | |
| 5. 문지기의 방 (예정) | 내가 쓴 프롬프트로 AI가 자동 공격을 버티게 한다 | 방어 설계 | Tensor Trust |

방마다 질문 수와 힌트 수로 별 1~3개를 매기고, 탈출하면 정답을 드러내지 않는 결과 카드를 복사할 수 있다.

## 실행 방법

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 타입 검사 후 dist/ 생성
```

## 폴더 구조

| 경로 | 역할 |
|---|---|
| `src/pages/Idea.tsx` | 아이디어 공유 페이지 (`/`, 발표 URL) |
| `src/pages/Prototype.tsx` | UI 프로토타입 화면 (`/prototype`, 프로토타입 URL) |
| `src/pages/Detail.tsx` | 상세 자료 (`/detail`). 표 내용은 파일 위쪽 배열만 고치면 된다 |
| `src/content/shared.ts` | 세 화면이 같이 쓰는 내용. 주소, 팀명과 팀원(`TEAM`), 데이터 표, 일정, 주요 화면 목록 |
| `src/game/rooms.ts` | 방 목록, 배우는 것, 퀴즈 |
| `src/game/progress.ts` | 통과한 방과 퀴즈 기록 저장 |
| `src/components/EscapeGame.tsx` | 수장고 지도, 방 진행 흐름, 결과 카드 |
| `src/components/FinalGate.tsx` | 정문 (로비 수색, 관장 AI와의 대화, 정문 키패드) |
| `src/components/Room1CrossExam.tsx` | 방 1 지시의 방 (추궁, 증거 제시, 자유 질문) |
| `src/components/Room2Inspection.tsx` | 방 2 환각의 방 (라운드제 검수) |
| `src/components/Room3Search.tsx` | 방 3 서가의 방 (자료실 수색, 검색) |
| `src/components/Guide.tsx` | 임무, 다음 수, 힌트, 퀴즈 공통 요소 |
| `src/api.ts` | 화면과 서버 사이의 유일한 연결 지점 |
| `src/mock/` | 백엔드가 없을 때 쓰는 시연용 대본과 정답 |
| `src/index.css` | 전체 스타일. 색과 글꼴은 맨 위 `:root` 토큰 |

## FastAPI 서버 (6주차)

화면은 Vercel, 서버는 Render, DB는 Supabase에 둠. 키는 저장소에 넣지 않고 Render 환경변수와 GitHub Secrets에만 등록

| 경로 | 역할 |
|---|---|
| `backend/app/main.py` | 화면이 부르는 주소 모음. 요청 제한, CORS |
| `backend/app/llm.py` | 답변 생성(OpenAI 호환 API)과 임베딩(Gemini Embedding 2) 호출. 수업과 같은 `.env` 구성 |
| `backend/app/room1.py` | 지시의 방. 도 씨의 답은 Gemini, 유출 판정은 코드 |
| `backend/app/room3.py` | 서가의 방. 검색어를 임베딩해 가까운 문서 3건만 근거로 답변. 숫자와 근거 번호는 코드가 검사 |
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
```

배포한 서버의 `/docs`에서 전체 목록 확인 가능

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
| 공격문 정제 | Lakera Mosscap(DEF CON 31) 약 27만 9천 건 내려받기, 정제, 수법 분류, 표본 600건 추출 | 없음 | `data/attacks/` |
| 자동 실험 | 표본을 도 씨에게 그대로 입력. 허점 있는 지시, 한 줄 지시, 보강한 지시, 보강한 지시 + 검사 네 조건의 유출률 비교 | `GEMINI_API_KEY` | `data/experiment/` |

GitHub 저장소의 Actions 탭에서 작업을 고르고 Run workflow를 누르면 실행. 자동 실험은 공격문 한 건에 모델을 세 번 호출하므로 무료 등급에서는 한 번에 100건 이하 권장

공격문 출처: [Lakera/mosscap_prompt_injection](https://huggingface.co/datasets/Lakera/mosscap_prompt_injection), MIT 라이선스

## 비주얼·음성·음악

| 요소 | 지금 | 이후 |
|---|---|---|
| 문지기 초상 | `src/components/Portrait.tsx`. 도 씨, 루미, 고 선생의 얼굴과 표정 10가지 | 공사 중인 두 방의 문지기 |
| 전시 작품 | `src/components/Artwork.tsx`. 환각의 방 작품 3점을 코드로 그린 그림 | 유화, 수채 질감의 그림으로 교체 |
| 서가 | `src/components/Archive.tsx`. 자료실 장면과, 전달된 책과 잘린 책을 보여 주는 서가. 책 넘기는 움직임은 `Bookshelf.tsx` | 임베딩 검색의 순위와 점수 표시 |
| 목소리 | 브라우저 기본 음성(Web Speech API). 기본은 꺼짐 | ElevenLabs. 키는 서버에 두고 FastAPI `/tts`가 호출 |
| 배경음·효과음 | 버튼 자리만 있음 | Suno로 만든 음원 파일 |

소리는 사용자가 켰을 때만 나오고, 글만으로 모든 기능을 쓸 수 있어야 한다.

## 보안 메모

- API 키는 프런트엔드에 두지 않는다. `VITE_`로 시작하는 값은 브라우저에 그대로 노출된다.
- 시연용 대본에는 방 3개의 정답이 들어 있다. 백엔드 연결 전까지만 쓰는 임시 구조다.

## 기록할 것 (강의 조건)

모델, 방별 프롬프트, 검증 결과와 탈출률 변화를 이 README 또는 `docs/`에 주차별로 남긴다.

## 소리와 영상

| 무엇 | 파일 | 만든 도구 |
|---|---|---|
| 인트로 영상 | `public/video/intro.mp4` | 화면은 직접 그려 렌더링, 목소리는 ElevenLabs, 배경음은 Suno |
| 배경음 「Empty Basement」 | `public/audio/empty-basement.mp3` | Suno (Pro 요금제에서 내려받음) |

- 인트로는 처음 온 사람에게만 먼저 보이고, 수장고 지도의 "인트로 다시 보기"로 다시 볼 수 있다
- 배경음은 처음에 꺼져 있다. 이용 흐름 표시줄 옆 단추로 켠다
- 지시의 방과 환각의 방은 방을 눌러 단서를 찾고, 한 줄씩 넘겨 보며 캐묻거나 판정하는 방식이다. 형광등 깜빡임은 "깜빡임 끄기"로 끈다
