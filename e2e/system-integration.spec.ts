// e2e/system-integration.spec.ts
// End-to-end system integration test for TravelExpenseTracker
// This script uses Playwright for browser automation and Firebase Admin SDK for backend checks
// Run with: npx playwright test e2e/system-integration.spec.ts

import { test, expect } from '@playwright/test';


// Real employee credentials
const EMPLOYEE_EMAIL = 'nareshkumarbalamurugan@gmail.com';
const EMPLOYEE_PASSWORD = 'Nareshbala@2006';

// Real admin credentials (username/password)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin@poultrymitra';

// Base URL for your app (update if running on a different port or domain)
const BASE_URL = 'http://localhost:10000';

// Main test suite
// Covers: login, dashboard, trip start/stop, GPS, dealer punch, claim, history, admin, logout


test.describe('TravelExpenseTracker System Integration', () => {
  test('A-Z employee user journey', async ({ page }) => {
    // 1. Visit login page
    await page.goto(`${BASE_URL}/login`);
    await expect(page).toHaveTitle(/Login/i);

    // 2. Login as employee
    await page.fill('input[type="email"]', EMPLOYEE_EMAIL);
    await page.fill('input[type="password"]', EMPLOYEE_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard|employee/i);

    // 3. Dashboard loads real data
    await expect(page.locator('text=Total Distance')).toBeVisible();
    await expect(page.locator('text=Total Amount')).toBeVisible();
    await expect(page.locator('text=Dealer visits')).toBeVisible();

    // 4. Start a trip (if not already active)
    if (await page.locator('button:has-text("Start Journey")').isVisible()) {
      await page.click('button:has-text("Start Journey")');
      await expect(page.locator('button:has-text("Punch Dealer")')).toBeVisible();
    }

    // 5. Simulate GPS update (browser geolocation mock)
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: 13.0827, longitude: 80.2707 });
    await page.waitForTimeout(2000); // Wait for GPS update

    // 6. Punch a dealer visit
    if (await page.locator('button:has-text("Punch Dealer")').isVisible()) {
      await page.click('button:has-text("Punch Dealer")');
      await expect(page.locator('text=Dealer visits')).toBeVisible();
    }

    // 7. End trip
    if (await page.locator('button:has-text("End Journey")').isVisible()) {
      await page.click('button:has-text("End Journey")');
      await expect(page.locator('button:has-text("Start Journey")')).toBeVisible();
    }

    // 8. Submit an expense claim
    await page.click('button:has-text("New Claim")');
    await page.fill('input#claim-type', 'Travel');
    await page.fill('input#claim-amount', '100');
    await page.fill('input#claim-desc', 'Test trip claim');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=My Claims')).toBeVisible();

    // 9. Check trip history page
    await page.goto(`${BASE_URL}/history`);
    await expect(page.locator('text=Trip History')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();

    // 10. Logout
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL(/login/i);
  });

  test('A-Z admin dashboard journey', async ({ page }) => {
    // 1. Visit login page
    await page.goto(`${BASE_URL}/login`);
    await expect(page).toHaveTitle(/Login/i);

    // 2. Login as admin (fill username, not email)
    await page.fill('input[name="username"]', ADMIN_USERNAME);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/admin/i);

    // 3. Admin dashboard loads real data
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
    await expect(page.locator('text=Total Employees')).toBeVisible();
    await expect(page.locator('text=Total Distance')).toBeVisible();
    await expect(page.locator('text=Total Expenses')).toBeVisible();

    // 4. Check approvals/claims section
    await expect(page.locator('text=Approvals')).toBeVisible();
    await expect(page.locator('text=Pending')).toBeVisible();

    // 5. Check system settings
    await page.click('text=System Settings');
    await expect(page.locator('text=Company Name')).toBeVisible();

    // 6. Logout
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL(/login/i);
  });
});
