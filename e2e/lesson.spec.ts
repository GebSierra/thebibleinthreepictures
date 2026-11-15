import { expect, test } from '@playwright/test'
import { finishWorld, T0 } from './helpers.ts'

test('T3.6: finish L1-01 from start to end', async ({ page }) => {
  await page.clock.install({ time: T0 })
  await finishWorld(page)
  await page.getByRole('button', { name: 'Back to Learn' }).click()
  await expect(page.getByText('One picture learned. Three to go.')).toBeVisible()
  await expect(page.getByText('Lesson: Egypt')).toBeVisible()
})

test('progress survives a reload', async ({ page }) => {
  await page.clock.install({ time: T0 })
  await finishWorld(page)
  await page.goto('/#/learn')
  await page.reload()
  await expect(page.getByText('One picture learned. Three to go.')).toBeVisible()
})

test('lessons open in order', async ({ page }) => {
  await page.goto('/#/lesson/L1-03')
  await expect(page.getByRole('heading', { name: 'Not open yet' })).toBeVisible()
})
