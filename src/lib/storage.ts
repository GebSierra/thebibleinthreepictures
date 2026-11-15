/**
 * Saved progress (plan task T3.3). The only module that touches browser storage.
 * Later the same two functions can talk to a server.
 */
import { isStoredCard, type StoredCard } from './schedule.ts'

export const STORAGE_KEY = 'b3p.v1'

export interface TestOutRecord {
  date: string
  score: number
  max: number
  passed: boolean
  results: { itemId: string; points: number; max: number }[]
}

export interface AppState {
  v: 1
  /** lesson id -> ISO date finished */
  lessonsDone: Record<string, string>
  /** item id -> review card */
  cards: Record<string, StoredCard>
  testOuts: TestOutRecord[]
  level2Unlocked: boolean
  /** Only a flag. The email address itself is never stored on the device. */
  emailSignedUp: boolean
}

/** The subset of the Web Storage API we use. Lets tests pass a fake. */
export interface KeyValue {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function emptyState(): AppState {
  return { v: 1, lessonsDone: {}, cards: {}, testOuts: [], level2Unlocked: false, emailSignedUp: false }
}

function defaultStore(): KeyValue | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null // storage can throw when blocked
  }
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === 'object' && !Array.isArray(x)
}

function isTestOut(x: unknown): x is TestOutRecord {
  return (
    isRecord(x) && typeof x.date === 'string' && typeof x.score === 'number' &&
    typeof x.max === 'number' && typeof x.passed === 'boolean' && Array.isArray(x.results)
  )
}

/** Keep what is valid, drop what is not. Never throws. */
export function sanitize(raw: unknown): AppState {
  const s = emptyState()
  if (!isRecord(raw) || raw.v !== 1) return s
  if (isRecord(raw.lessonsDone)) {
    for (const [k, v] of Object.entries(raw.lessonsDone)) if (typeof v === 'string') s.lessonsDone[k] = v
  }
  if (isRecord(raw.cards)) {
    for (const [k, v] of Object.entries(raw.cards)) if (isStoredCard(v)) s.cards[k] = v
  }
  if (Array.isArray(raw.testOuts)) s.testOuts = raw.testOuts.filter(isTestOut)
  s.level2Unlocked = raw.level2Unlocked === true
  s.emailSignedUp = raw.emailSignedUp === true
  return s
}

export function loadState(store: KeyValue | null = defaultStore()): AppState {
  if (!store) return emptyState()
  try {
    const text = store.getItem(STORAGE_KEY)
    return text ? sanitize(JSON.parse(text)) : emptyState()
  } catch {
    return emptyState()
  }
}

/** Returns false if the save failed (storage full or blocked). The app keeps working. */
export function saveState(state: AppState, store: KeyValue | null = defaultStore()): boolean {
  if (!store) return false
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

/** Ask the browser to keep our data. Ignore a "no". See docs/stack.md. */
export async function requestPersist(): Promise<boolean> {
  try {
    return (await globalThis.navigator?.storage?.persist?.()) ?? false
  } catch {
    return false
  }
}
