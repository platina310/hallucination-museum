// 서가의 방 그림: 문서 12권이 꽂힌 책장과, 사서가 넘기는 책.
// 책장은 검색 결과를 눈으로 보여 준다. 뽑힌 책은 사서에게 전달된 문서, 빗금 친 책은 검색됐지만 잘린 문서다.

// 책등 높이. 보기 좋게 들쭉날쭉하게 둔다.
const HEIGHTS = [44, 52, 40, 56, 48, 42, 54, 46, 58, 44, 50, 54]

/** 문서 번호(D01 ~ D12)를 책장 칸 번호(0 ~ 11)로 바꾼다 */
function slot(id: string): number {
  return Number(id.replace(/\D/g, '')) - 1
}

export function Bookshelf({ count, given, cut, busy }: { count: number; given: string[]; cut: string[]; busy: boolean }) {
  const givenAt = given.map(slot)
  const cutAt = cut.map(slot)
  const searched = given.length > 0 || cut.length > 0
  return (
    <div className="bookcase">
      <div className={busy ? 'spines busy' : 'spines'} role="img" aria-label={describe(count, givenAt, cutAt)}>
        {Array.from({ length: count }, (_, i) => {
          const order = givenAt.indexOf(i)
          const state = order >= 0 ? 'given' : cutAt.includes(i) ? 'cut' : ''
          return (
            <span key={i} className={`spine ${state}`} style={{ height: HEIGHTS[i % HEIGHTS.length], animationDelay: `${i * 70}ms` }}>
              {order >= 0 && <b>{order + 1}</b>}
            </span>
          )
        })}
      </div>
      <div className="bookcase-ends" aria-hidden="true">
        <span>← 오래된 문서</span>
        <span>최근 문서 →</span>
      </div>
      {searched && (
        <p className="bookcase-legend" aria-hidden="true">
          <span className="key given" /> 사서에게 전달됨
          {cut.length > 0 && (
            <>
              <span className="key cut" /> 검색됐지만 잘림
            </>
          )}
        </p>
      )}
    </div>
  )
}

function describe(count: number, given: number[], cut: number[]): string {
  if (given.length === 0 && cut.length === 0) return `문서 ${count}권이 오래된 순서로 꽂힌 책장`
  const pos = (xs: number[]) => xs.map((x) => `${x + 1}번째`).join(', ')
  return `문서 ${count}권이 꽂힌 책장. 사서에게 전달된 책: ${pos(given)}.${cut.length > 0 ? ` 검색됐지만 잘린 책: ${pos(cut)}.` : ''}`
}

/** 펼친 책. 검색하는 동안 책장이 넘어간다. */
export function BookFlip() {
  return (
    <span className="book" aria-hidden="true">
      <span className="page left" />
      <span className="page right" />
      <span className="leaf" />
      <span className="leaf" />
      <span className="leaf" />
    </span>
  )
}
