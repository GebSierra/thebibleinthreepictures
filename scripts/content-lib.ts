/**
 * Turn content/*.yaml into the app's typed JSON (plan task T3.1).
 * Production keeps only approved content. Preview keeps drafts, flagged.
 * Pure functions: the CLI in build-content.ts does the file and process work.
 */
import { parse } from 'yaml'
import type { Item, LevelContent, Lesson, Slot, TestOutPart } from '../src/lib/types.ts'

type Mode = 'preview' | 'production'
type RawSlot = { owner: string; status: string; value?: unknown; from?: string }
type RawSession = Record<string, any>
type RawItem = Record<string, any>

export class ContentError extends Error {}

function slotOut<T>(raw: RawSlot | undefined, mode: Mode): Slot<T> | null {
  if (!raw || raw.status === 'empty') return null
  const v = raw.value as T
  if (v === null || v === undefined || (Array.isArray(v) && v.length === 0) || v === '') return null
  if (raw.status === 'approved') return { value: v, draft: false }
  return mode === 'preview' ? { value: v, draft: true } : null
}

function resolveFrom(raw: RawSlot | undefined, sessions: Map<string, RawSession>): RawSlot | undefined {
  if (!raw || !raw.from) return raw
  const [sid, field] = raw.from.split('.')
  const s = sessions.get(sid)
  const target = s?.[field] as RawSlot | undefined
  if (!target) throw new ContentError(`cannot resolve ${raw.from}`)
  // The item's own status cannot be better than the slot it borrows from.
  const rank = { empty: 0, draft: 1, approved: 2 } as Record<string, number>
  const status = (rank[target.status] ?? 0) < (rank[raw.status] ?? 0) ? target.status : raw.status
  return { owner: target.owner, status: target.status === 'empty' ? 'empty' : status, value: target.value }
}

export function parseTestOut(md: string, level: number): { parts: TestOutPart[]; total: number; pass: number } {
  const parts: TestOutPart[] = []
  const rx = new RegExp(`^\\|\\s*(T${level}\\.\\d+)\\s*\\|\\s*([^|]+?)\\s*\\|\\s*(\\d+)\\s*\\|`)
  let inLevel = false
  let pass = 0
  for (const line of md.split('\n')) {
    if (line.startsWith('## ')) inLevel = line.startsWith(`## Level ${level} `)
    if (!inLevel) continue
    const m = line.match(rx)
    if (m) parts.push({ id: m[1], task: m[2], points: Number(m[3]) })
    const p = line.match(/Pass:\s*(\d+)/)
    if (p) pass = Number(p[1])
  }
  const total = parts.reduce((a, b) => a + b.points, 0)
  if (!parts.length || !pass) throw new ContentError(`no Level ${level} test-out table found`)
  return { parts, total, pass }
}

function buildItem(raw: RawItem, sessions: Map<string, RawSession>, mode: Mode): Item | null {
  const prompt = slotOut<string>(resolveFrom(raw.prompt, sessions), mode)
  const answerRaw = resolveFrom(raw.answer, sessions)
  let answer = slotOut<string | string[]>(answerRaw, mode)
  const accept = slotOut<string[]>(raw.accept, mode)
  if (!prompt) return null
  // Preview only: a gap Geb has not written yet shows as a marked placeholder.
  if (mode === 'preview' && raw.answer && !answer) {
    answer = { value: `TBD (Geb): ${raw.answer.from ?? raw.id}`, draft: true }
  }
  // An item whose answer exists but is not usable in this build is left out.
  if (raw.answer && !answer && raw.type !== 'speak_timed') return null
  if (raw.accept && !accept) return null
  return {
    id: raw.id,
    type: raw.type,
    sessions: raw.sessions,
    testOut: raw.test_out,
    use: raw.use,
    points: raw.points ?? null,
    prompt,
    answer,
    accept: accept ? accept.value.map((a) => String(a)) : null,
    options: raw.options ?? null,
    seconds: raw.seconds ?? null,
    checks: raw.checks ?? null,
  }
}

function buildLesson(s: RawSession, items: Item[], mode: Mode): Lesson {
  return {
    id: s.id,
    picture: s.picture,
    stageKey: s.stage_key,
    stageLabel: s.stage_label,
    title: s.title.value,
    recall: s.rail.recall,
    keyEvent: slotOut(s.key_event, mode),
    christPoint: slotOut(s.christ_point, mode),
    read: slotOut(s.read, mode),
    thinkItThrough: slotOut(s.find_it, mode),
    oneLine: slotOut(s.one_line, mode),
    teachingNote: slotOut(s.teaching_note, mode),
    items: items.filter((i) => i.sessions.includes(s.id) && i.use.includes('lesson')).map((i) => i.id),
    prepares_for: s.prepares_for,
  }
}

export function buildLevel1(sessionsYaml: string, itemsYaml: string, testOutsMd: string, mode: Mode, now = new Date()): LevelContent {
  const sessionsList: RawSession[] = parse(sessionsYaml).sessions
  const sessions = new Map(sessionsList.map((s) => [s.id, s]))
  const rawItems: RawItem[] = parse(itemsYaml).items.filter((i: RawItem) => i.level === 1)
  const items = rawItems.map((r) => buildItem(r, sessions, mode)).filter((i): i is Item => i !== null)
  const lessons = sessionsList.filter((s) => s.level === 1 && s.kind === 'lesson').map((s) => buildLesson(s, items, mode))
  const testOut = parseTestOut(testOutsMd, 1)

  // The test-out must still add up in this build, or the app would be broken.
  const got = new Map<string, number>()
  for (const i of items) if (i.use.includes('test_out')) got.set(i.testOut, (got.get(i.testOut) ?? 0) + (i.points ?? 0))
  const missing = testOut.parts.filter((p) => got.get(p.id) !== p.points)
  if (missing.length) {
    const list = missing.map((p) => `${p.id} (${got.get(p.id) ?? 0} of ${p.points} points ready)`).join(', ')
    throw new ContentError(`${mode} build: the Level 1 test-out is not complete: ${list}`)
  }
  if (mode === 'production' && JSON.stringify({ lessons, items }).includes('"draft":true')) {
    throw new ContentError('production build holds draft content')
  }
  return { level: 1, build: mode, builtAt: now.toISOString(), lessons, items, testOut }
}
