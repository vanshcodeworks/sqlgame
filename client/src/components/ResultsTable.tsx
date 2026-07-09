import styles from './ResultsTable.module.css'

interface Props {
  columns: string[]
  rows: Array<Record<string, unknown>>
}

export function ResultsTable({ columns, rows }: Props) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col} className={styles.th}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={styles.tr}>
              {columns.map(col => (
                <td key={col} className={styles.td}>
                  {row[col] === null || row[col] === undefined
                    ? <span className={styles.null}>NULL</span>
                    : String(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
