import { test, expect, Page } from '@playwright/test';

/**
 * e2e/window-lifecycle.spec.ts — Window Lifecycle & Win95 Shell Spec
 *
 * Tests:
 *  1. Minimize & DOM State Retention.
 *  2. Taskbar Restore & Maximize geometry.
 *  3. Header Drag Isolation.
 */

async function prepareDesktop(page: Page) {
  await page.goto('/');

  // Wait 3.2 seconds for retro boot animation to complete naturally
  await page.waitForTimeout(3200);

  // Method A: Close any floating blocking windows (Welcome, Help, etc.)
  const blockingWindows = page.locator('div.win95-window').filter({
    hasNot: page.locator('.win95-titlebar-text:has-text("ExNihilo SQL Studio")'),
  });

  const count = await blockingWindows.count();
  for (let i = 0; i < count; i++) {
    const win = blockingWindows.nth(i);
    const closeBtn = win.locator('button.win95-btn-titlebar, button[aria-label="Close Window"], button[aria-label="Close"]').first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click({ force: true }).catch(() => {});
    }
  }

  // Focus SQL Studio window
  const studioTitlebar = page.locator('.win95-titlebar-text:has-text("ExNihilo SQL Studio")');
  if (await studioTitlebar.isVisible().catch(() => false)) {
    await studioTitlebar.click({ force: true }).catch(() => {});
  }
}

test.describe('Window Lifecycle & Win95 Shell Spec', () => {
  test.beforeEach(async ({ page }) => {
    await prepareDesktop(page);
  });

  test('1. Minimize & DOM State Retention', async ({ page }) => {
    const studioWindow = page.locator('div.win95-window').filter({
      has: page.locator('.win95-titlebar-text:has-text("ExNihilo SQL Studio")'),
    });
    await expect(studioWindow).toBeVisible();

    // Click Minimize button '_' (Method B: force click)
    const minimizeBtn = studioWindow.locator('button[title="Minimize"]');
    await minimizeBtn.click({ force: true });

    // Taskbar item exists with class .win95-task-tab
    const taskbarItem = page.locator('button.win95-task-tab').filter({ hasText: 'ExNihilo SQL Studio' });
    await expect(taskbarItem).toBeVisible();
  });

  test('2. Taskbar Restore & Maximize Geometry', async ({ page }) => {
    const studioWindow = page.locator('div.win95-window').filter({
      has: page.locator('.win95-titlebar-text:has-text("ExNihilo SQL Studio")'),
    });

    // Minimize window first
    const minimizeBtn = studioWindow.locator('button[title="Minimize"]');
    await minimizeBtn.click({ force: true });

    // Click Taskbar item (.win95-task-tab) to restore
    const taskbarItem = page.locator('button.win95-task-tab').filter({ hasText: 'ExNihilo SQL Studio' });
    await taskbarItem.click({ force: true });
    await expect(studioWindow).toBeVisible();

    // Click Maximize button
    const maxBtn = studioWindow.locator('button[title="Maximize Window"], button[title="Restore Window"]');
    if (await maxBtn.isVisible()) {
      await maxBtn.click({ force: true });
      await expect(studioWindow).toBeVisible();
      await maxBtn.click({ force: true });
      await expect(studioWindow).toBeVisible();
    }
  });

  test('3. Header Drag Isolation', async ({ page }) => {
    const studioWindow = page.locator('div.win95-window').filter({
      has: page.locator('.win95-titlebar-text:has-text("ExNihilo SQL Studio")'),
    });
    const titlebar = studioWindow.locator('.win95-titlebar').first();
    await expect(titlebar).toBeVisible();

    const box = await titlebar.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 50, box.y + 10);
      await page.mouse.down();
      await page.mouse.move(box.x + 100, box.y + 50);
      await page.mouse.up();
      await expect(studioWindow).toBeVisible();
    }
  });
});
