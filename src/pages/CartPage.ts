import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ─── Locators ─────────────────────────────────────────────────────────────────

  get cartItems() {
    return this.page.locator('.cart_item');
  }

  get checkoutButton() {
    return this.page.locator('[data-test="checkout"]');
  }

  get continueShoppingButton() {
    return this.page.locator('[data-test="continue-shopping"]');
  }

  itemByName(productName: string) {
    return this.page.locator('.cart_item', { hasText: productName });
  }

  removeButton(productName: string) {
    return this.itemByName(productName).locator('button');
  }

  // ─── Actions ──────────────────────────────────────────────────────────────────

  async checkout() {
    await this.clickAndWait(this.checkoutButton);
  }

  async continueShopping() {
    await this.clickAndWait(this.continueShoppingButton);
  }

  async removeProduct(productName: string) {
    await this.clickAndWait(this.removeButton(productName));
  }

  async getItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  // ─── Assertions ───────────────────────────────────────────────────────────────

  async assertOnCartPage() {
    await this.assertUrl(/cart\.html/);
  }

  async assertProductInCart(productName: string) {
    await this.assertVisible(this.itemByName(productName));
  }
}
