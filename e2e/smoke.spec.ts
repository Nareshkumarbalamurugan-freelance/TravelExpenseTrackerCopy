// Automated smoke test for TravelExpenseTracker
// Run with: npx playwright test e2e/smoke.spec.ts


import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:10000';

test.describe('TravelExpenseTracker Smoke Test', () => {
  test('Employee dashboard loads and displays stats', async ({ page }) => {
    // Login as employee
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'nareshkumarbalamurugan@gmail.com');
    await page.fill('input[type="password"]', 'Nareshbala@2006');
    await page.click('button:has-text("Login")');
    await page.waitForURL('**/dashboard');
    await expect(page.locator('text=Travel Expense Tracker')).toBeVisible();
    await expect(page.locator('text=Trips')).toBeVisible();
    await expect(page.locator('text=Dealers')).toBeVisible();
    await expect(page.locator('text=KM')).toBeVisible();
  });

  test('Admin dashboard loads and displays stats', async ({ page }) => {
    // Login as admin
    await page.goto(`${BASE_URL}/admin-login`);
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin@poultrymitra');
    await page.click('button:has-text("Login")');
    await page.waitForURL('**/admin');
    await expect(page.locator('text=Total Users')).toBeVisible();
    await expect(page.locator('text=Active Trips')).toBeVisible();
    await expect(page.locator('text=Trips Today')).toBeVisible();
    await expect(page.locator('text=Distance Today')).toBeVisible();
    await expect(page.locator('text=Expense Today')).toBeVisible();
  });

  test('Trip start/stop and GPS tracking', async ({ page }) => {
    // Login as employee
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'nareshkumarbalamurugan@gmail.com');
    await page.fill('input[type="password"]', 'Nareshbala@2006');
    await page.click('button:has-text("Login")');
    await page.waitForURL('**/dashboard');
    await page.click('button:has-text("Start New Trip")');
    await expect(page.locator('text=Trip Status')).toBeVisible();
    await expect(page.locator('text=ACTIVE')).toBeVisible();
    // Simulate GPS update (mock or real device needed)
    // ...
    await page.click('button:has-text("End Trip")');
    await expect(page.locator('button:has-text("Start New Trip")')).toBeVisible();
  });

  test('Admin can view all employee travel details', async ({ page }) => {
    // Login as admin
    await page.goto(`${BASE_URL}/admin-login`);
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin@poultrymitra');
    await page.click('button:has-text("Login")');
    await page.waitForURL('**/admin');
    await page.click('text=User Management');
    await expect(page.locator('text=User Management')).toBeVisible();
    await expect(page.locator('text=Active')).toBeVisible();
    await expect(page.locator('text=Inactive')).toBeVisible();
  });
});
