/**
 * Level 1 test-out (plan task T3.8). Recall only: no choice items, ever.
 */
import type { Grade } from './grade.ts'
import type { AppState, TestOutRecord } from './storage.ts'
import type { Item, LevelContent } from './types.ts'

export class TestOutError extends Error {}

/** The items that make up the test-out, in test-out part order. */
export function testOutItems(content: LevelContent): Item[] {
  const order = content.testOut.parts.map((p) => p.id)
  const items = content.items.filter((i) => i.use.includes('test_out'))
  if (items.some((i) => i.type === 'choice')) throw new TestOutError('choice items are not allowed in a test-out')
  const total = items.reduce((a, i) => a + (i.points ?? 0), 0)
  if (total !== content.testOut.total) {
    throw new TestOutError(`test-out items give ${total} points, expected ${content.testOut.total}`)
  }
  return [...items].sort((a, b) => order.indexOf(a.testOut) - order.indexOf(b.testOut))
}

export interface TestOutScore {
  score: number
  max: number
  pass: number
  passed: boolean
  results: { itemId: string; points: number; max: number }[]
}

/** Score a finished test-out. Missing answers score zero. */
export function scoreTestOut(content: LevelContent, grades: Record<string, Grade>): TestOutScore {
  const items = testOutItems(content)
  const results = items.map((i) => ({ itemId: i.id, points: grades[i.id]?.points ?? 0, max: i.points ?? 0 }))
  const score = results.reduce((a, r) => a + r.points, 0)
  const max = content.testOut.total
  return { score, max, pass: content.testOut.pass, passed: score >= content.testOut.pass, results }
}

/** Record the attempt. Passing opens Level 2. A later fail never closes it again. */
export function recordTestOut(state: AppState, s: TestOutScore, now: Date): AppState {
  const rec: TestOutRecord = { date: now.toISOString(), score: s.score, max: s.max, passed: s.passed, results: s.results }
  return { ...state, testOuts: [...state.testOuts, rec], level2Unlocked: state.level2Unlocked || s.passed }
}
