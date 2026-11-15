/**
 * Review schedule (plan task T3.4). The only file that imports ts-fsrs,
 * so the library can be swapped for the old fixed ladder behind the same functions.
 */
import { createEmptyCard, fsrs, generatorParameters, Rating, type Card } from 'ts-fsrs'

/** A card as we store it: plain JSON, dates as ISO strings. */
export interface StoredCard {
  due: string
  stability: number
  difficulty: number
  scheduled_days: number
  reps: number
  lapses: number
  learning_steps: number
  state: number
  last_review?: string
}

const scheduler = fsrs(generatorParameters({ enable_fuzz: false }))

function toCard(c: StoredCard): Card {
  return {
    ...c,
    due: new Date(c.due),
    last_review: c.last_review ? new Date(c.last_review) : undefined,
  } as Card
}

function toStored(c: Card): StoredCard {
  const out: StoredCard = {
    due: c.due.toISOString(),
    stability: c.stability,
    difficulty: c.difficulty,
    scheduled_days: c.scheduled_days,
    reps: c.reps,
    lapses: c.lapses,
    learning_steps: c.learning_steps,
    state: c.state,
  }
  if (c.last_review) out.last_review = new Date(c.last_review).toISOString()
  return out
}

/** A new card, due now. Made when an item first joins the review queue. */
export function newCard(now: Date): StoredCard {
  return toStored(createEmptyCard(now))
}

/** Right maps to Good, wrong maps to Again. Returns the updated card. */
export function schedule(card: StoredCard, correct: boolean, now: Date): StoredCard {
  const next = scheduler.next(toCard(card), now, correct ? Rating.Good : Rating.Again)
  return toStored(next.card)
}

export function isDue(card: StoredCard, now: Date): boolean {
  return new Date(card.due).getTime() <= now.getTime()
}

/** Shape check for data read back from storage. */
export function isStoredCard(x: unknown): x is StoredCard {
  if (!x || typeof x !== 'object') return false
  const c = x as Record<string, unknown>
  return (
    typeof c.due === 'string' && !Number.isNaN(Date.parse(c.due)) &&
    ['stability', 'difficulty', 'scheduled_days', 'reps', 'lapses', 'learning_steps', 'state'].every(
      (k) => typeof c[k] === 'number' && Number.isFinite(c[k] as number),
    ) &&
    (c.last_review === undefined || (typeof c.last_review === 'string' && !Number.isNaN(Date.parse(c.last_review))))
  )
}
