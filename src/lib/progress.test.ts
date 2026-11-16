import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildLevel1 } from '../../scripts/content-lib.ts'
import {
  dueItems, finishLesson, isLessonOpen, nextLesson, reviewAnswer, shownPictures, struckPictures, testOutOpen,
} from './progress.ts'
import { emptyState } from './storage.ts'

const c = buildLevel1(
  readFileSync('content/sessions.yaml', 'utf8'),
  readFileSync('content/items.yaml', 'utf8'),
  readFileSync('content/test-outs.md', 'utf8'),
  'preview',
)
const T0 = new Date('2026-11-15T12:00:00Z')
const later = (days: number) => new Date(T0.getTime() + days * 86400000)
const right = { points: 1, max: 1, correct: true, empty: false }

describe('progress', () => {
  it('starts at The World, with only that lesson open', () => {
    const s = emptyState()
    expect(nextLesson(c, s)?.id).toBe('L1-01')
    expect(isLessonOpen(c, s, 'L1-01')).toBe(true)
    expect(isLessonOpen(c, s, 'L1-02')).toBe(false)
    expect(testOutOpen(c, s)).toBe(false)
  })

  it('finishing a lesson opens the next and queues its review items, not its choice items', () => {
    const s = finishLesson(c, emptyState(), 'L1-01', {}, T0)
    expect(nextLesson(c, s)?.id).toBe('L1-02')
    expect(Object.keys(s.cards).sort()).toEqual(['I1-key-event-world', 'I1-promise-chapter', 'I1-promise-words'])
    expect(s.cards['I1-first-picture']).toBeUndefined()
  })

  it('cards come due when the clock moves forward', () => {
    const s = finishLesson(c, emptyState(), 'L1-01', { 'I1-promise-chapter': right }, T0)
    const nowDue = dueItems(c, s, T0).map((i) => i.id)
    expect(nowDue).not.toContain('I1-promise-chapter') // answered right: not due yet
    expect(dueItems(c, s, later(3)).map((i) => i.id)).toContain('I1-promise-chapter')
  })

  it('a review answer reschedules the card', () => {
    let s = finishLesson(c, emptyState(), 'L1-01', {}, T0)
    s = reviewAnswer(s, 'I1-promise-chapter', true, later(1))
    expect(dueItems(c, s, later(1)).map((i) => i.id)).not.toContain('I1-promise-chapter')
  })

  it('the timeline shows learned pictures and strikes them only after the cross lesson', () => {
    let s = emptyState()
    for (const id of ['L1-01', 'L1-02', 'L1-03']) s = finishLesson(c, s, id, {}, T0)
    expect(shownPictures(c, s, 'The Cross')).toEqual(['The World', 'Egypt', 'The Land', 'The Cross'])
    expect(struckPictures(c, s)).toEqual([])
    s = finishLesson(c, s, 'L1-04', {}, T0)
    expect(struckPictures(c, s)).toEqual(['The World', 'Egypt', 'The Land'])
    expect(testOutOpen(c, s)).toBe(true)
  })
})
