
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:10000';

test.describe('Admin Panel Functionality Test', () => {

  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto(`${BASE_URL}/admin-login`);
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'admin@poultrymitra');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('**/admin');
  });

  test('should load overview page with stats cards', async ({ page }) => {
    await expect(page.locator('h1:has-text("Overview")')).toBeVisible();
    await expect(page.locator('text=Total Employees')).toBeVisible();
    await expect(page.locator('text=Trips Today')).toBeVisible();
    await expect(page.locator('text=Distance This Month')).toBeVisible();
    await expect(page.locator('text=Expenses This Month')).toBeVisible();
  });

  test('should navigate to Employees page and show employee table', async ({ page }) => {
    await page.click('button:has-text("Employees")');
    await page.waitForURL('**/admin'); // URL might not change, wait for content
    await expect(page.locator('h1:has-text("Employees")')).toBeVisible();
    await expect(page.locator('h2:has-text("All Employees")')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Employee")')).toBeVisible();
  });

  test('should navigate to Trips page and show trips table', async ({ page }) => {
    await page.click('button:has-text("Trips")');
    await expect(page.locator('h1:has-text("Trips")')).toBeVisible();
    await expect(page.locator('h2:has-text("Recent Trips")')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Employee ID")')).toBeVisible();
  });

  test('should navigate to Approvals page and show approvals table', async ({ page }) => {
    await page.click('button:has-text("Approvals")');
    await expect(page.locator('h1:has-text("Approvals")')).toBeVisible();
    await expect(page.locator('h2:has-text("Pending Approvals")')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Employee ID")')).toBeVisible();
  });

  test('should navigate to Settings page and show settings form', async ({ page }) => {
    await page.click('button:has-text("Settings")');
    await expect(page.locator('[data-testid="settings-skeleton"]')).toBeHidden();
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
    await expect(page.locator('h3:has-text("General Settings")')).toBeVisible();
    await expect(page.locator('label:has-text("Company Name")')).toBeVisible();
    await expect(page.locator('button:has-text("Save Changes")')).toBeVisible();
  });

});
