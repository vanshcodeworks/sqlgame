import { levelArcId as levelArcIdFromShared } from '@queryquest/shared'

export interface ArcDef {
  id: number
  title: string
  sector: string
  levels: [number, number]  // [min, max] level IDs inclusive
  color: string
  skills: string[]
  story: string
}

// Arc metadata — maps arcId → levels within it
export const ARC_DEFS: ArcDef[] = [
  {
    id: 1, title: 'The Hunger Algorithm', sector: 'SECTOR 1 · Agriculture',
    levels: [1, 5], color: 'var(--accent-cyan)',
    skills: ['SELECT', 'WHERE', 'ORDER BY', 'LIMIT'],
    story: 'People starving over a missing WHERE clause. The fix is heartbreakingly simple.',
  },
  {
    id: 2, title: 'The Divided City', sector: 'SECTOR 2 · Population',
    levels: [6, 10], color: 'var(--accent-purple)',
    skills: ['INNER JOIN', 'LEFT JOIN', 'Aggregates', 'Subqueries'],
    story: 'Two cities at war for 140 years — over a deleted JOIN key.',
  },
  {
    id: 3, title: 'The Underground Market', sector: 'SECTOR 3 · Commerce',
    levels: [11, 16], color: 'var(--accent-green)',
    skills: ['DISTINCT', 'LIKE', 'HAVING', 'EXISTS', 'CASE WHEN'],
    story: 'Black-market data traded by rebels who know what the Archive hides.',
  },
]

export function levelArcId(levelId: number): number {
  return levelArcIdFromShared(levelId)
}
