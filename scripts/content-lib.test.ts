import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parse, stringify } from 'yaml'
import { buildLevel1, ContentError, parseTestOut } from './content-lib.ts'

const SESSIONS = readFileSync('content/sessions.yaml', 'utf8')
const ITEMS = readFileSync('content/items.yaml', 'utf8')
const TESTOUTS = readFileSync('content/test-outs.md', 'utf8')

/** Mark every Level 1 slot and item approved, filling Geb's gaps with test text. */
function approveAll(): { sessions: string; items: string } {
  const s = parse(SESSIONS)
  for (const x of s.sessions.filter((x: any) => x.level === 1)) {
    for (const k of Object.keys(x)) {
      const v = x[k]
      if (v && typeof v === 'object' && 'status' in v && 'owner' in v) {
        if (v.status === 'empty' && ['key_event', 'one_line'].includes(k)) v.value = `TEST ${k}`
        if (v.value !== null && v.value !== undefined) v.status = 'approved'
      }
    }
  }
  const it = parse(ITEMS)
  for (const i of it.items) for (const f of ['prompt', 'answer', 'accept']) if (i[f]) i[f].status = 'approved'
  return { sessions: stringify(s), items: stringify(it) }
}

describe('content build (T3.1)', () => {
  it('reads the Level 1 test-out: 14 points, pass at 12', () => {
    const t = parseTestOut(TESTOUTS, 1)
    expect(t.total).toBe(14)
    expect(t.pass).toBe(12)
    expect(t.parts.map((p) => p.id)).toEqual(['T1.1', 'T1.2', 'T1.3', 'T1.4', 'T1.5', 'T1.6'])
  })

  it('preview build keeps drafts and flags them', () => {
    const c = buildLevel1(SESSIONS, ITEMS, TESTOUTS, 'preview')
    expect(c.lessons.map((l) => l.id)).toEqual(['L1-01', 'L1-02', 'L1-03', 'L1-04'])
    expect(c.lessons[0].christPoint?.draft).toBe(true)
    expect(c.lessons[0].keyEvent).toBeNull() // Geb's slot, still empty
    const ke = c.items.find((i) => i.id === 'I1-key-event-world')!
    expect(ke.answer).toEqual({ value: 'TBD (Geb): L1-01.key_event', draft: true })
  })

  it('production build fails today: the test-out depends on unwritten content', () => {
    expect(() => buildLevel1(SESSIONS, ITEMS, TESTOUTS, 'production')).toThrow(ContentError)
    expect(() => buildLevel1(SESSIONS, ITEMS, TESTOUTS, 'production')).toThrow(/T1.2 \(0 of 4/)
  })

  it('production build holds no draft content once everything is approved', () => {
    const { sessions, items } = approveAll()
    const c = buildLevel1(sessions, items, TESTOUTS, 'production')
    expect(JSON.stringify(c)).not.toContain('"draft":true')
    expect(c.items.find((i) => i.id === 'I1-key-event-world')!.answer?.value).toBe('TEST key_event')
  })

  it('production build drops a single unapproved item and reports the gap', () => {
    const { sessions, items } = approveAll()
    const it = parse(items)
    it.items.find((i: any) => i.id === 'I1-exodus-gospel').answer.status = 'draft'
    expect(() => buildLevel1(sessions, stringify(it), TESTOUTS, 'production')).toThrow(/T1.5 \(0 of 1/)
  })

  it('lists each lesson\'s check items in order', () => {
    const c = buildLevel1(SESSIONS, ITEMS, TESTOUTS, 'preview')
    const l4 = c.lessons.find((l) => l.id === 'L1-04')!
    expect(l4.items[0]).toBe('I1-order-pictures')
    for (const l of c.lessons) expect(l.items.length).toBeGreaterThanOrEqual(3)
  })

  it('builds the whole story: four stages, three words each, five dates, no lesson content', () => {
    const c = buildLevel1(SESSIONS, ITEMS, TESTOUTS, 'preview')
    expect(c.story.map((s) => s.picture)).toEqual(['The World', 'Egypt', 'The Land', 'The Cross'])
    expect(c.story.map((s) => s.label)).toEqual(['Stage A', 'Stage B', 'Stage C', 'Stage C'])
    expect(c.story.flatMap((s) => s.words.map((w) => w.word))).toEqual([
      'Adam', 'Ark', 'Abraham', 'Bondage', 'Break Free', 'Battle', 'Crowned', 'Cut', 'Captivity', 'Christ', 'Church', 'Consummation',
    ])
    expect(c.story.flatMap((s) => s.words).filter((w) => w.date).length).toBe(5)
    expect(Object.keys(c.story[0].words[0]).sort()).toEqual(['date', 'word'])
  })
})
