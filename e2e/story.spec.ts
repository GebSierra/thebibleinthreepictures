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

test('explore runs left to right and scrolls sideways to the cross', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#/me')
  const line = page.getByRole('region', { name: /The whole story, left to right/ })
  const { scroll, client } = await line.evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }))
  expect(scroll).toBeGreaterThan(client * 2)
  const adam = await line.getByRole('button', { name: 'Adam', exact: true }).boundingBox()
  const ark = await line.getByRole('button', { name: 'Ark', exact: true }).boundingBox()
  expect(Math.abs(adam!.y - ark!.y)).toBeLessThan(4)
  expect(ark!.x).toBeGreaterThan(adam!.x)
  await line.getByRole('button', { name: 'Consummation', exact: true }).scrollIntoViewIfNeeded()
  await line.getByRole('button', { name: 'Consummation', exact: true }).click()
  await expect(page.getByText('In the lesson on Consummation', { exact: false })).toBeVisible()
})

test('each stage picture sits over its middle word, and the dots move along the line', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#/me')
  const line = page.getByRole('region', { name: /The whole story, left to right/ })
  const center = (b: { x: number; width: number } | null) => b!.x + b!.width / 2
  const pic = await line.getByText('The World', { exact: true }).boundingBox()
  const ark = await line.getByRole('button', { name: 'Ark', exact: true }).boundingBox()
  expect(Math.abs(center(pic) - center(ark))).toBeLessThan(3)
  const first = page.getByRole('button', { name: 'Go to Stage A, The World' })
  const last = page.getByRole('button', { name: 'Go to Stage C, The Cross' })
  await expect(first).toHaveAttribute('aria-current', 'true')
  await last.click()
  await expect(last).toHaveAttribute('aria-current', 'true')
  await expect(line.getByRole('button', { name: 'Christ', exact: true })).toBeInViewport()
})
