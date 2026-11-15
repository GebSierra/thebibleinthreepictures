/** Automated contrast check for the design tokens (plan task T2.2). WCAG AA: 4.5 for text, 3 for large text and marks. */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync('src/styles/tokens.css', 'utf8')
const tok = Object.fromEntries([...css.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]))

function lum(hex: string): number {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const [r, g, b] = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a: string, b: string): number {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

// [foreground, background, minimum]
const PAIRS: [string, string, number][] = [
  ['ink', 'bg', 4.5],
  ['ink', 'surface', 4.5],
  ['ink-muted', 'bg', 4.5],
  ['ink-muted', 'surface', 4.5],
  ['on-gold', 'gold', 4.5], // button text
  ['gold', 'bg', 4.5], // gold labels
  ['gold', 'surface', 4.5],
  ['sky', 'surface', 4.5], // "model answer" label
  ['on-gold', 'sky', 4.5], // text on a sky chip
  ['strike', 'bg', 3], // strike mark, not text
  ['line', 'bg', 1.3], // hairlines only, decoration
]

describe('design tokens meet WCAG AA', () => {
  it('found every token the checks use', () => {
    for (const [a, b] of PAIRS) {
      expect(tok[a], a).toBeTruthy()
      expect(tok[b], b).toBeTruthy()
    }
  })

  for (const [a, b, min] of PAIRS) {
    it(`${a} on ${b} is at least ${min}:1`, () => {
      expect(contrast(tok[a], tok[b])).toBeGreaterThanOrEqual(min)
    })
  }
})
