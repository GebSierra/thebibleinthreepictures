import { describe, expect, it } from 'vitest'
import { newCard } from './schedule.ts'
import { emptyState, loadState, saveState, STORAGE_KEY, type KeyValue } from './storage.ts'

function fakeStore(initial: Record<string, string> = {}): KeyValue & { data: Record<string, string> } {
  const data = { ...initial }
  return { data, getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => void (data[k] = v) }
}

const T0 = new Date('2026-11-15T12:00:00Z')

describe('storage (T3.3)', () => {
  it('state survives a reload', () => {
    const store = fakeStore()
    const s = emptyState()
    s.lessonsDone['L1-01'] = T0.toISOString()
    s.cards['I1-promise-chapter'] = newCard(T0)
    s.emailSignedUp = true
    expect(saveState(s, store)).toBe(true)
    expect(loadState(store)).toEqual(s)
  })

  it('bad stored data does not crash the app', () => {
    for (const junk of ['{not json', 'null', '"text"', '[]', '{"v":99}', '{"v":1,"cards":"x","testOuts":{}}']) {
      expect(loadState(fakeStore({ [STORAGE_KEY]: junk }))).toEqual(emptyState())
    }
  })

  it('keeps the good parts of half-broken data', () => {
    const good = newCard(T0)
    const store = fakeStore({
      [STORAGE_KEY]: JSON.stringify({
        v: 1,
        lessonsDone: { 'L1-01': '2026-11-15', 'L1-02': 7 },
        cards: { a: good, b: { due: 'never' } },
        testOuts: [{ date: 'x', score: 12, max: 14, passed: true, results: [] }, { score: 'lots' }],
        level2Unlocked: 'yes',
      }),
    })
    const s = loadState(store)
    expect(s.lessonsDone).toEqual({ 'L1-01': '2026-11-15' })
    expect(Object.keys(s.cards)).toEqual(['a'])
    expect(s.testOuts).toHaveLength(1)
    expect(s.level2Unlocked).toBe(false)
  })

  it('works with no storage at all', () => {
    expect(loadState(null)).toEqual(emptyState())
    expect(saveState(emptyState(), null)).toBe(false)
  })

  it('a storage that throws does not crash the app', () => {
    const angry: KeyValue = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('full')
      },
    }
    expect(loadState(angry)).toEqual(emptyState())
    expect(saveState(emptyState(), angry)).toBe(false)
  })

  it('never stores an email address, only the flag', () => {
    const store = fakeStore()
    const s = { ...emptyState(), emailSignedUp: true, email: 'someone@example.com' } as never
    saveState(loadState(fakeStore({ [STORAGE_KEY]: JSON.stringify(s) })), store)
    expect(store.data[STORAGE_KEY]).not.toContain('@')
  })
})
