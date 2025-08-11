# Shopify Order Dashboard Backend

This is the backend service for the Shopify Order Dashboard application.

## Features
- RESTful API for managing Shopify orders
- PostgreSQL database integration
- Shopify Admin API integration
- Real-time order synchronization
- Webhook support for order events

## Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Shopify Partner account and app setup

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your actual configuration values.

3. **Set up PostgreSQL database:**
   ```bash
   npm run setup-db
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### Orders
- `GET /api/orders` - Get all orders for a shop
- `GET /api/orders/last-60-days` - Get orders from last 60 days
- `GET /api/orders/:id` - Get specific order details
- `POST /api/sync/orders` - Sync orders from Shopify

### Headers Required
All endpoints require these headers:
- `shop`: The shop domain (e.g., mystore.myshopify.com)
- `accessToken`: The Shopify access token

### Query Parameters
- `limit`: Number of orders to return (default: 50)
- `offset`: Number of orders to skip (default: 0)
- `sync`: Whether to sync latest orders from Shopify (true/false)

## Database Schema

### orders
- id (SERIAL PRIMARY KEY)
- shop (VARCHAR)
- order_id (VARCHAR UNIQUE)
- status (VARCHAR)
- total_price (DECIMAL)
- currency (VARCHAR)
- customer_email (VARCHAR)
- customer_name (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### order_items
- id (SERIAL PRIMARY KEY)
- order_id (VARCHAR REFERENCES orders)
- line_item_id (VARCHAR)
- product_id (VARCHAR)
- variant_id (VARCHAR)
- title (VARCHAR)
- quantity (INTEGER)
- price (DECIMAL)
- sku (VARCHAR)
- image_url (TEXT)

## Development

### Database Setup
The database will be automatically set up when you run the server. The schema includes:
- Orders table for storing order information
- Order items table for storing line items
- Indexes for performance optimization

### Testing
You can test the API endpoints using tools like Postman or curl:

```bash
# Get all orders
curl -H "shop: your-store.myshopify.com" \
     -H "accessToken: your-access-token" \
     http://localhost:3001/api/orders

# Get specific order
curl -H "shop: your-store.myshopify.com" \
     -H "accessToken: your-access-token" \
     http://localhost:3001/api/orders/1234567890
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| DB_HOST | PostgreSQL host | localhost |
| DB_PORT | PostgreSQL port | 5432 |
| DB_NAME | Database name | shopify_orders |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | - |
| SHOPIFY_API_KEY | Shopify app API key | - |
| SHOPIFY_API_SECRET | Shopify app API secret | - |
| FRONTEND_URL | Frontend URL | http://localhost:5173 |
