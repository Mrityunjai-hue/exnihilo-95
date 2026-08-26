import { test, expect, Page } from '@playwright/test';

/**
 * e2e/workspace-persistence.spec.ts — Workspace Persistence & Hybrid Storage Spec
 *
 * Tests:
 *  1. IndexedDB session reload (tabs restored across page reloads).
 *  2. Format IDE Disk vs Auth Isolation (clears IndexedDB workspace while preserving localStorage auth).
 */

async function prepareDesktop(page: Page) {
  await page.goto('/');

  // Wait 3.2 seconds for retro boot animation to complete naturally
  await page.waitForTimeout(3200);

  // Method A: Explicitly close WelcomeWindow if visible
  const welcomeWindow = page.locator('div.win95-window').filter({ hasText: 'Welcome to ExNihilo 95' });
  if (await welcomeWindow.isVisible().catch(() => false)) {
    const actionBtn = welcomeWindow.locator('button:has-text("Launch IDE"), button.win95-btn-titlebar').first();
    if (await actionBtn.isVisible().catch(() => false)) {
      await actionBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(400);
    }
  }

  // Press Escape to dismiss driver.js tour overlay if present
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // Focus SQL Studio window so it is active
  const studioTitlebar = page.locator('.win95-titlebar-text:has-text("ExNihilo SQL Studio")');
  if (await studioTitlebar.isVisible().catch(() => false)) {
    await studioTitlebar.click({ force: true }).catch(() => {});
    await page.waitForTimeout(200);
  }
}

test.describe('Workspace Persistence & Hybrid Storage Spec', () => {
  test.beforeEach(async ({ page }) => {
    await prepareDesktop(page);
  });

  test('1. IndexedDB Session Reload', async ({ page }) => {
    const studioWindow = page.locator('div.win95-window').filter({
      has: page.locator('.win95-titlebar-text:has-text("ExNihilo SQL Studio")'),
    });
    await expect(studioWindow).toBeVisible();

    // Create a 2nd tab (Method B: force click)
    const addTabBtn = studioWindow.locator('button.win95-new-tab-btn');
    await addTabBtn.click({ force: true });
    const tab2 = studioWindow.locator('.win95-editor-tab:has-text("Query 2.sql")');
    await expect(tab2).toBeVisible();

    // Wait for debounced IndexedDB save (600ms)
    await page.waitForTimeout(600);

    // Reload page
    await prepareDesktop(page);

    // Verify Tab 2 is restored from IndexedDB
    const restoredTab2 = page.locator('.win95-editor-tab:has-text("Query 2.sql")');
    await expect(restoredTab2).toBeVisible();
  });

  test('2. Format IDE Disk vs Auth Isolation', async ({ page }) => {
    // Set dummy auth token in localStorage
    await page.evaluate(() => localStorage.setItem('auth_token', 'mock_jwt_123'));

    const studioWindow = page.locator('div.win95-window').filter({
      has: page.locator('.win95-titlebar-text:has-text("ExNihilo SQL Studio")'),
    });
    await expect(studioWindow).toBeVisible();

    // Locate Format IDE Disk button in status bar (Method B: force click)
    const formatBtn = studioWindow.locator('button:has-text("Format IDE Disk")');
    await expect(formatBtn).toBeVisible();
    await formatBtn.click({ force: true });

    // Confirm Format Dialog (target modal window with "Confirm Format IDE Disk" using .last())
    const confirmModal = page.locator('div.win95-window').filter({
      has: page.locator('.win95-titlebar-text:has-text("Confirm Format IDE Disk")'),
    }).last();
    await expect(confirmModal).toBeVisible();
    const confirmBtn = confirmModal.locator('button:has-text("Confirm Format")');
    await confirmBtn.click({ force: true });

    // Verify workspace tabs reset to default
    await expect(confirmModal).toBeHidden();
    const tab1 = studioWindow.locator('.win95-editor-tab:has-text("Query 1.sql")');
    await expect(tab1).toBeVisible();

    // Verify localStorage.getItem('auth_token') remains intact!
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBe('mock_jwt_123');
  });
});
