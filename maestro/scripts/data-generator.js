// Generate synthetic test data for dynamic test scenarios
// Available outputs: randomUser, randomAddress, uniqueSuffix

const uniqueSuffix = Math.random().toString(36).slice(2, 10);

output.uniqueSuffix = uniqueSuffix;

output.randomUser = {
  email: `user_${uniqueSuffix}@example.com`,
  name: `Test User ${uniqueSuffix}`,
  phone: `555-${String(Math.floor(Math.random() * 9000) + 100)}-${String(Math.floor(Math.random() * 9000) + 100)}`,
};

output.randomAddress = {
  street: `${Math.floor(Math.random() * 9999) + 1} Test Street`,
  city: 'Automation City',
  zip: `${Math.floor(Math.random() * 90000) + 10000}`,
};

output.randomProduct = {
  name: `Test Product ${uniqueSuffix}`,
  price: (Math.random() * 100 + 10).toFixed(2),
};

// Data-driven array for loops
output.testItems = [
  { name: 'Headphones', price: 99, qty: 1 },
  { name: 'Charger', price: 29, qty: 2 },
  { name: 'Case', price: 19, qty: 1 },
];
output.currentIndex = 0;

console.log('Synthetic data generated:', output.uniqueSuffix);
