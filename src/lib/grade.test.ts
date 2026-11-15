import { describe, expect, it } from 'vitest'
import {
  gradeChoice, gradeOrder, gradeSelfCheck, gradeSpeakTimed, gradeStrike, gradeTypeWord, normalize,
} from './grade.ts'
import type { Item } from './types.ts'

function item(over: Partial<Item>): Item {
  return {
    id: 'x', type: 'self_check', sessions: ['L1-01'], testOut: 'T1.1', use: ['lesson'], points: null,
    prompt: { value: 'p', draft: true }, answer: null, accept: null, options: null, seconds: null, checks: null,
    ...over,
  }
}

const ORDER = item({ type: 'order', points: 4, answer: { value: ['The World', 'Egypt', 'The Land', 'The Cross'], draft: false } })
const WORD = item({ type: 'type_word', points: 1, answer: { value: 'Genesis 3', draft: true }, accept: ['genesis 3', 'gen 3'] })
const STRIKE = item({ type: 'strike', points: 1, answer: { value: ['The World', 'Egypt', 'The Land'], draft: false } })
const CHOICE = item({ type: 'choice', options: ['The World', 'Egypt'], answer: { value: 'The World', draft: true } })
const SELF = item({ type: 'self_check', points: 1, answer: { value: 'God saves first, then gives the law.', draft: true } })
const SPEAK = item({ type: 'speak_timed', points: 2, seconds: 60, checks: ['All four', 'Inside 60 seconds'] })

describe('graders (T3.5): right, wrong, empty for each type', () => {
  it('order', () => {
    expect(gradeOrder(ORDER, ['The World', 'Egypt', 'The Land', 'The Cross'])).toMatchObject({ points: 4, correct: true })
    expect(gradeOrder(ORDER, ['Egypt', 'The World', 'The Land', 'The Cross'])).toMatchObject({ points: 2, correct: false })
    expect(gradeOrder(ORDER, [null, null, null, null])).toMatchObject({ points: 0, empty: true })
  })

  it('type_word', () => {
    expect(gradeTypeWord(WORD, '  Genesis 3. ')).toMatchObject({ points: 1, correct: true })
    expect(gradeTypeWord(WORD, 'GEN 3')).toMatchObject({ points: 1 })
    expect(gradeTypeWord(WORD, 'Exodus 20')).toMatchObject({ points: 0, correct: false, empty: false })
    expect(gradeTypeWord(WORD, '   ')).toMatchObject({ points: 0, empty: true })
  })

  it('strike', () => {
    expect(gradeStrike(STRIKE, ['The Land', 'The World', 'Egypt'])).toMatchObject({ points: 1, correct: true })
    expect(gradeStrike(STRIKE, ['The World', 'Egypt'])).toMatchObject({ points: 0, correct: false })
    expect(gradeStrike(STRIKE, [])).toMatchObject({ points: 0, empty: true })
  })

  it('strike: touching the cross is wrong', () => {
    expect(gradeStrike(STRIKE, ['The World', 'Egypt', 'The Land', 'The Cross'])).toMatchObject({ points: 0, correct: false })
  })

  it('choice', () => {
    expect(gradeChoice(CHOICE, 'The World')).toMatchObject({ points: 1, correct: true })
    expect(gradeChoice(CHOICE, 'Egypt')).toMatchObject({ points: 0, correct: false })
    expect(gradeChoice(CHOICE, null)).toMatchObject({ points: 0, empty: true })
  })

  it('self_check', () => {
    expect(gradeSelfCheck(SELF, 'God rescues, then gives the law', true)).toMatchObject({ points: 1, correct: true })
    expect(gradeSelfCheck(SELF, 'Not sure', false)).toMatchObject({ points: 0, correct: false })
    expect(gradeSelfCheck(SELF, '', true)).toMatchObject({ points: 0, empty: true })
    expect(gradeSelfCheck(SELF, 'something', null)).toMatchObject({ points: 0, empty: true })
  })

  it('speak_timed', () => {
    expect(gradeSpeakTimed(SPEAK, [true, true])).toMatchObject({ points: 2, correct: true })
    expect(gradeSpeakTimed(SPEAK, [true, false])).toMatchObject({ points: 1, correct: false })
    expect(gradeSpeakTimed(SPEAK, [])).toMatchObject({ points: 0, empty: true })
  })

  it('normalize ignores case, spaces and punctuation', () => {
    expect(normalize('  Gen.  3:15! ')).toBe('gen 3:15')
  })
})
