import { test, expect } from '../src/fixtures';
import { PRODUCTS } from '../src/data/testData';

test.describe('Cart', () => {
  test.beforeEach(async ({ loggedIn: inventoryPage }) => {
    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK);
    await inventoryPage.addProductToCart(PRODUCTS.BIKE_LIGHT);
    await inventoryPage.goToCart();
  });

  test('should display added products @smoke @regression', async ({ cartPage }) => {
    await cartPage.assertOnCartPage();
    await cartPage.assertProductInCart(PRODUCTS.BACKPACK);
    await cartPage.assertProductInCart(PRODUCTS.BIKE_LIGHT);
    expect(await cartPage.getItemCount()).toBe(2);
  });

  test('should remove a product from the cart @regression', async ({ cartPage }) => {
    await cartPage.removeProduct(PRODUCTS.BACKPACK);
    expect(await cartPage.getItemCount()).toBe(1);
  });

  test('should return to the inventory page via continue shopping @regression', async ({
    cartPage,
    inventoryPage,
  }) => {
    await cartPage.continueShopping();
    await inventoryPage.assertOnInventoryPage();
  });

  test('should proceed to checkout @smoke @regression', async ({ cartPage, checkoutPage }) => {
    await cartPage.checkout();
    await checkoutPage.assertOnStepOne();
  });
});
