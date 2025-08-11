const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getOrders(shop, accessToken, limit = 50, offset = 0, sync = false) {
    const params = new URLSearchParams({
      limit,
      offset,
      sync: sync.toString(),
    });

    return this.request(`/orders?${params}`, {
      headers: {
        'X-Shopify-Shop-Domain': shop,
        'X-Shopify-Access-Token': accessToken,
      },
    });
  }

  async getOrdersLast60Days(shop, accessToken) {
    if (!shop || !accessToken) {
      throw new Error('Shop and access token are required');
    }
    return this.request('/orders/last-60-days', {
      headers: {
        'X-Shopify-Shop-Domain': shop,
        'X-Shopify-Access-Token': accessToken,
      },
    });
  }

  async getOrderById(orderId, shop, accessToken) {
    return this.request(`/orders/${orderId}`, {
      headers: {
        'X-Shopify-Shop-Domain': shop,
        'X-Shopify-Access-Token': accessToken,
      },
    });
  }

  async syncOrders(shop, accessToken) {
    return this.request('/sync/orders', {
      method: 'POST',
      headers: {
        'X-Shopify-Shop-Domain': shop,
        'X-Shopify-Access-Token': accessToken,
      },
    });
  }

  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();
