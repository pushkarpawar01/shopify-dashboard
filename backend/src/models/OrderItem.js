const pool = require('../config/database');

class OrderItem {
  static async create(itemData) {
    const {
      order_id,
      line_item_id,
      product_id,
      variant_id,
      title,
      quantity,
      price,
      sku,
      image_url
    } = itemData;

    const query = `
      INSERT INTO order_items (order_id, line_item_id, product_id, variant_id, title, quantity, price, sku, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (order_id, line_item_id) DO UPDATE SET
        quantity = EXCLUDED.quantity,
        price = EXCLUDED.price,
        updated_at = NOW()
      RETURNING *;
    `;

    const values = [order_id, line_item_id, product_id, variant_id, title, quantity, price, sku, image_url];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByOrderId(orderId) {
    const query = 'SELECT * FROM order_items WHERE order_id = $1 ORDER BY id';
    const result = await pool.query(query, [orderId]);
    return result.rows;
  }

  static async bulkCreate(items) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const results = [];
      for (const item of items) {
        const result = await this.create(item);
        results.push(result);
      }
      
      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = OrderItem;
