/**
 * P0 #3 — API Schema Validation
 * JSON Schema definitions for all API responses.
 */

// ─── Auth Schemas ─────────────────────────────────────────────
export const loginRequestSchema = {
  type: 'object',
  required: ['username', 'password'],
  properties: {
    username: { type: 'string', minLength: 1 },
    password: { type: 'string', minLength: 6 },
  },
};

export const loginResponseSchema = {
  type: 'object',
  required: ['token', 'user'],
  properties: {
    token: { type: 'string', minLength: 10 },
    user: {
      type: 'object',
      required: ['id', 'username', 'role'],
      properties: {
        id: { type: 'string' },
        username: { type: 'string' },
        role: { type: 'string', enum: ['user', 'admin', 'restricted'] },
      },
    },
    expiresIn: { type: 'number' },
  },
};

export const userSchema = {
  type: 'object',
  required: ['id', 'email', 'firstName', 'lastName', 'role'],
  properties: {
    id: { type: 'string' },
    email: { type: 'string', format: 'email' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    role: { type: 'string', enum: ['user', 'admin', 'restricted'] },
    createdAt: { type: 'string' },
  },
};

export const productSchema = {
  type: 'object',
  required: ['id', 'name', 'price', 'description'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string', minLength: 1 },
    price: { type: 'number', minimum: 0 },
    description: { type: 'string' },
    imageUrl: { type: 'string' },
  },
};

export const cartItemSchema = {
  type: 'object',
  required: ['productId', 'quantity'],
  properties: {
    productId: { type: 'string' },
    quantity: { type: 'number', minimum: 1 },
    name: { type: 'string' },
    price: { type: 'number' },
  },
};

export const cartSchema = {
  type: 'object',
  required: ['items', 'total'],
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/$defs/cartItem' },
    },
    total: { type: 'number', minimum: 0 },
    itemCount: { type: 'number' },
  },
};

// ─── Order Schemas ────────────────────────────────────────────
export const orderSchema = {
  type: 'object',
  required: ['orderId', 'status', 'items', 'total'],
  properties: {
    orderId: { type: 'string' },
    status: { type: 'string', enum: ['pending', 'processing', 'shipped', 'delivered'] },
    items: { type: 'array', items: { $ref: '#/$defs/cartItem' } },
    total: { type: 'number', minimum: 0 },
    createdAt: { type: 'string' },
  },
};

// ─── Aggregate Schema (for responses with multiple types) ────
export const paginationSchema = {
  type: 'object',
  required: ['data', 'pagination'],
  properties: {
    data: { type: 'array' },
    pagination: {
      type: 'object',
      required: ['page', 'pageSize', 'total'],
      properties: {
        page: { type: 'number' },
        pageSize: { type: 'number' },
        total: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  },
};

export const errorResponseSchema = {
  type: 'object',
  required: ['error', 'statusCode'],
  properties: {
    error: { type: 'string' },
    statusCode: { type: 'number', enum: [400, 401, 403, 404, 500] },
    message: { type: 'string' },
  },
};
