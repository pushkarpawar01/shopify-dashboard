const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const shopifyService = require('../services/shopifyService');

// Middleware to validate shop and access token
const validateShop = (req, res, next) => {
  const shop = req.headers['x-shopify-shop-domain'];
  const accessToken = req.headers['x-shopify-access-token'];

  if (!shop || !accessToken) {
    return res.status(400).json({
      error: 'Missing shop or access token in headers',
      requiredHeaders: {
        'X-Shopify-Shop-Domain': 'your-shop.myshopify.com',
        'X-Shopify-Access-Token': 'shpat_...'
      }
    });
  }

  req.shop = shop;
  req.accessToken = accessToken;
  next();
};

// GET /api/orders - Get all orders for a shop
router.get('/orders', validateShop, async (req, res) => {
  try {
    const { shop } = req;
    const { limit = 50, offset = 0, sync = false } = req.query;

    if (sync === 'true') {
      try {
        const orders = await shopifyService.syncOrders(shop, req.accessToken);
        for (const order of orders) {
          await Order.create(order);
        }
      } catch (syncError) {
        console.error('Error syncing orders:', syncError);
      }
    }

    const orders = await Order.findAll(shop, parseInt(limit), parseInt(offset));

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.findByOrderId(order.order_id);
        return { ...order, items };
      })
    );

    res.json({
      success: true,
      data: ordersWithItems,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: ordersWithItems.length
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

// GET /api/orders/last-60-days
router.get('/orders/last-60-days', validateShop, async (req, res) => {
  try {
    const { shop } = req;

    const orders = await Order.getOrdersFromLast60Days(shop);

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.findByOrderId(order.order_id);
        return { ...order, items };
      })
    );

    res.json({
      success: true,
      data: ordersWithItems,
      count: ordersWithItems.length
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

// GET /api/orders/:id
router.get('/orders/:id', validateShop, async (req, res) => {
  try {
    const { id } = req.params;
    const { shop, accessToken } = req;

    let order = await Order.findById(id, shop);

    if (!order) {
      const shopifyOrder = await shopifyService.getOrderById(shop, accessToken, id);
      if (!shopifyOrder) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      order = await Order.create({
        shop: shop,
        order_id: shopifyOrder.id.split('/').pop(),
        status: shopifyOrder.displayFinancialStatus,
        total_price: parseFloat(shopifyOrder.totalPriceSet.shopMoney.amount),
        currency: shopifyOrder.totalPriceSet.shopMoney.currencyCode,
        customer_email: shopifyOrder.customer?.email || shopifyOrder.email,
        customer_name: shopifyOrder.customer
          ? `${shopifyOrder.customer.firstName || ''} ${shopifyOrder.customer.lastName || ''}`.trim()
          : 'Guest',
        created_at: shopifyOrder.createdAt
      });

      const items = shopifyOrder.lineItems.edges.map(edge => ({
        order_id: order.order_id,
        line_item_id: edge.node.id.split('/').pop(),
        product_id: edge.node.variant?.product?.id?.split('/').pop() || null,
        variant_id: edge.node.variant?.id?.split('/').pop() || null,
        title: edge.node.title,
        quantity: edge.node.quantity,
        price: parseFloat(edge.node.originalTotalSet.shopMoney.amount),
        sku: edge.node.sku || '',
        image_url: edge.node.variant?.image?.url || null
      }));

      await OrderItem.bulkCreate(items);
    }

    const items = await OrderItem.findByOrderId(order.order_id);

    res.json({
      success: true,
      data: { ...order, items }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order details'
    });
  }
});

// POST /api/sync/orders
router.post('/sync/orders', validateShop, async (req, res) => {
  try {
    const { shop, accessToken } = req;

    const orders = await shopifyService.syncOrders(shop, accessToken);

    const savedOrders = [];
    for (const order of orders) {
      const savedOrder = await Order.create(order);
      savedOrders.push(savedOrder);
    }

    // Fetch order items for each saved order
    const ordersWithItems = await Promise.all(
      savedOrders.map(async (order) => {
        const items = await OrderItem.findByOrderId(order.order_id);
        return { ...order, items };
      })
    );

    res.json({
      success: true,
      message: `Synced ${savedOrders.length} orders`,
      data: ordersWithItems
    });
  } catch (error) {
    console.error('Error syncing orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync orders'
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = router;
