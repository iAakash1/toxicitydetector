import { test, expect } from '@playwright/test'

test.describe('ToxiMeter E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the main page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Relationship Toxicity Assessment')
    await expect(page.locator('text=Answer each question honestly')).toBeVisible()
  })

  test('should show questions and enable submit when all answered', async ({ page }) => {
    // Wait for questions to load
    await page.waitForSelector('[data-testid="question-1"]', { timeout: 10000 })
    
    // Check that submit button is initially disabled
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeDisabled()

    // Answer all questions
    const questions = page.locator('[data-testid^="question-"]')
    const questionCount = await questions.count()
    
    for (let i = 0; i < questionCount; i++) {
      const question = questions.nth(i)
      // Click "Neutral" option (middle option)
      await question.locator('label').nth(2).click()
    }

    // Submit button should now be enabled
    await expect(submitButton).toBeEnabled()
  })

  test('should complete full assessment flow', async ({ page }) => {
    // Answer all questions with healthy responses
    await page.waitForSelector('[data-testid="question-1"]')
    
    const questions = page.locator('[data-testid^="question-"]')
    const questionCount = await questions.count()
    
    for (let i = 0; i < questionCount; i++) {
      const question = questions.nth(i)
      // For healthy responses: strongly agree with positive, strongly disagree with negative
      // This is simplified - in reality you'd need to know which questions are positive/negative
      await question.locator('label').nth(0).click() // First option
    }

    // Submit the assessment
    await page.locator('button[type="submit"]').click()

    // Wait for results
    await page.waitForSelector('[data-testid="results"]', { timeout: 10000 })

    // Check that results are displayed
    await expect(page.locator('[data-testid="toxicity-percentage"]')).toBeVisible()
    await expect(page.locator('[data-testid="tier-label"]')).toBeVisible()
    await expect(page.locator('[data-testid="advice-text"]')).toBeVisible()

    // Check that action buttons are present
    await expect(page.locator('text=Share Results')).toBeVisible()
    await expect(page.locator('text=Take Again')).toBeVisible()
  })

  test('should allow retaking the assessment', async ({ page }) => {
    // Complete an assessment first (simplified)
    await page.waitForSelector('[data-testid="question-1"]')
    
    // Answer questions quickly
    const questions = page.locator('[data-testid^="question-"]')
    const questionCount = await questions.count()
    
    for (let i = 0; i < questionCount; i++) {
      await questions.nth(i).locator('label').nth(2).click()
    }

    await page.locator('button[type="submit"]').click()
    await page.waitForSelector('[data-testid="results"]')

    // Click "Take Again"
    await page.locator('text=Take Again').click()

    // Should be back to the questionnaire
    await expect(page.locator('[data-testid="question-1"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeDisabled()
  })

  test('should have accessible form elements', async ({ page }) => {
    await page.waitForSelector('[data-testid="question-1"]')

    // Check that radio inputs have proper labels
    const firstQuestion = page.locator('[data-testid="question-1"]')
    const radioInputs = firstQuestion.locator('input[type="radio"]')
    
    for (let i = 0; i < 5; i++) {
      const radio = radioInputs.nth(i)
      const id = await radio.getAttribute('id')
      const label = page.locator(`label[for="${id}"]`)
      await expect(label).toBeVisible()
    }
  })
})
