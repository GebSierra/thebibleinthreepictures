/**
 * "Share my results" (plan task T3.9). Plain text a pilot tester can paste
 * into a text or email to Geb. Holds no name or address.
 */
import type { TestOutRecord } from './storage.ts'
import type { Item } from './types.ts'

export function resultsSummary(rec: TestOutRecord, items: Item[], lessonsDone: Record<string, string>): string {
  const day = rec.date.slice(0, 10)
  const lines = [
    'The Bible in Three Pictures: Level 1 test-out',
    `Date: ${day}`,
    `Score: ${rec.score} of ${rec.max} (${rec.passed ? 'passed' : 'not passed yet'})`,
  ]
  const finished = Object.entries(lessonsDone).sort(([a], [b]) => a.localeCompare(b))
  if (finished.length) {
    const last = finished.map(([, d]) => d).sort().at(-1)!.slice(0, 10)
    lines.push(`Lessons finished: ${finished.length}, last on ${last}`)
  }
  lines.push('', 'By item:')
  for (const r of rec.results) {
    const it = items.find((i) => i.id === r.itemId)
    lines.push(`${it?.testOut ?? '?'} ${r.itemId}: ${r.points} of ${r.max}`)
  }
  return lines.join('\n')
}
