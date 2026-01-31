import { test, expect } from '@playwright/test'

test('homepage loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/CiblOrgaSport/i)
  await expect(page.locator('#app')).toBeVisible()
})
