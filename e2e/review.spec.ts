import { expect, test } from '@playwright/test'
import { finishWorld, T0 } from './helpers.ts'

test('T3.7: after a lesson, cards show as due when the clock moves forward', async ({ page }) => {
  await page.clock.install({ time: T0 })
  await finishWorld(page)
  await page.getByRole('button', { name: 'Back to Learn' }).click()

  // Answered right in the lesson: nothing due straight away.
  await expect(page.getByText(/cards? ready/)).toHaveCount(0)

  // Three days later the cards are due.
  await page.clock.setSystemTime(new Date(T0.getTime() + 3 * 86400000))
  await page.goto('/#/learn')
  await page.reload()
  await expect(page.getByText('3 cards ready')).toBeVisible()
  await expect(page.getByRole('link', { name: /Review/ })).toContainText('3')

  // Start goes to review first. Review has no choice items.
  await page.getByRole('button', { name: 'Start' }).click()
  await expect(page).toHaveURL(/#\/review/)
  await expect(page.getByRole('radio')).toHaveCount(0)
  await expect(page.getByText('1 of 3')).toBeVisible()
})
