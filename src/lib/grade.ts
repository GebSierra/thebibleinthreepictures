/**
 * Grading for the six item types (plan task T3.5). Pure functions.
 * The app grades order, type_word, strike and choice. The learner grades
 * self_check and speak_timed.
 */
import { strikableOnly } from './pictures.ts'
import type { Item } from './types.ts'

export interface Grade {
  points: number
  max: number
  correct: boolean
  /** The learner gave nothing. */
  empty: boolean
}

function result(points: number, max: number, empty = false): Grade {
  return { points, max, correct: !empty && points === max, empty }
}

function maxFor(item: Item, fallback: number): number {
  return item.points ?? fallback
}

/** Lowercase, trim, drop punctuation except ":" and collapse spaces. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9: ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** order: one point per picture in its right place. */
export function gradeOrder(item: Item, placed: (string | null)[]): Grade {
  const answer = (item.answer?.value as string[]) ?? []
  const max = maxFor(item, answer.length)
  if (!placed.some((p) => p)) return result(0, max, true)
  const hits = answer.filter((name, i) => placed[i] === name).length
  return result(Math.round((hits * max) / answer.length), max)
}

/** type_word: right if the answer matches the accept list after normalizing. */
export function gradeTypeWord(item: Item, typed: string): Grade {
  const max = maxFor(item, 1)
  const t = normalize(typed)
  if (!t) return result(0, max, true)
  const ok = [...(item.accept ?? []), String(item.answer?.value ?? '')].map(normalize).includes(t)
  return result(ok ? max : 0, max)
}

/** strike: right only if exactly the three pictures are struck. The cross can never be struck. */
export function gradeStrike(item: Item, tapped: string[]): Grade {
  const max = maxFor(item, 1)
  if (!tapped.length) return result(0, max, true)
  const want = [...((item.answer?.value as string[]) ?? [])].sort()
  const got = strikableOnly(tapped).sort()
  const touchedCross = tapped.length !== got.length
  const ok = !touchedCross && want.length === got.length && want.every((w, i) => w === got[i])
  return result(ok ? max : 0, max)
}

/** choice: lessons only. */
export function gradeChoice(item: Item, picked: string | null): Grade {
  const max = 1
  if (!picked) return result(0, max, true)
  return result(picked === item.answer?.value ? max : 0, max)
}

/**
 * self_check: the learner writes or says an answer, sees the model answer, marks it.
 * Nothing written counts as empty and scores zero, whatever they mark.
 */
export function gradeSelfCheck(item: Item, written: string, markedRight: boolean | null): Grade {
  const max = maxFor(item, 1)
  if (!written.trim() || markedRight === null) return result(0, max, true)
  return result(markedRight ? max : 0, max)
}

/** speak_timed: one point per check the learner (or a partner) ticks. */
export function gradeSpeakTimed(item: Item, ticked: boolean[]): Grade {
  const checks = item.checks ?? []
  const max = maxFor(item, checks.length)
  if (!ticked.length) return result(0, max, true)
  const n = checks.filter((_, i) => ticked[i] === true).length
  return result(Math.round((n * max) / Math.max(checks.length, 1)), max)
}
