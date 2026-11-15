/**
 * Where the learner is: next lesson, cards due, what the timeline shows.
 * Pure functions over content and saved state. Screens call these; no screen
 * works this out on its own.
 */
import type { Grade } from './grade.ts'
import type { PictureName } from './pictures.ts'
import { isDue, newCard, schedule } from './schedule.ts'
import type { AppState } from './storage.ts'
import type { Item, Lesson, LevelContent } from './types.ts'

/** The first lesson not yet done, or null when all are done. */
export function nextLesson(c: LevelContent, s: AppState): Lesson | null {
  return c.lessons.find((l) => !s.lessonsDone[l.id]) ?? null
}

/** Lessons open in order: a lesson opens once every lesson before it is done. */
export function isLessonOpen(c: LevelContent, s: AppState, id: string): boolean {
  const i = c.lessons.findIndex((l) => l.id === id)
  return i >= 0 && c.lessons.slice(0, i).every((l) => s.lessonsDone[l.id])
}

export function lessonsDoneCount(c: LevelContent, s: AppState): number {
  return c.lessons.filter((l) => s.lessonsDone[l.id]).length
}

export function testOutOpen(c: LevelContent, s: AppState): boolean {
  return lessonsDoneCount(c, s) === c.lessons.length
}

/** Review items whose card is due now, oldest first. Only items allowed in review. */
export function dueItems(c: LevelContent, s: AppState, now: Date): Item[] {
  return c.items
    .filter((i) => i.use.includes('review') && s.cards[i.id] && isDue(s.cards[i.id], now))
    .sort((a, b) => s.cards[a.id].due.localeCompare(s.cards[b.id].due))
}

/** Pictures learned so far, plus the one being learned now. */
export function shownPictures(c: LevelContent, s: AppState, current?: PictureName): PictureName[] {
  const out = c.lessons.filter((l) => s.lessonsDone[l.id]).map((l) => l.picture)
  if (current && !out.includes(current)) out.push(current)
  return out
}

/** The pictures are struck once the cross lesson is done. Never the cross. */
export function struckPictures(c: LevelContent, s: AppState): PictureName[] {
  const cross = c.lessons.find((l) => l.picture === 'The Cross')
  return cross && s.lessonsDone[cross.id] ? ['The World', 'Egypt', 'The Land'] : []
}

/**
 * Finish a lesson: mark it done and put its review items in the queue.
 * Each item is scheduled from how the learner did on it in the lesson.
 */
export function finishLesson(c: LevelContent, s: AppState, lessonId: string, grades: Record<string, Grade>, now: Date): AppState {
  const cards = { ...s.cards }
  for (const i of c.items) {
    if (!i.sessions.includes(lessonId) || !i.use.includes('review') || cards[i.id]) continue
    const g = grades[i.id]
    cards[i.id] = schedule(newCard(now), g ? g.correct : false, now)
  }
  return { ...s, cards, lessonsDone: { ...s.lessonsDone, [lessonId]: s.lessonsDone[lessonId] ?? now.toISOString() } }
}

/** Record one review answer. */
export function reviewAnswer(s: AppState, itemId: string, correct: boolean, now: Date): AppState {
  const card = s.cards[itemId] ?? newCard(now)
  return { ...s, cards: { ...s.cards, [itemId]: schedule(card, correct, now) } }
}
