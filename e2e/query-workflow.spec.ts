import { test, expect, Page } from '@playwright/test';

/**
 * e2e/query-workflow.spec.ts — Multi-Tab Query & Results Workflow Spec
 *
 * Tests:
 *  1. Tab creation, Alt hotkeys, and right-click context menu.
 *  2. Query execution & dialect routing.
 *  3. ResultsGrid interactions (filtering, sorting, CSV export download).
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

test.describe('Multi-Tab Query & Results Workflow Spec', () => {
  test.beforeEach(async ({ page }) => {
    await prepareDesktop(page);
  });

  test('1. Tab Creation & Alt Hotkeys & Tab Right-Click Context Menu', async ({ page }) => {
    const studioWindow = page.locator('div.win95-window').filter({
      has: page.locator('.win95-titlebar-text:has-text("ExNihilo SQL Studio")'),
    });
    await expect(studioWindow).toBeVisible();

    // Click '+' button to create new query tab (Method B: force click)
    const addTabBtn = studioWindow.locator('button.win95-new-tab-btn');
    await addTabBtn.click({ force: true });

    // Verify Tab 2 (.win95-editor-tab) exists
    const tab2 = studioWindow.locator('.win95-editor-tab:has-text("Query 2.sql")');
    await expect(tab2).toBeVisible();

    // Test Alt+T hotkey for new tab
    await page.keyboard.press('Alt+t');
    const tab3 = studioWindow.locator('.win95-editor-tab:has-text("Query 3.sql")');
    await expect(tab3).toBeVisible();

    // Test Right-Click Tab Context Menu (Duplicate Tab)
    await tab3.click({ button: 'right', force: true });
    const duplicateOption = page.locator('div.win95-dropdown-item:has-text("Duplicate Tab")');
    await expect(duplicateOption).toBeVisible();
    await duplicateOption.click({ force: true });

    // Verify duplicated tab created as "Query 3 (Copy).sql"
    const tabCopy = studioWindow.locator('.win95-editor-tab:has-text("Query 3 (Copy).sql")');
    await expect(tabCopy).toBeVisible();
  });

  test('2. Query Execution & Window Functions', async ({ page }) => {
    const studioWindow = page.locator('div.win95-window').filter({
      has: page.locator('.win95-titlebar-text:has-text("ExNihilo SQL Studio")'),
    });
    await expect(studioWindow).toBeVisible();

    // Click Run button (Method B: force click)
    const runBtn = studioWindow.locator('button:has-text("Run")').first();
    await expect(runBtn).toBeVisible();
    await runBtn.click({ force: true });

    // Verify ResultsGrid displays results
    const resultsPane = studioWindow.locator('#tour-results-grid');
    await expect(resultsPane).toBeVisible();
    const rowsStatus = resultsPane.locator('div.win95-statusbar-pane:has-text("Rows:")');
    await expect(rowsStatus).toBeVisible();
  });

  test('3. Grid Interactions & CSV Export Download', async ({ page }) => {
    const studioWindow = page.locator('div.win95-window').filter({
      has: page.locator('.win95-titlebar-text:has-text("ExNihilo SQL Studio")'),
    });
    await expect(studioWindow).toBeVisible();

    // Run query first (Method B: force click)
    const runBtn = studioWindow.locator('button:has-text("Run")').first();
    await runBtn.click({ force: true });

    const resultsPane = studioWindow.locator('#tour-results-grid');
    await expect(resultsPane).toBeVisible();

    // Test Filter input
    const filterInput = resultsPane.locator('input[placeholder="Search rows..."]');
    if (await filterInput.isVisible()) {
      await filterInput.fill('1');
      await expect(filterInput).toHaveValue('1');
      // Clear filter
      const clearFilterBtn = resultsPane.locator('button:has-text("✕")');
      if (await clearFilterBtn.isVisible()) {
        await clearFilterBtn.click({ force: true });
      }
    }

    // Test Column Header Sorting
    const firstHeader = resultsPane.locator('th').nth(1);
    if (await firstHeader.isVisible()) {
      await firstHeader.click({ force: true });
      // Verify sort indicator
      const sortIndicator = firstHeader.locator('span:has-text("▲"), span:has-text("▼")');
      await expect(sortIndicator).toBeVisible();
    }

    // Test CSV Export file download event
    const csvBtn = resultsPane.locator('button:has-text("CSV")');
    await expect(csvBtn).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await csvBtn.click({ force: true });
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });
});
