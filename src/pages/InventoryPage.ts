import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ─── Locators ─────────────────────────────────────────────────────────────────

  get pageTitle() {
    return this.page.locator('.title');
  }

  get inventoryItems() {
    return this.page.locator('.inventory_item');
  }

  get cartBadge() {
    return this.page.locator('.shopping_cart_badge');
  }

  get cartLink() {
    return this.page.locator('.shopping_cart_link');
  }

  get sortDropdown() {
    return this.page.locator('[data-test="product-sort-container"]');
  }

  get menuButton() {
    return this.page.locator('#react-burger-menu-btn');
  }

  get logoutLink() {
    return this.page.locator('#logout_sidebar_link');
  }

  itemByName(productName: string) {
    return this.page.locator('.inventory_item', { hasText: productName });
  }

  addToCartButton(productName: string) {
    return this.itemByName(productName).locator('button');
  }

  // ─── Actions ──────────────────────────────────────────────────────────────────

  async addProductToCart(productName: string) {
    await this.clickAndWait(this.addToCartButton(productName));
  }

  async removeProductFromCart(productName: string) {
    await this.clickAndWait(this.addToCartButton(productName));
  }

  async sortBy(value: string) {
    await this.selectOption(this.sortDropdown, value);
  }

  async goToCart() {
    await this.clickAndWait(this.cartLink);
  }

  async logout() {
    await this.clickAndWait(this.menuButton);
    await this.clickAndWait(this.logoutLink);
  }

  async getItemCount(): Promise<number> {
    return this.inventoryItems.count();
  }

  async getCartBadgeCount(): Promise<number> {
    const visible = await this.isVisible(this.cartBadge, 1000);
    if (!visible) return 0;
    return Number(await this.getText(this.cartBadge));
  }

  // ─── Assertions ───────────────────────────────────────────────────────────────

  async assertOnInventoryPage() {
    await this.assertUrl(/inventory\.html/);
    await this.assertText(this.pageTitle, 'Products');
  }
}
