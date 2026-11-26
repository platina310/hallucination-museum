// 가로 막대 그래프. 분석 페이지에서만 쓴다.
// 막대 옆에 값을 글로 적고, 올려 두거나 초점을 주면 설명이 뜨고, 아래에서 표로도 볼 수 있다.
export interface BarRow {
  label: string
  values: number[] // 계열마다 값 하나. 0~max
  texts: string[] // 막대 옆에 적는 글. 계열마다 하나
  tip?: string // 올려 두면 보이는 설명
}

export default function Bars({
  title,
  rows,
  max,
  series = [],
  note,
  columns,
}: {
  title: string
  rows: BarRow[]
  max: number
  series?: string[] // 계열이 둘 이상이면 범례에 쓰는 이름
  note?: string
  columns?: string[] // 표로 볼 때의 열 이름. 없으면 계열 이름을 쓴다
}) {
  const heads = columns ?? (series.length > 0 ? series : ['값'])
  return (
    <figure className="viz">
      <figcaption>{title}</figcaption>
      {series.length > 1 && (
        <ul className="viz-legend" aria-label="범례">
          {series.map((name, i) => (
            <li key={name}>
              <span className={`swatch s${i + 1}`} aria-hidden="true" />
              {name}
            </li>
          ))}
        </ul>
      )}
      <div className="bars" role="list">
        {rows.map((r) => (
          <div className="bar-row" role="listitem" key={r.label} tabIndex={0}>
            <span className="bar-label">{r.label}</span>
            <span className="bar-tracks">
              {r.values.map((v, i) => (
                <span className="bar-line" key={i}>
                  <span className="bar-track">
                    <span className={`bar s${i + 1}`} style={{ width: `${max > 0 ? Math.max(0, Math.min(100, (v / max) * 100)) : 0}%` }} />
                  </span>
                  <span className="bar-value">{r.texts[i]}</span>
                </span>
              ))}
            </span>
            {r.tip && (
              <span className="bar-tip" role="tooltip">
                {r.tip}
              </span>
            )}
          </div>
        ))}
      </div>
      {note && <p className="viz-note">{note}</p>}
      <details className="viz-table">
        <summary>표로 보기</summary>
        <div className="tablewrap">
          <table className="fit">
            <thead>
              <tr>
                <th>항목</th>
                {heads.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <td>{r.label}</td>
                  {r.texts.map((t, i) => (
                    <td key={i}>{t}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  )
}
