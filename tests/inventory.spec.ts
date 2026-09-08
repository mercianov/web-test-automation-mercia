import { test, expect } from '../src/fixtures';
import { PRODUCTS, SortOption } from '../src/data/testData';

test.describe('Inventory', () => {
  test.beforeEach(async ({ loggedIn }) => {
    // `loggedIn` fixture navigates and logs in, landing on the inventory page.
  });

  test('should list all products @smoke', async ({ loggedIn: inventoryPage }) => {
    const count = await inventoryPage.getItemCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should add a product to the cart @smoke @regression', async ({ loggedIn: inventoryPage }) => {
    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK);
    expect(await inventoryPage.getCartBadgeCount()).toBe(1);
  });

  test('should add multiple products and update the cart badge @regression', async ({
    loggedIn: inventoryPage,
  }) => {
    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK);
    await inventoryPage.addProductToCart(PRODUCTS.BIKE_LIGHT);
    await inventoryPage.addProductToCart(PRODUCTS.ONESIE);
    expect(await inventoryPage.getCartBadgeCount()).toBe(3);
  });

  test('should remove a product from the inventory page @regression', async ({
    loggedIn: inventoryPage,
  }) => {
    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK);
    expect(await inventoryPage.getCartBadgeCount()).toBe(1);

    await inventoryPage.removeProductFromCart(PRODUCTS.BACKPACK);
    expect(await inventoryPage.getCartBadgeCount()).toBe(0);
  });

  test('should sort products by name Z to A @regression', async ({ loggedIn: inventoryPage }) => {
    await inventoryPage.sortBy(SortOption.NAME_Z_TO_A);
    const names = await inventoryPage.page.locator('.inventory_item_name').allTextContents();
    const sorted = [...names].sort((a, b) => b.localeCompare(a));
    expect(names).toEqual(sorted);
  });

  test('should sort products by price low to high @regression', async ({ loggedIn: inventoryPage }) => {
    await inventoryPage.sortBy(SortOption.PRICE_LOW_TO_HIGH);
    const prices = await inventoryPage.page.locator('.inventory_item_price').allTextContents();
    const parsed = prices.map(p => parseFloat(p.replace('$', '')));
    const sorted = [...parsed].sort((a, b) => a - b);
    expect(parsed).toEqual(sorted);
  });

  test('should navigate to the cart page @smoke @regression', async ({ loggedIn: inventoryPage }) => {
    await inventoryPage.goToCart();
    await expect(inventoryPage.page).toHaveURL(/cart\.html/);
  });
});
