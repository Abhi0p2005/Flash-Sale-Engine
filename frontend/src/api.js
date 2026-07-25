const API_BASE = '';

function getToken() {
  return localStorage.getItem('accessToken');
}

function getAuthHeaders() {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(text);
  }
  return res.json().catch(() => null);
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(res);
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

export async function register(name, email, password, phone) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, phone }),
  });
  const data = await handleResponse(res);
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

export async function refreshToken() {
  const rt = localStorage.getItem('refreshToken');
  if (!rt) throw new Error('No refresh token');
  const res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: rt }),
  });
  const data = await handleResponse(res);
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

export function getStoredUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

export async function fetchProducts(category) {
  const url = category ? `${API_BASE}/api/v1/products?category=${category}` : `${API_BASE}/api/v1/products`;
  const res = await fetch(url);
  return handleResponse(res);
}

export async function fetchProduct(id) {
  const res = await fetch(`${API_BASE}/api/v1/products/${id}`);
  return handleResponse(res);
}

export async function fetchCart() {
  const res = await fetch(`${API_BASE}/api/cart`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function addToCartAPI(productId, productName, productImage, quantity, price) {
  const res = await fetch(`${API_BASE}/api/cart/items`, {
    method: 'POST', headers: getAuthHeaders(),
    body: JSON.stringify({ productId, productName, productImage, quantity, price }),
  });
  return handleResponse(res);
}

export async function updateCartItem(itemId, quantity) {
  const res = await fetch(`${API_BASE}/api/cart/items/${itemId}`, {
    method: 'PUT', headers: getAuthHeaders(),
    body: JSON.stringify({ quantity }),
  });
  return handleResponse(res);
}

export async function removeCartItem(itemId) {
  const res = await fetch(`${API_BASE}/api/cart/items/${itemId}`, {
    method: 'DELETE', headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function clearCartAPI() {
  await fetch(`${API_BASE}/api/cart`, { method: 'DELETE', headers: getAuthHeaders() });
}

export async function fetchOrders() {
  const res = await fetch(`${API_BASE}/api/v1/orders`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function checkoutAPI(addressId, paymentMethod) {
  const res = await fetch(`${API_BASE}/api/v1/orders/checkout`, {
    method: 'POST', headers: getAuthHeaders(),
    body: JSON.stringify({ addressId, paymentMethod }),
  });
  return handleResponse(res);
}

export async function fetchProfile() {
  const res = await fetch(`${API_BASE}/api/users/profile`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function updateProfile(data) {
  const res = await fetch(`${API_BASE}/api/users/profile`, {
    method: 'PUT', headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function fetchAddresses() {
  const res = await fetch(`${API_BASE}/api/users/addresses`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function addAddress(address) {
  const res = await fetch(`${API_BASE}/api/users/addresses`, {
    method: 'POST', headers: getAuthHeaders(),
    body: JSON.stringify(address),
  });
  return handleResponse(res);
}

export async function deleteAddress(id) {
  await fetch(`${API_BASE}/api/users/addresses/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
}

export async function fetchWishlist() {
  const res = await fetch(`${API_BASE}/api/wishlist`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function addToWishlist(productId, productName, productImage, productPrice) {
  const res = await fetch(`${API_BASE}/api/wishlist/items`, {
    method: 'POST', headers: getAuthHeaders(),
    body: JSON.stringify({ productId, productName, productImage, productPrice }),
  });
  return handleResponse(res);
}

export async function removeFromWishlist(id) {
  await fetch(`${API_BASE}/api/wishlist/items/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
}

export async function fetchProductStock(id) {
  const res = await fetch(`${API_BASE}/api/products/${id}/stock`);
  return handleResponse(res);
}

export async function fetchStockBatch(productIds) {
  const ids = productIds.join(',');
  const res = await fetch(`${API_BASE}/api/products/stock-batch?ids=${ids}`);
  return handleResponse(res);
}
