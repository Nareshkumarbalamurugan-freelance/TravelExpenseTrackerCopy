// Playwright test: Simulate location changes and verify distance calculation/display
// Run with: npx playwright test e2e/location.spec.ts

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:10000';

// Helper to mock geolocation
async function mockLocation(page, latitude, longitude, accuracy = 10) {
  await page.context().grantPermissions(['geolocation']);
  await page.context().setGeolocation({ latitude, longitude, accuracy });
}

test.describe('Location & Distance Calculation', () => {
  test('Trip distance updates as location changes', async ({ page }) => {
    // Start at point A
    await mockLocation(page, 13.0827, 80.2707); // Chennai
    await page.goto(`${BASE_URL}/dashboard`);
    await page.click('button:has-text("Start New Trip")');
    await expect(page.locator('text=ACTIVE')).toBeVisible();

    // Move to point B
    await mockLocation(page, 13.0830, 80.2710); // Slight move
    await page.waitForTimeout(2000); // Wait for tracking update

    // Move to point C
    await mockLocation(page, 13.0840, 80.2720); // Further move
    await page.waitForTimeout(2000);

    // Check that distance is updated and displayed
    const distanceText = await page.locator('text=Distance').first().locator('..').textContent();
    expect(distanceText).toMatch(/\d+(\.\d+)?\s*km/);

    // End trip
    await page.click('button:has-text("End Trip")');
    await expect(page.locator('button:has-text("Start New Trip")')).toBeVisible();
  });
});
