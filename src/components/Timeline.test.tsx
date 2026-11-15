import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Timeline } from './Timeline.tsx'

function slots(html: string) {
  return [...html.matchAll(/data-picture="([^"]+)" data-struck="(true|false)"[^>]*aria-label="([^"]+)"/g)].map((m) => ({
    name: m[1],
    struck: m[2] === 'true',
    label: m[3],
  }))
}

describe('Timeline (T3.2)', () => {
  it('draws the four pictures in order', () => {
    const s = slots(renderToStaticMarkup(<Timeline />))
    expect(s.map((x) => x.name)).toEqual(['The World', 'Egypt', 'The Land', 'The Cross'])
  })

  it('can strike the three pictures', () => {
    const html = renderToStaticMarkup(<Timeline struck={['The World', 'Egypt', 'The Land']} />)
    const s = slots(html)
    expect(s.slice(0, 3).every((x) => x.struck)).toBe(true)
    expect((html.match(/class="timeline-strike"/g) ?? []).length).toBe(3)
  })

  it('never strikes the cross, even when asked', () => {
    const html = renderToStaticMarkup(<Timeline struck={['The World', 'Egypt', 'The Land', 'The Cross']} />)
    const cross = slots(html).find((x) => x.name === 'The Cross')!
    expect(cross.struck).toBe(false)
    expect(cross.label).not.toContain('struck')
    expect((html.match(/class="timeline-strike"/g) ?? []).length).toBe(3)
  })

  it('gives each picture an aria label', () => {
    const s = slots(renderToStaticMarkup(<Timeline current="Egypt" struck={['The World']} />))
    expect(s.map((x) => x.label)).toEqual([
      'The World, Stage A, struck through',
      'Egypt, Stage B, you are here',
      'The Land, Stage C',
      'The Cross, Stage C',
    ])
  })

  it('labels the cross Stage C, never Stage Four', () => {
    expect(renderToStaticMarkup(<Timeline />)).not.toMatch(/stage four/i)
  })

  it('shows blank slots for pictures not yet learned', () => {
    const s = slots(renderToStaticMarkup(<Timeline shown={['The World']} />))
    expect(s[1].label).toBe('Stage B, not yet shown')
    expect(s[0].label).toBe('The World, Stage A')
  })
})
