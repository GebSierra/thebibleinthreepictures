import { describe, expect, it } from 'vitest'
import { isDue, isStoredCard, newCard, schedule } from './schedule.ts'

const T0 = new Date('2026-11-15T12:00:00Z')
const ms = (iso: string) => new Date(iso).getTime()

describe('schedule (T3.4), fixed clock', () => {
  it('a new card is due now', () => {
    const c = newCard(T0)
    expect(isDue(c, T0)).toBe(true)
    expect(isStoredCard(c)).toBe(true)
  })

  it('a right answer moves the due date later than a wrong one', () => {
    const c = newCard(T0)
    const right = schedule(c, true, T0)
    const wrong = schedule(c, false, T0)
    expect(ms(right.due)).toBeGreaterThan(ms(wrong.due))
    expect(ms(right.due)).toBeGreaterThan(T0.getTime())
  })

  it('right answers keep spacing a card further out', () => {
    let c = newCard(T0)
    let t = T0
    const gaps: number[] = []
    for (let i = 0; i < 4; i++) {
      c = schedule(c, true, t)
      gaps.push(ms(c.due) - t.getTime())
      t = new Date(c.due)
    }
    for (let i = 1; i < gaps.length; i++) expect(gaps[i]).toBeGreaterThan(gaps[i - 1])
  })

  it('a wrong answer on a well-known card brings it back sooner', () => {
    let c = newCard(T0)
    let t = T0
    for (let i = 0; i < 4; i++) {
      c = schedule(c, true, t)
      t = new Date(c.due)
    }
    const right = schedule(c, true, t)
    const wrong = schedule(c, false, t)
    expect(ms(wrong.due)).toBeLessThan(ms(right.due))
    expect(wrong.lapses).toBe(c.lapses + 1)
  })

  it('cards survive a JSON round trip', () => {
    const c = schedule(newCard(T0), true, T0)
    const back = JSON.parse(JSON.stringify(c))
    expect(isStoredCard(back)).toBe(true)
    expect(schedule(back, true, new Date(c.due)).due).toBe(schedule(c, true, new Date(c.due)).due)
  })

  it('isDue turns true once the clock passes the due date', () => {
    const c = schedule(newCard(T0), true, T0)
    expect(isDue(c, T0)).toBe(false)
    expect(isDue(c, new Date(ms(c.due) + 1))).toBe(true)
  })
})
