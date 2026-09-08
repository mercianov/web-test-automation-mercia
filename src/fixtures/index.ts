import { test as base } from '@playwright/test';
import { getCredentials } from '../config';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

// ─── Custom Fixture Types ──────────────────────────────────────────────────────

type TestFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;

  // Convenience: logs in with the default configured user and lands on inventory
  loggedIn: InventoryPage;
};

// ─── Extended Test Object ─────────────────────────────────────────────────────

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  loggedIn: async ({ loginPage, inventoryPage }, use) => {
    const { username, password } = getCredentials();
    await loginPage.navigate();
    await loginPage.login(username, password);
    await inventoryPage.assertOnInventoryPage();
    await use(inventoryPage);
  },
});

export { expect } from '@playwright/test';
