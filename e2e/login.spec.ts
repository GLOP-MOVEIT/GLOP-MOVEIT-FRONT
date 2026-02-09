import { test, expect } from '@playwright/test'

const credentials = {
  email: 'test@example.com',
  password: 'secret123',
}

const mockLogin = async (page: Parameters<typeof test>[0]['page'], role: string) => {
  await page.route('**/auth/login', async (route) => {
    const payload = {
      token: 'token-123',
      user: {
        id: 1,
        email: credentials.email,
        role: { name: role },
        authorities: [],
      },
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
  await loginForm.locator('input[type="email"]').fill(credentials.email)
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

  await expect(page.locator('a[href="/admin"]')).toHaveCount(0)
  await expect(page.locator('a[href="/commissaire"]')).toHaveCount(0)
  await expect(page.evaluate(() => localStorage.getItem('authToken'))).resolves.toBe('token-123')

  await page.goto('/admin')
  await expect(page).toHaveURL('/')

  await page.goto('/commissaire')
  await expect(page).toHaveURL('/')
})

test('login as commissioner shows commissioner dashboard link', async ({ page }) => {
  await mockLogin(page, 'COMMISSIONER')

  await login(page)

  await expect(page.locator('a[href="/commissaire"]')).toHaveCount(1)

  await page.goto('/admin')
  await expect(page).toHaveURL('/')
})

test('login as admin shows admin dashboard link', async ({ page }) => {
  await mockLogin(page, 'ADMIN')

  await login(page)

  await expect(page.locator('a[href="/admin"]')).toHaveCount(1)

  await page.goto('/commissaire')
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
  await loginForm.locator('input[type="email"]').fill(credentials.email)
  await loginForm.locator('input[type="password"]').fill(credentials.password)
  await loginForm.locator('button[type="submit"]').click()

  await expect(page).toHaveURL('/login')
  await expect(page.locator('.v-messages__message, .v-alert')).toBeVisible()
})
