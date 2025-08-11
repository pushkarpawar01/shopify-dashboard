-- Create database schema for Shopify Order Dashboard

-- Create orders table
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

-- Create order_items table
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

-- Create fulfilment_items table
CREATE TABLE IF NOT EXISTS fulfilment_items (
    id SERIAL PRIMARY KEY,
    return_id VARCHAR(255),
    line_item_id VARCHAR(255),
    quantity INTEGER,
    reason TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create images table
CREATE TABLE IF NOT EXISTS images (
    id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    return_item_id INTEGER REFERENCES fulfilment_items(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_shop ON orders(shop);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_fulfilment_items_return_id ON fulfilment_items(return_id);
