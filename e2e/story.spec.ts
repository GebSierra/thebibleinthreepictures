import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const WORDS = ['Adam', 'Ark', 'Abraham', 'Bondage', 'Break Free', 'Battle', 'Crowned', 'Cut', 'Captivity', 'Christ', 'Church', 'Consummation']

test('Me shows the whole story: pictures, every word, the dates', async ({ page }) => {
  await page.goto('/#/me')
  const story = page.locator('section.story')
  await expect(story.getByRole('heading', { name: 'The whole story' })).toBeVisible()
  for (const name of ['The World', 'Egypt', 'The Land', 'The Cross']) await expect(story.getByText(name, { exact: true })).toBeVisible()
  for (const w of WORDS) await expect(story.getByRole('button', { name: w, exact: true })).toBeVisible()
  for (const d of ['~2000 BC', '~1500 BC', '~1000 BC', '~500 BC']) await expect(story.getByText(d)).toBeVisible()
  await expect(story).not.toContainText(/stage four|twelve steps/i)
})

test('tapping a word shows what its lesson holds, locked, and never opens a lesson', async ({ page }) => {
  await page.goto('/#/me')
  const story = page.locator('section.story')
  await story.getByRole('button', { name: 'Abraham', exact: true }).click()
  await expect(story.getByText('In the lesson on Abraham', { exact: false })).toBeVisible()
  await expect(story.getByText('Where Christ shows up')).toBeVisible()
  await expect(story.getByText(/opens when you pass the Level 1 test-out/)).toBeVisible()
  await expect(story.locator('a')).toHaveCount(0)
  await expect(page).toHaveURL(/#\/me/)
})

test('test yourself hides the names until tapped', async ({ page }) => {
  await page.goto('/#/me')
  const story = page.locator('section.story')
  await story.getByRole('button', { name: 'Test yourself' }).click()
  await expect(story.getByRole('button', { name: 'Adam', exact: true })).toHaveCount(0)
  await expect(story.getByText('The World', { exact: true })).toHaveCount(0)
  const hidden = story.getByRole('button', { name: /Hidden/ })
  await expect(hidden).toHaveCount(4 + 12 + 5)
  await expect(story.getByText('0 of 21 checked')).toBeVisible()
  await hidden.first().click()
  await expect(story.getByText('The World', { exact: true })).toBeVisible()
  await expect(story.getByText('1 of 21 checked')).toBeVisible()
  const r = await new AxeBuilder({ page }).analyze()
  expect(r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([])
  await story.getByRole('button', { name: 'Hide all again' }).click()
  await expect(hidden).toHaveCount(21)
})
