// 서가의 방 그림: 사서가 넘기는 책. 서가 자체는 Archive.tsx가 자료실 장면 안에 그린다.

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
