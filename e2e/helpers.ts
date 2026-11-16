import { expect, type Page } from '@playwright/test'

export const T0 = new Date('2026-11-16T09:00:00')

/** Go through one Think It Through question. */
export async function thinkQuestion(page: Page) {
  await page.getByLabel('Your answer').fill('My answer')
  await page.getByRole('button', { name: 'Show answer' }).click()
  await page.getByRole('button', { name: /Next question|Continue/ }).click()
}

/** Finish L1-01, The World, answering every check item right. */
export async function finishWorld(page: Page) {
  await page.goto('/#/learn')
  await page.getByRole('button', { name: 'Start' }).click()
  await expect(page).toHaveURL(/#\/lesson\/L1-01/)

  // The picture and key event (rail is skipped: nothing to recall yet)
  await expect(page.getByRole('heading', { name: 'The World', level: 1 })).toBeVisible()
  await page.getByRole('button', { name: 'Continue' }).click()
  // See Christ
  await expect(page.getByRole('heading', { name: 'See Christ' })).toBeVisible()
  await page.getByRole('button', { name: 'Continue' }).click()
  // Read
  await page.getByRole('button', { name: 'Continue' }).click()
  // Think it through: five questions
  for (let i = 0; i < 5; i++) await thinkQuestion(page)
  // One line
  await page.getByLabel('Your line').fill('God made a good world.')
  await page.getByRole('button', { name: "Show Geb's line" }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  // Check: choice, type_word, self_check, self_check
  await page.getByRole('radio', { name: 'The World' }).click()
  await page.getByRole('button', { name: 'Check' }).click()
  await expect(page.getByText('Right.')).toBeVisible()
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByLabel('Your answer').fill('Genesis 3')
  await page.getByRole('button', { name: 'Check' }).click()
  await expect(page.getByText('Right.')).toBeVisible()
  await page.getByRole('button', { name: 'Continue' }).click()

  for (let i = 0; i < 2; i++) {
    await page.getByRole('textbox').fill('An answer')
    await page.getByRole('button', { name: 'Show answer' }).click()
    await page.getByRole('button', { name: 'Yes, I had it' }).click()
  }
  await expect(page.getByRole('heading', { name: 'Lesson done' })).toBeVisible()
}
