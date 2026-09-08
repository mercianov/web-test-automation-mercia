import { test, expect } from '../src/fixtures';
import { UserType, DEFAULT_PASSWORD } from '../src/data/testData';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test('should display the login page @smoke', async ({ loginPage }) => {
    await loginPage.assertOnLoginPage();
  });

  test('should login successfully with a valid user @smoke @regression', async ({
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.login(UserType.STANDARD, DEFAULT_PASSWORD);
    await inventoryPage.assertOnInventoryPage();
  });

  test('should show an error for a locked out user @regression', async ({ loginPage }) => {
    await loginPage.login(UserType.LOCKED_OUT, DEFAULT_PASSWORD);
    await loginPage.assertLoginError('Epic sadface: Sorry, this user has been locked out.');
  });

  test('should show an error for invalid credentials @regression', async ({ loginPage }) => {
    await loginPage.login('invalid_user', 'wrong_password');
    await loginPage.assertLoginError(
      'Epic sadface: Username and password do not match any user in this service'
    );
  });

  test('should show an error when username is missing @regression', async ({ loginPage }) => {
    await loginPage.passwordInput.fill(DEFAULT_PASSWORD);
    await loginPage.loginButton.click();
    await loginPage.assertLoginError('Epic sadface: Username is required');
  });

  test('should show an error when password is missing @regression', async ({ loginPage }) => {
    await loginPage.usernameInput.fill(UserType.STANDARD);
    await loginPage.loginButton.click();
    await loginPage.assertLoginError('Epic sadface: Password is required');
  });

  test('should log out back to the login page @regression', async ({ loginPage, inventoryPage }) => {
    await loginPage.login(UserType.STANDARD, DEFAULT_PASSWORD);
    await inventoryPage.assertOnInventoryPage();
    await inventoryPage.logout();
    await loginPage.assertOnLoginPage();
  });
});
