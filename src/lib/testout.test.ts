import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildLevel1 } from '../../scripts/content-lib.ts'
import type { Grade } from './grade.ts'
import { resultsSummary } from './share.ts'
import { emptyState } from './storage.ts'
import { recordTestOut, scoreTestOut, testOutItems, TestOutError } from './testout.ts'

const content = buildLevel1(
  readFileSync('content/sessions.yaml', 'utf8'),
  readFileSync('content/items.yaml', 'utf8'),
  readFileSync('content/test-outs.md', 'utf8'),
  'preview',
)
const T0 = new Date('2026-11-29T15:00:00Z')

/** Full marks, then take away `lose` points from the first items that have them. */
function grades(lose: number): Record<string, Grade> {
  const out: Record<string, Grade> = {}
  for (const i of testOutItems(content)) {
    const max = i.points ?? 0
    const take = Math.min(lose, max)
    lose -= take
    out[i.id] = { points: max - take, max, correct: take === 0, empty: false }
  }
  return out
}

describe('Level 1 test-out (T3.8)', () => {
  it('is worth 14 points', () => {
    expect(testOutItems(content).reduce((a, i) => a + (i.points ?? 0), 0)).toBe(14)
    expect(scoreTestOut(content, grades(0)).score).toBe(14)
  })

  it('12 passes', () => {
    expect(scoreTestOut(content, grades(2))).toMatchObject({ score: 12, passed: true })
  })

  it('11 fails', () => {
    expect(scoreTestOut(content, grades(3))).toMatchObject({ score: 11, passed: false })
  })

  it('has no choice items', () => {
    expect(testOutItems(content).some((i) => i.type === 'choice')).toBe(false)
  })

  it('refuses a choice item if one slips in', () => {
    const bad = { ...content, items: content.items.map((i) => (i.type === 'choice' ? { ...i, use: [...i.use, 'test_out' as const], points: 1 } : i)) }
    expect(() => testOutItems(bad)).toThrow(TestOutError)
  })

  it('passing sets the Level 2 flag; a later fail does not clear it', () => {
    const passed = recordTestOut(emptyState(), scoreTestOut(content, grades(2)), T0)
    expect(passed.level2Unlocked).toBe(true)
    const failedLater = recordTestOut(passed, scoreTestOut(content, grades(9)), T0)
    expect(failedLater.level2Unlocked).toBe(true)
    expect(failedLater.testOuts).toHaveLength(2)
  })

  it('failing does not set the Level 2 flag', () => {
    expect(recordTestOut(emptyState(), scoreTestOut(content, grades(3)), T0).level2Unlocked).toBe(false)
  })

  it('unanswered items score zero', () => {
    expect(scoreTestOut(content, {}).score).toBe(0)
  })
})

describe('Share my results (T3.9)', () => {
  it('holds score, date and item results', () => {
    const s = recordTestOut(emptyState(), scoreTestOut(content, grades(2)), T0)
    const text = resultsSummary(s.testOuts[0], content.items, { 'L1-01': '2026-11-10T10:00:00Z', 'L1-04': '2026-11-14T10:00:00Z' })
    expect(text).toContain('Score: 12 of 14 (passed)')
    expect(text).toContain('Date: 2026-11-29')
    expect(text).toContain('Lessons finished: 2, last on 2026-11-14')
    for (const i of testOutItems(content)) expect(text).toContain(`${i.testOut} ${i.id}:`)
    expect(text).toContain('T1.1 I1-order-pictures: 2 of 4')
  })
})
