import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { finishWorld, T0 } from './helpers.ts'

async function noSeriousIssues(page: Page, where: string) {
  const r = await new AxeBuilder({ page }).analyze()
  const bad = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(bad.map((v) => `${where}: ${v.id} (${v.impact}) ${v.nodes.length}x`)).toEqual([])
}

test('axe: no serious or critical issues on the main screens', async ({ page }) => {
  await page.clock.install({ time: T0 })
  await page.goto('/#/learn')
  await noSeriousIssues(page, 'learn')
  await page.goto('/#/me')
  await noSeriousIssues(page, 'me')
  await page.goto('/#/review')
  await noSeriousIssues(page, 'review, empty')
  await page.goto('/#/learn')
  await page.getByRole('button', { name: 'Start' }).click()
  await noSeriousIssues(page, 'lesson, picture')
  await finishWorld(page)
  await noSeriousIssues(page, 'lesson, done')
  await page.clock.setSystemTime(new Date(T0.getTime() + 3 * 86400000))
  await page.goto('/#/review')
  await page.reload()
  await noSeriousIssues(page, 'review, card')
})
