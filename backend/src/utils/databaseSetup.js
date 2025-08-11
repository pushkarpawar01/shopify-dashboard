const { Pool } = require('pg');
require('dotenv').config();

async function createDatabaseIfNotExists() {
  const adminPool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
  });

  const dbName = process.env.DB_NAME || 'shopify_orders';

  const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
  const checkResult = await adminPool.query(checkDbQuery, [dbName]);

  if (checkResult.rows.length === 0) {
    console.log(`Creating database: ${dbName}`);
    await adminPool.query(`CREATE DATABASE ${dbName}`);
    console.log(`Database ${dbName} created successfully`);
  } else {
    console.log(`Database ${dbName} already exists`);
  }

  await adminPool.end();
}

async function setupTables() {
  const pool = require('../config/database');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      shop VARCHAR(255) NOT NULL,
      order_id VARCHAR(255) UNIQUE NOT NULL,
      status VARCHAR(50),
      total_price DECIMAL(10,2),
      currency VARCHAR(3),
      customer_email VARCHAR(255),
      customer_name VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id VARCHAR(255) REFERENCES orders(order_id) ON DELETE CASCADE,
      line_item_id VARCHAR(255),
      product_id VARCHAR(255),
      variant_id VARCHAR(255),
      title VARCHAR(255),
      quantity INTEGER,
      price DECIMAL(10,2),
      sku VARCHAR(255),
      image_url TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS fulfilment_items (
      id SERIAL PRIMARY KEY,
      return_id VARCHAR(255),
      line_item_id VARCHAR(255),
      quantity INTEGER,
      reason TEXT,
      image_url TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS images (
      id SERIAL PRIMARY KEY,
      image_url TEXT NOT NULL,
      return_item_id INTEGER REFERENCES fulfilment_items(id) ON DELETE CASCADE
    );
  `);

  // Create indexes (only once)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_orders_shop ON orders(shop);
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_fulfilment_items_return_id ON fulfilment_items(return_id);
  `);
}

async function setupDatabase() {
  await createDatabaseIfNotExists();
  await setupTables();
  console.log('Database setup completed successfully');
}

module.exports = { setupDatabase };
