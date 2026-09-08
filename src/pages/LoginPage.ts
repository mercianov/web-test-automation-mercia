import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ─── Locators ─────────────────────────────────────────────────────────────────

  get usernameInput() {
    return this.page.locator('#user-name');
  }

  get passwordInput() {
    return this.page.locator('#password');
  }

  get loginButton() {
    return this.page.locator('#login-button');
  }

  get errorMessage() {
    return this.page.locator('[data-test="error"]');
  }

  // ─── Actions ──────────────────────────────────────────────────────────────────

  async navigate() {
    await this.goto('/');
  }

  async login(username: string, password: string) {
    await this.fillInput(this.usernameInput, username);
    await this.fillInput(this.passwordInput, password);
    await this.clickAndWait(this.loginButton);
  }

  // ─── Assertions ───────────────────────────────────────────────────────────────

  async assertOnLoginPage() {
    await this.assertVisible(this.usernameInput);
    await this.assertVisible(this.passwordInput);
    await this.assertVisible(this.loginButton);
  }

  async assertLoginError(text?: string) {
    await this.assertVisible(this.errorMessage);
    if (text) await this.assertText(this.errorMessage, text);
  }
}
