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
    const date60DaysAgo = new Date();
    date60DaysAgo.setDate(date60DaysAgo.getDate() - 60);
    const isoDate = date60DaysAgo.toISOString().split('.')[0] + 'Z';

    console.log(`Fetching orders created since: ${isoDate}`);

    let hasNextPage = true;
    let endCursor = null;
    let allOrders = [];

    while (hasNextPage) {
      const query = `
      {
        orders(
          first: 50,
          after: ${endCursor ? `"${endCursor}"` : null},
          query: "created_at:>='${isoDate}'"
        ) {
          edges {
            node {
              id
              name
              createdAt
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
      `;

      const apiUrl = `https://${shop}/admin/api/${LATEST_API_VERSION}/graphql.json`;

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken
        },
        body: JSON.stringify({ query })
      });

      const json = await res.json();
      console.log("Shopify raw response:", JSON.stringify(json, null, 2));

      if (json.errors) {
        throw new Error(`Shopify API errors: ${JSON.stringify(json.errors)}`);
      }

      const ordersData = json.data.orders;
      ordersData.edges.forEach(edge => {
        allOrders.push(edge.node);
      });

      hasNextPage = ordersData.pageInfo.hasNextPage;
      endCursor = ordersData.pageInfo.endCursor;
    }

    console.log(`Fetched ${allOrders.length} orders`);
    return allOrders;

  } catch (err) {
    console.error("Error fetching orders from Shopify:", err);
    throw err;
  }
}


  async getOrderById(shop, accessToken, orderId) {
    const query = `
      query getOrder($id: ID!) {
        order(id: $id) {
          id
          name
          email
          createdAt
          updatedAt
          displayFinancialStatus
          displayFulfillmentStatus
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          customer {
            firstName
            lastName
            email
          }
          lineItems(first: 100) {
            edges {
              node {
                id
                title
                quantity
                sku
                variant {
                  id
                  image {
                    url
                  }
                }
                originalTotalSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
          shippingAddress {
            name
            address1
            address2
            city
            province
            country
            zip
          }
          billingAddress {
            name
            address1
            address2
            city
            province
            country
            zip
          }
        }
      }
    `;

    try {
      const response = await axios.post(
        `https://${shop}/admin/api/${LATEST_API_VERSION}/graphql.json`,
        { query, variables: { id: orderId } },
        {
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.data.order;
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
        order_id: order.id.split('/').pop(),
        status: order.displayFinancialStatus,
        total_price: parseFloat(order.totalPriceSet.shopMoney.amount),
        currency: order.totalPriceSet.shopMoney.currencyCode,
        customer_email: order.customer?.email || order.email,
        customer_name: order.customer
          ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
          : 'Guest',
        created_at: order.createdAt,
      }));

      return orderData;
    } catch (error) {
      console.error('Error syncing orders:', error);
      throw error;
    }
  }
}

module.exports = new ShopifyService();
