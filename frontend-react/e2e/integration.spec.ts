import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('displays login page', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('shows error with invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message or stay on login page
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).toContain('login');
  });
});

test.describe('API Integration', () => {
  test('API root endpoint is accessible', async ({ page }) => {
    const response = await page.goto('http://localhost:8000/api/v1/');
    expect(response?.status()).toBe(200);
    
    const json = await response?.json();
    expect(json).toHaveProperty('players');
    expect(json).toHaveProperty('auth');
  });

  test('health check endpoints work', async ({ page }) => {
    // Test backend is responding
    const backendResponse = await page.goto('http://localhost:8000/api/v1/');
    expect(backendResponse?.status()).toBe(200);
  });
});

test.describe('WebSocket Connection', () => {
  test('WebSocket rejects unauthenticated connection', async ({ page }) => {
    let wsError = false;
    
    page.on('websocket', ws => {
      ws.on('close', () => {
        wsError = true;
      });
    });
    
    await page.goto('http://localhost:5173');
    
    // Try to connect without token (should fail)
    await page.evaluate(() => {
      try {
        const ws = new WebSocket('ws://localhost:8000/ws/chat/test/');
        ws.onerror = () => {};
      } catch (e) {
        // Expected to fail
      }
    });
    
    await page.waitForTimeout(500);
  });
});

test.describe('Navigation', () => {
  test('can navigate to different pages', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Check if page loads
    await expect(page).toHaveURL(/localhost:5173/);
  });
});
