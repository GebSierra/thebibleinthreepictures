import { expect, test, type Page } from '@playwright/test'
import { T0, thinkQuestion } from './helpers.ts'

const ORDER = ['The World', 'Egypt', 'The Land', 'The Cross']

/** Answer whatever check item is on screen, correctly. Works in lessons and the test-out. */
async function answerItem(page: Page, inTestOut = false) {
  const btn = (name: string | RegExp) => page.getByRole('button', { name, exact: typeof name === 'string' })
  const cont = async () => { if (!inTestOut) await btn('Continue').click() }
  const prompt = (await page.locator('.item-prompt').first().textContent()) ?? ''

  if (await page.getByRole('radio').count()) {
    const want = /first/.test(prompt) ? 'The World' : /after The World/.test(prompt) ? 'Egypt' : 'The Land'
    await page.getByRole('radio', { name: want }).click()
    await btn('Check').click()
    return cont()
  }
  if (await btn('Start the timer').count()) {
    await btn('Start the timer').click()
    await btn("I'm done").click()
    for (const box of await page.getByRole('checkbox').all()) await box.check()
    return btn('Done').click()
  }
  if (await page.locator('.order-slots').count()) {
    for (const name of ORDER) await page.locator('.chips').getByRole('button', { name }).click()
    await btn('Check').click()
    return cont()
  }
  if (await page.locator('.strike-grid').count()) {
    for (const name of ORDER.slice(0, 3)) await page.locator('.strike-grid').getByRole('button', { name }).click()
    await btn('Check').click()
    return cont()
  }
  if (await page.locator('input.field').count()) {
    const a = /book and chapter/.test(prompt) ? 'Genesis 3' : /before The Land/.test(prompt) ? 'Egypt' : 'law'
    await page.locator('input.field').fill(a)
    await btn('Check').click()
    return cont()
  }
  await page.locator('textarea.field').fill('My answer')
  await btn('Show answer').click()
  await btn('Yes, I had it').click()
}

async function doLesson(page: Page, n: number) {
  await page.goto('/#/learn')
  // Review first if cards are due, then the lesson.
  await page.getByRole('button', { name: 'Start' }).click()
  await page.waitForURL(/#\/(review|lesson)/)
  if (page.url().includes('#/review')) {
    const top = page.locator('.review-top')
    const total = Number((await top.getByText(/^1 of \d+$/).textContent())!.split(' of ')[1])
    for (let i = 0; i < total; i++) {
      await expect(top.getByText(`${i + 1} of ${total}`, { exact: true })).toBeVisible()
      await answerItem(page)
    }
    await expect(page.getByRole('heading', { name: 'Review done' })).toBeVisible()
    await page.goto('/#/learn')
    await page.getByRole('button', { name: 'Start' }).click()
  }
  await expect(page).toHaveURL(new RegExp(`#/lesson/L1-0${n}`))
  // Look back (from lesson 2 on)
  if (n > 1) {
    for (const name of ORDER.slice(0, n - 1)) await page.locator('.chips').getByRole('button', { name }).click()
    await page.getByRole('button', { name: 'Check' }).click()
    await expect(page.getByText('Right.')).toBeVisible()
    await page.getByRole('button', { name: 'Continue' }).click()
  }
  // Picture, then See Christ if this lesson has one, then Read
  for (let i = 0; i < 4 && !(await page.getByText('Question 1 of 5').isVisible()); i++) {
    await page.getByRole('button', { name: 'Continue' }).click()
  }
  await expect(page.getByText('Question 1 of 5')).toBeVisible()
  for (let i = 0; i < 5; i++) await thinkQuestion(page)
  await page.getByLabel('Your line').fill('One line.')
  await page.getByRole('button', { name: "Show Geb's line" }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  const count = page.locator('.lesson p.eyebrow').nth(1)
  const items = Number((await count.textContent())!.split(' of ')[1])
  for (let i = 0; i < items; i++) {
    await expect(count).toHaveText(`${i + 1} of ${items}`)
    await answerItem(page)
  }
  await expect(page.getByRole('heading', { name: 'Lesson done' })).toBeVisible()
}

test('the whole of Level 1: four lessons, then a passing test-out and shared results', async ({ page }) => {
  test.setTimeout(120_000)
  await page.clock.install({ time: T0 })
  for (let n = 1; n <= 4; n++) {
    await page.clock.setSystemTime(new Date(T0.getTime() + (n - 1) * 86400000))
    await doLesson(page, n)
  }
  // After the cross: the three pictures are struck, the cross is not.
  await expect(page.locator('[data-struck="true"]')).toHaveCount(3)
  await expect(page.locator('[data-picture="The Cross"]').first()).toHaveAttribute('data-struck', 'false')

  await page.goto('/#/learn')
  await expect(page.getByText('Level 1 test-out')).toBeVisible()
  await page.getByRole('button', { name: 'Start' }).click()
  await expect(page).toHaveURL(/#\/test-out/)
  await page.getByRole('button', { name: 'Begin' }).click()
  await expect(page.getByRole('radio')).toHaveCount(0)
  const qs = Number((await page.getByText(/^Question 1 of \d+$/i).textContent())!.split(/ of /i)[1])
  for (let i = 0; i < qs; i++) {
    await expect(page.getByText(`Question ${i + 1} of ${qs}`, { exact: true })).toBeVisible()
    await answerItem(page, true)
  }

  await expect(page.getByRole('heading', { name: '14 of 14' })).toBeVisible()
  await expect(page.getByText('You passed. Level 2, The ABCs, is open.')).toBeVisible()
  await expect(page.getByLabel('Results text')).toContainText('Score: 14 of 14 (passed)')

  await page.goto('/#/me')
  await expect(page.getByText('Unlocked. Coming soon.')).toBeVisible()
})
