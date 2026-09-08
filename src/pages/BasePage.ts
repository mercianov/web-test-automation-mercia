import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ─── Navigation ───────────────────────────────────────────────────────────────

  async goto(path = '') {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ─── Element Interaction Helpers ──────────────────────────────────────────────

  async clickAndWait(locator: Locator) {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  async fillInput(locator: Locator, value: string) {
    await locator.waitFor({ state: 'visible' });
    await locator.clear();
    await locator.fill(value);
  }

  async selectOption(locator: Locator, value: string) {
    await locator.selectOption(value);
  }

  async waitForVisible(locator: Locator, timeoutMs = 10000) {
    await locator.waitFor({ state: 'visible', timeout: timeoutMs });
  }

  /** Returns true if the locator is visible within the given timeout, false otherwise. */
  async isVisible(locator: Locator, timeoutMs = 3000): Promise<boolean> {
    return locator.waitFor({ state: 'visible', timeout: timeoutMs }).then(() => true).catch(() => false);
  }

  async waitForHidden(locator: Locator, timeoutMs = 10000) {
    await locator.waitFor({ state: 'hidden', timeout: timeoutMs });
  }

  async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible' });
    return (await locator.textContent()) ?? '';
  }

  // ─── Assertion Helpers ────────────────────────────────────────────────────────

  async assertVisible(locator: Locator) {
    await expect(locator).toBeVisible();
  }

  async assertText(locator: Locator, text: string) {
    await expect(locator).toContainText(text);
  }

  async assertUrl(pattern: string | RegExp) {
    await expect(this.page).toHaveURL(pattern);
  }

  async assertTitle(pattern: string | RegExp) {
    await expect(this.page).toHaveTitle(pattern);
  }

  // ─── Screenshot Helper ────────────────────────────────────────────────────────

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }
}
