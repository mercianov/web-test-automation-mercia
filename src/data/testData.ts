// ─── Sauce Demo Test Users ──────────────────────────────────────────────────────
// These accounts are published on https://www.saucedemo.com/ itself — each one
// exercises a different behavior of the app. All share the same password.

export enum UserType {
  STANDARD = 'standard_user',
  LOCKED_OUT = 'locked_out_user',
  PROBLEM = 'problem_user',
  PERFORMANCE_GLITCH = 'performance_glitch_user',
  ERROR = 'error_user',
  VISUAL = 'visual_user',
}

export const DEFAULT_PASSWORD = 'secret_sauce';

// ─── Product Catalog ────────────────────────────────────────────────────────────

export const PRODUCTS = {
  BACKPACK: 'Sauce Labs Backpack',
  BIKE_LIGHT: 'Sauce Labs Bike Light',
  BOLT_TSHIRT: 'Sauce Labs Bolt T-Shirt',
  FLEECE_JACKET: 'Sauce Labs Fleece Jacket',
  ONESIE: 'Sauce Labs Onesie',
  RED_TSHIRT: 'Test.allTheThings() T-Shirt (Red)',
} as const;

// ─── Checkout Info ──────────────────────────────────────────────────────────────

export const CHECKOUT_INFO = {
  firstName: 'John',
  lastName: 'Doe',
  postalCode: '12345',
};

// ─── Sort Options ───────────────────────────────────────────────────────────────

export enum SortOption {
  NAME_A_TO_Z = 'az',
  NAME_Z_TO_A = 'za',
  PRICE_LOW_TO_HIGH = 'lohi',
  PRICE_HIGH_TO_LOW = 'hilo',
}
