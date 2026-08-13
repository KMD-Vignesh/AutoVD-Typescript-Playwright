// Seed test product data via API before running UI flow
// Stores: output.productName, output.productId, output.testCardNumber

const API_BASE = process.env.API_BASE_URL || 'https://api.example.com';

async function seedProduct() {
  try {
    const response = http.get(`${API_BASE}/products?limit=1`);

    if (!response.ok) {
      console.log('Failed to fetch products, using fallback');
      output.productName = 'Wireless Headphones';
      output.productId = 'prod_001';
      output.testCardNumber = '4242424242424242';
      return;
    }

    const products = json(response.body);
    const product = products[0];

    output.productName = product.name;
    output.productId = product.id;
    output.testCardNumber = '4242424242424242'; // Stripe test card
  } catch (e) {
    console.log('Seed failed, using defaults:', e.message);
    output.productName = 'Wireless Headphones';
    output.productId = 'prod_001';
    output.testCardNumber = '4242424242424242';
  }
}

seedProduct();
