const pool = require('../config/database');

class Order {
  static async create(orderData) {
    const {
      shop,
      order_id,
      status,
      total_price,
      currency,
      customer_email,
      customer_name,
      created_at
    } = orderData;

    const query = `
      INSERT INTO orders (shop, order_id, status, total_price, currency, customer_email, customer_name, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (order_id) DO UPDATE SET
        status = EXCLUDED.status,
        total_price = EXCLUDED.total_price,
        updated_at = NOW()
      RETURNING *;
    `;

    const values = [shop, order_id, status, total_price, currency, customer_email, customer_name, created_at];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(shop, limit = 50, offset = 0) {
    const query = `
      SELECT * FROM orders 
      WHERE shop = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3;
    `;
    const result = await pool.query(query, [shop, limit, offset]);
    return result.rows;
  }

  static async findById(orderId, shop) {
    const query = 'SELECT * FROM orders WHERE order_id = $1 AND shop = $2';
    const result = await pool.query(query, [orderId, shop]);
    return result.rows[0];
  }

  static async findByShop(shop) {
    const query = 'SELECT * FROM orders WHERE shop = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [shop]);
    return result.rows;
  }

  static async getOrdersFromLast60Days(shop) {
    const query = `
      SELECT * FROM orders 
      WHERE shop = $1 
      AND created_at >= NOW() - INTERVAL '60 days'
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query, [shop]);
    return result.rows;
  }
}

module.exports = Order;
