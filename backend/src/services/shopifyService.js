const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
const { nodeAdapter } = require('@shopify/shopify-api/adapters/node');
const axios = require('axios');
require('dotenv').config();

class ShopifyService {
  constructor() {
    this.shopify = shopifyApi({
      adapter: nodeAdapter,
      apiKey: process.env.SHOPIFY_API_KEY,
      apiSecretKey: process.env.SHOPIFY_API_SECRET,
      scopes: process.env.SHOPIFY_SCOPES?.split(',') || ['read_orders'],
      hostName: process.env.HOST_NAME,
      apiVersion: LATEST_API_VERSION,
      isEmbeddedApp: true,
    });

    // ✅ Set these once so they are always defined
    this.apiUrl = `https://${process.env.SHOPIFY_SHOP}/admin/api/${LATEST_API_VERSION}/graphql.json`;
    this.accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

    if (!this.apiUrl || !this.accessToken) {
      throw new Error('Missing SHOPIFY_SHOP or SHOPIFY_ACCESS_TOKEN in .env');
    }
  }

  async getShopifyOrders(shop, accessToken) {
    try {
      console.log(`Fetching all orders using REST API`);

      let allOrders = [];
      let nextUrl = `https://${shop}/admin/api/${LATEST_API_VERSION}/orders.json?limit=250`;

      while (nextUrl) {
        console.log(`Fetching: ${nextUrl}`);

        const response = await fetch(nextUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': accessToken
          }
        });

        if (!response.ok) {
          throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Fetched ${data.orders.length} orders in this page`);

        // Add orders to our collection
        allOrders = allOrders.concat(data.orders);

        // Check for next page using Link header
        const linkHeader = response.headers.get('link');
        nextUrl = null;

        if (linkHeader) {
          const links = linkHeader.split(',');
          for (const link of links) {
            if (link.includes('rel="next"')) {
              const match = link.match(/<([^>]+)>/);
              if (match) {
                nextUrl = match[1];
                break;
              }
            }
          }
        }

        // Safety check to prevent infinite loops
        if (allOrders.length > 10000) {
          console.warn('Fetched over 10,000 orders, stopping to prevent memory issues');
          break;
        }
      }

      console.log(`Total orders fetched: ${allOrders.length}`);
      return allOrders;

    } catch (err) {
      console.error("Error fetching orders from Shopify:", err);
      throw err;
    }
  }


  async getOrderById(shop, accessToken, orderId) {
    try {
      const url = `https://${shop}/admin/api/${LATEST_API_VERSION}/orders/${orderId}.json`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken
        }
      });

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.order;
    } catch (error) {
      console.error('Error fetching order from Shopify:', error);
      throw error;
    }
  }

  async syncOrders(shop, accessToken) {
    try {
      const orders = await this.getShopifyOrders(shop, accessToken);
      const orderData = orders.map(order => ({
        shop: process.env.SHOPIFY_SHOP,
        order_id: order.id,
        status: order.financial_status,
        total_price: parseFloat(order.total_price),
        currency: order.currency,
        customer_email: order.email,
        customer_name: order.customer
          ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim()
          : order.billing_address
            ? order.billing_address.name
            : 'Guest',
        created_at: order.created_at,
      }));

      return orderData;
    } catch (error) {
      console.error('Error syncing orders:', error);
      throw error;
    }
  }
}

module.exports = new ShopifyService();