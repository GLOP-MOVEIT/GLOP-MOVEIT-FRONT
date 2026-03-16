import { test, expect } from '@playwright/test'

const credentials = {
  nickname: 'test-user',
  password: 'secret123',
}

const mockLogin = async (page: Parameters<typeof test>[0]['page'], role: string) => {
  await page.route('**/auth/login', async (route) => {
    const payload = {
      token: 'token-123',
      expiresIn: 3600,
      user: {
        userId: 1,
        id: 1,
        nickname: 'test-user',
      },
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(payload),
    })
  })

  // Mock getUserProfile endpoint (called after login)
  await page.route('**/users/*', async (route) => {
    const payload = {
      userId: 1,
      firstName: 'Test',
      surname: 'User',
      email: 'test@example.com',
      phoneNumber: '0123456789',
      language: 'fr',
      role: { name: role },
      acceptsNotifications: true,
      acceptsLocationSharing: false,
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(payload),
    })
  })
}

const login = async (page: Parameters<typeof test>[0]['page']) => {
  const loginForm = page.locator('form').first()
  await loginForm.locator('input[type="text"]').fill(credentials.nickname)
  await loginForm.locator('input[type="password"]').fill(credentials.password)
  await loginForm.locator('button[type="submit"]').click()
  await page.waitForURL('**/')
}

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.evaluate(() => localStorage.clear())
})

test('login as spectator shows no dashboard', async ({ page }) => {
  await mockLogin(page, 'SPECTATOR')

  await login(page)

  // Ouvrir le menu utilisateur
  await page.locator('button:has(.mdi-account-circle)').click()
  await page.waitForSelector('.v-list')

  await expect(page.locator('a[href="/admin"]')).toHaveCount(0)
  await expect(page.locator('a[href="/referee"]')).toHaveCount(0)
  await expect(page.evaluate(() => localStorage.getItem('authToken'))).resolves.toBe('token-123')

  await page.goto('/admin')
  await expect(page).toHaveURL('/')

  await page.goto('/referee')
  await expect(page).toHaveURL('/')
})

test('login as commissioner shows commissioner dashboard link', async ({ page }) => {
  await mockLogin(page, 'REFEREE')

  await login(page)

  await page.locator('button:has(.mdi-account-circle)').click()
  await page.waitForSelector('.v-list')

  await expect(page.locator('a[href="/referee"]')).toHaveCount(1)

  await page.goto('/admin')
  await expect(page).toHaveURL('/')
})

test('login as admin shows admin dashboard link', async ({ page }) => {
  await mockLogin(page, 'ADMIN')

  await login(page)

  await page.locator('button:has(.mdi-account-circle)').click()
  await page.waitForSelector('.v-list')

  await expect(page.locator('a[href="/admin"]')).toHaveCount(1)

  await page.goto('/referee')
  await expect(page).toHaveURL('/')
})

test('login fails and stays on login page', async ({ page }) => {
  await page.route('**/auth/login', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Invalid credentials' }),
    })
  })

  const loginForm = page.locator('form').first()
  await loginForm.locator('input[type="text"]').fill(credentials.nickname)
  await loginForm.locator('input[type="password"]').fill(credentials.password)
  await loginForm.locator('button[type="submit"]').click()

  await expect(page).toHaveURL('/login')
  const visibleErrors = page.locator('.v-messages__message:visible, .v-alert:visible')
  await expect.poll(async () => visibleErrors.count()).toBeGreaterThan(0)
})
