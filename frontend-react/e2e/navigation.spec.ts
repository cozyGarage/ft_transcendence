import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/home');
    await expect(page).toHaveURL('/login');
  });

  test('should show 404 page for unknown routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByText(/404/i)).toBeVisible();
    await expect(page.getByText(/page not found/i)).toBeVisible();
  });

  test('should have working home button on 404 page', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await page.getByRole('link', { name: /go home/i }).click();
    await expect(page).toHaveURL('/home');
  });
});
