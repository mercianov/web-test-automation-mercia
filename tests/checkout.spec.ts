import { test, expect } from '../src/fixtures';
import { PRODUCTS, CHECKOUT_INFO } from '../src/data/testData';

test.describe('Checkout', () => {
  test.beforeEach(async ({ loggedIn: inventoryPage, cartPage }) => {
    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK);
    await inventoryPage.goToCart();
    await cartPage.checkout();
  });

  test('should complete an order successfully @smoke @regression', async ({ checkoutPage }) => {
    await checkoutPage.fillInfo(
      CHECKOUT_INFO.firstName,
      CHECKOUT_INFO.lastName,
      CHECKOUT_INFO.postalCode
    );
    await checkoutPage.assertOnStepTwo();
    await checkoutPage.assertVisible(checkoutPage.summaryTotalLabel);

    await checkoutPage.finish();
    await checkoutPage.assertOrderComplete();
  });

  test('should show an error when first name is missing @regression', async ({ checkoutPage }) => {
    await checkoutPage.fillInput(checkoutPage.lastNameInput, CHECKOUT_INFO.lastName);
    await checkoutPage.fillInput(checkoutPage.postalCodeInput, CHECKOUT_INFO.postalCode);
    await checkoutPage.continueButton.click();
    await checkoutPage.assertCheckoutError('Error: First Name is required');
  });

  test('should show an error when last name is missing @regression', async ({ checkoutPage }) => {
    await checkoutPage.fillInput(checkoutPage.firstNameInput, CHECKOUT_INFO.firstName);
    await checkoutPage.fillInput(checkoutPage.postalCodeInput, CHECKOUT_INFO.postalCode);
    await checkoutPage.continueButton.click();
    await checkoutPage.assertCheckoutError('Error: Last Name is required');
  });

  test('should show an error when postal code is missing @regression', async ({ checkoutPage }) => {
    await checkoutPage.fillInput(checkoutPage.firstNameInput, CHECKOUT_INFO.firstName);
    await checkoutPage.fillInput(checkoutPage.lastNameInput, CHECKOUT_INFO.lastName);
    await checkoutPage.continueButton.click();
    await checkoutPage.assertCheckoutError('Error: Postal Code is required');
  });

  test('should cancel checkout and return to cart @regression', async ({ checkoutPage, cartPage }) => {
    await checkoutPage.cancelButton.click();
    await cartPage.assertOnCartPage();
  });
});
