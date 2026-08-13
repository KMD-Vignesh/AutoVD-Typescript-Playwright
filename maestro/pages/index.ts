/**
 * P1 #6 — Maestro Page Objects (TypeScript definitions)
 * These provide typed selectors for Maestro JavaScript scripts.
 */

/**
 * Login page element selectors
 */
export const LoginPage = {
  emailInput: { id: 'email_input' },
  passwordInput: { id: 'password_input' },
  loginButton: { id: 'login_button' },
  skipButton: { text: '.*Skip.*' },
  welcomeText: { text: '.*Dashboard.*' },
  profileTab: { id: 'profile_tab' },
} as const;

/**
 * Product page element selectors
 */
export const ProductPage = {
  productsTab: { id: 'products_tab' },
  addToCartButton: { id: 'add_to_cart_button' },
  backToProducts: { text: '.*Back.*' },
  productCard: (name: string) => ({ text: `.*${name}.*` }),
} as const;

/**
 * Cart page element selectors
 */
export const CartPage = {
  cartTab: { id: 'cart_tab' },
  itemCount: { text: '.*items.*' },
  checkoutButton: { id: 'checkout_button' },
  totalText: { text: '.*Total.*' },
} as const;

/**
 * Checkout page element selectors
 */
export const CheckoutPage = {
  cardNumberInput: { id: 'card_number_input' },
  expiryInput: { id: 'expiry_input' },
  cvvInput: { id: 'cvv_input' },
  payNowButton: { id: 'pay_now_button' },
  orderConfirmed: { text: '.*Order Confirmed.*' },
  orderId: { text: '.*#.*' },
} as const;

/**
 * Onboarding page element selectors
 */
export const OnboardingPage = {
  welcomeText: { text: '.*Welcome.*' },
  getStartedButton: { text: '.*Get Started.*' },
  allowNotifications: { text: '.*Allow Notifications.*' },
} as const;

/**
 * Helper: generate a random test user
 */
export function randomUser() {
  const suffix = Math.random().toString(36).slice(2, 8);
  return {
    email: `test_${suffix}@example.com`,
    password: 'TestPass123!',
    firstName: `Test User ${suffix}`,
  };
}

/**
 * Helper: generate a random product
 */
export function randomProduct() {
  const suffix = Math.random().toString(36).slice(2, 8);
  return {
    name: `Test Product ${suffix}`,
    price: Math.round((Math.random() * 100 + 10) * 100) / 100,
  };
}
