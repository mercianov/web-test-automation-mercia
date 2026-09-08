import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Covers all three steps of the Sauce Demo checkout flow:
 * step-one (info form), step-two (order overview), and the completion page.
 */
export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ─── Locators — Step One (info) ────────────────────────────────────────────────

  get firstNameInput() {
    return this.page.locator('#first-name');
  }

  get lastNameInput() {
    return this.page.locator('#last-name');
  }

  get postalCodeInput() {
    return this.page.locator('#postal-code');
  }

  get continueButton() {
    return this.page.locator('#continue');
  }

  get errorMessage() {
    return this.page.locator('[data-test="error"]');
  }

  // ─── Locators — Step Two (overview) ────────────────────────────────────────────

  get finishButton() {
    return this.page.locator('#finish');
  }

  get cancelButton() {
    return this.page.locator('#cancel');
  }

  get summaryTotalLabel() {
    return this.page.locator('.summary_total_label');
  }

  // ─── Locators — Complete ───────────────────────────────────────────────────────

  get completeHeader() {
    return this.page.locator('.complete-header');
  }

  get backHomeButton() {
    return this.page.locator('#back-to-products');
  }

  // ─── Actions ──────────────────────────────────────────────────────────────────

  async fillInfo(firstName: string, lastName: string, postalCode: string) {
    await this.fillInput(this.firstNameInput, firstName);
    await this.fillInput(this.lastNameInput, lastName);
    await this.fillInput(this.postalCodeInput, postalCode);
    await this.clickAndWait(this.continueButton);
  }

  async finish() {
    await this.clickAndWait(this.finishButton);
  }

  async backToProducts() {
    await this.clickAndWait(this.backHomeButton);
  }

  // ─── Assertions ───────────────────────────────────────────────────────────────

  async assertOnStepOne() {
    await this.assertUrl(/checkout-step-one\.html/);
  }

  async assertOnStepTwo() {
    await this.assertUrl(/checkout-step-two\.html/);
  }

  async assertCheckoutError(text?: string) {
    await this.assertVisible(this.errorMessage);
    if (text) await this.assertText(this.errorMessage, text);
  }

  async assertOrderComplete() {
    await this.assertUrl(/checkout-complete\.html/);
    await this.assertText(this.completeHeader, 'Thank you for your order!');
  }
}
