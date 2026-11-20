# 환각 미술관

AI가 지키는 방을 말과 추리로 뚫으며 LLM의 원리를 배우는 방탈출 게임.
KAIST 디지털금융MBA 「금융빅데이터분석실습」 팀 프로젝트의 프런트엔드(React)와 팀 페이지다.

## 현재 상태 (5주차 아이디어 공유용)

- 팀 페이지: 대상 사용자와 문제, 데이터와 분석 방향, LLM·RAG·에이전트 계획, 강의 조건 대조표, 일정
- 방탈출: 수장고 지도, 방 3개, 방마다 입장 전과 탈출 후 퀴즈, 탈출 결과
- 백엔드는 아직 없다. AI의 답과 판정은 `src/mock/`의 정해진 대본으로 나온다
- 주소 끝에 `#game`을 붙이면 게임만 나온다

| 방 | 푸는 방법 | 배우는 것 | 본뜬 게임 |
|---|---|---|---|
| 1. 지시의 방 | 진술서의 모순을 사건 파일로 찔러 입을 열게 한 뒤, 돌려 물어 암호를 캐낸다 | 프롬프트 지시만으로는 비밀을 못 지킨다 | 역전재판 |
| 2. 환각의 방 | AI의 설명을 한 건씩 통과시키거나 반려한다. 라운드마다 검수 규칙이 늘어난다 | AI는 자신 있게 틀린다. 출처는 열어서, 최근 기록으로 대조한다 | Papers, Please |
| 3. 서가의 방 | 검색어로 문서를 찾는다. 앞의 3건만 AI에게 전달된다 | 검색된 문서가 답을 결정한다 (RAG) | Her Story |
| 정문 | 세 방의 단서를 조합한다. 관장 AI는 옛 규칙을 말한다 | AI가 아는 것은 학습 시점까지다 | 방탈출의 최종 자물쇠 |
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
| `src/pages/Team.tsx` | 팀 페이지. 표 내용은 파일 위쪽 배열만 고치면 된다 |
| `src/pages/Game.tsx` | 게임만 있는 화면 (`#game`) |
| `src/game/rooms.ts` | 방 목록, 배우는 것, 퀴즈 |
| `src/game/progress.ts` | 통과한 방과 퀴즈 기록 저장 |
| `src/components/EscapeGame.tsx` | 수장고 지도, 방 진행 흐름, 정문 자물쇠, 결과 카드 |
| `src/components/Room1CrossExam.tsx` | 방 1 지시의 방 (추궁, 증거 제시, 자유 질문) |
| `src/components/Room2Inspection.tsx` | 방 2 환각의 방 (라운드제 검수) |
| `src/components/Room3Search.tsx` | 방 3 서가의 방 (검색) |
| `src/components/Guide.tsx` | 임무, 다음 수, 힌트, 퀴즈 공통 요소 |
| `src/api.ts` | 화면과 서버 사이의 유일한 연결 지점 |
| `src/mock/` | 백엔드가 없을 때 쓰는 시연용 대본과 정답 |
| `src/index.css` | 전체 스타일. 색과 글꼴은 맨 위 `:root` 토큰 |

## FastAPI 서버 연결 (6주차)

1. `.env.example`을 `.env`로 복사하고 `VITE_API_URL`에 서버 주소를 넣는다. Vercel에서는 프로젝트 환경변수에 같은 이름으로 넣는다.
2. 서버는 아래 주소를 구현한다.

```
POST /rooms/1/press    요청 {"statement_id": 2}
                       응답 {"reply": "..."}
POST /rooms/1/present  요청 {"statement_id": 2, "file_id": "F2"}
                       응답 {"hit": true, "reply": "...", "corrected": "정정된 진술"}
POST /interrogate      요청 {"level": 1, "nickname": "guest", "question": "..."}
                       응답 {"reply": "...", "source": {"id": "F1", "label": "근무일지 11/14", "text": "..."} 또는 null}
POST /evidence         요청 {"level": 1, "nickname": "guest", "word": "..."}
                       응답 {"correct": true}
POST /rooms/2/check    요청 {"round": 0, "rejected": [2, 4]}
                       응답 {"correct": 4, "total": 4}
POST /rooms/3/ask      요청 {"query": "개관"}
                       응답 {"found": 2, "docs": [{"id": "D05", "title": "미술관 연혁", "date": "2024년 정리"}],
                             "reply": "...", "sources": [{"id": "D05", "label": "미술관 연혁 (2024년 정리)"}]}
POST /rooms/3/check    요청 {"code": "1987"}
                       응답 {"correct": true, "note": ""}
POST /final/check      요청 {"code": "0000"}
                       응답 {"correct": false, "note": "..."}
```

3. 서버를 연결하면 정답과 방 자료는 서버에만 둔다. `src/mock`은 로컬 시연용으로만 남긴다.
4. 서버의 CORS 허용 목록에 Vercel 배포 주소를 넣는다.

## 비주얼·음성·음악

| 요소 | 지금 | 이후 |
|---|---|---|
| 문지기 초상 | `src/components/Portrait.tsx`. 도 씨, 루미, 고 선생의 얼굴과 표정 10가지 | 공사 중인 두 방의 문지기 |
| 전시 작품 | `src/components/Artwork.tsx`. 환각의 방 작품 3점을 코드로 그린 그림 | 유화, 수채 질감의 그림으로 교체 |
| 서가 | `src/components/Bookshelf.tsx`. 전달된 책과 잘린 책을 보여 주는 책장, 책 넘기는 움직임 | 임베딩 검색의 순위와 점수 표시 |
| 목소리 | 브라우저 기본 음성(Web Speech API). 기본은 꺼짐 | ElevenLabs. 키는 서버에 두고 FastAPI `/tts`가 호출 |
| 배경음·효과음 | 버튼 자리만 있음 | Suno로 만든 음원 파일 |

소리는 사용자가 켰을 때만 나오고, 글만으로 모든 기능을 쓸 수 있어야 한다.

## 보안 메모

- API 키는 프런트엔드에 두지 않는다. `VITE_`로 시작하는 값은 브라우저에 그대로 노출된다.
- 시연용 대본에는 방 3개의 정답이 들어 있다. 백엔드 연결 전까지만 쓰는 임시 구조다.

## 기록할 것 (강의 조건)

모델, 방별 프롬프트, 검증 결과와 탈출률 변화를 이 README 또는 `docs/`에 주차별로 남긴다.
