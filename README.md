# 묵비권

AI 용의자가 숨긴 단어를 심문으로 받아 내는 프롬프트 보안 훈련 게임.
KAIST 디지털금융MBA 「금융빅데이터분석실습」 팀 프로젝트의 프런트엔드(React)와 팀 페이지다.

## 현재 상태 (5주차 아이디어 공유용)

- 팀 페이지: 대상 사용자와 문제, 데이터와 분석 방향, LLM·RAG·에이전트 계획, 강의 조건 대조표, 일정
- 레벨 1 심문실: 입력·로딩·오류·응답·출처 표시, 증거 제출 판정
- 백엔드는 아직 없다. 심문 답변은 `src/mock/level1.ts`의 정해진 대본으로 나온다

## 실행 방법

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 타입 검사 후 dist/ 생성
```

## 폴더 구조

| 경로 | 역할 |
|---|---|
| `src/pages/TeamPage.tsx` | 팀 페이지. 표 내용은 파일 위쪽 배열만 고치면 된다 |
| `src/components/InterrogationRoom.tsx` | 심문실 화면 |
| `src/api.ts` | 화면과 서버 사이의 유일한 연결 지점 |
| `src/mock/level1.ts` | 백엔드가 없을 때 쓰는 시연용 대본 |
| `src/types.ts` | 요청·응답 자료형 |
| `src/index.css` | 전체 스타일. 색과 글꼴은 맨 위 `:root` 토큰 |

## FastAPI 서버 연결 (6주차)

1. `.env.example`을 `.env`로 복사하고 `VITE_API_URL`에 서버 주소를 넣는다. Vercel에서는 프로젝트 환경변수에 같은 이름으로 넣는다.
2. 서버는 아래 두 주소를 구현한다.

```
POST /interrogate   요청 {"level": 1, "nickname": "guest", "question": "..."}
                    응답 {"reply": "...", "source": {"id": "F1", "label": "근무일지 11/14", "text": "..."} 또는 null}
POST /evidence      요청 {"level": 1, "nickname": "guest", "word": "..."}
                    응답 {"correct": true}
```

3. 서버를 연결하면 암호 단어와 사건 파일은 서버에만 둔다. `src/mock`은 로컬 시연용으로만 남긴다.
4. 서버의 CORS 허용 목록에 Vercel 배포 주소를 넣는다.

## 비주얼·음성·음악

| 요소 | 지금 | 이후 |
|---|---|---|
| 용의자 초상 | `src/components/SuspectPortrait.tsx`의 표정 4단계 그림 | 용의자별 초상으로 교체 |
| 목소리 | 브라우저 기본 음성(Web Speech API). 기본은 꺼짐 | ElevenLabs. 키는 서버에 두고 FastAPI `/tts`가 호출 |
| 배경음·효과음 | 버튼 자리만 있음 | Suno로 만든 음원 파일 |

소리는 사용자가 켰을 때만 나오고, 글만으로 모든 기능을 쓸 수 있어야 한다.

## 보안 메모

- API 키는 프런트엔드에 두지 않는다. `VITE_`로 시작하는 값은 브라우저에 그대로 노출된다.
- 시연용 대본에는 레벨 1 정답이 들어 있다. 백엔드 연결 전까지만 쓰는 임시 구조다.

## 기록할 것 (강의 조건)

모델, 레벨별 프롬프트, 검증 결과와 돌파율 변화를 이 README 또는 `docs/`에 주차별로 남긴다.
