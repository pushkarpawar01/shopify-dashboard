# Shopify Order Dashboard - Setup Guide

This guide will help you set up and troubleshoot the 400 Bad Request error that occurs when fetching orders.

## Quick Setup Steps

### 1. Environment Configuration

#### Backend Setup
1. Copy the example environment file:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit `backend/.env` with your actual values:
   ```
   PORT=3001
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=shopify_orders
   DB_USER=postgres
   DB_PASSWORD=your_password
   FRONTEND_URL=http://localhost:5173
   ```

#### Frontend Setup
1. Copy the example environment file:
   ```bash
   cp frontend/.env.example frontend/.env
   ```

2. Edit `frontend/.env` with your actual values:
   ```
   VITE_API_URL=http://localhost:3001/api
   VITE_SHOPIFY_SHOP=your-shop.myshopify.com
   VITE_SHOPIFY_ACCESS_TOKEN=your_actual_access_token
   ```

### 2. Database Setup

1. **Install PostgreSQL** (if not already installed)
2. **Create the database**:
   ```bash
   cd backend
   npm run setup
   ```
   Or manually:
   ```sql
   CREATE DATABASE shopify_orders;
   ```

3. **Install dependencies**:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

### 3. Start the Applications

#### Backend:
```bash
cd backend
npm start
```

#### Frontend:
```bash
cd frontend
npm run dev
```

## Troubleshooting 400 Bad Request Error

### Common Causes and Solutions

#### 1. Missing Environment Variables
**Error**: `Missing Shopify configuration. Please check your environment variables.`

**Solution**:
- Ensure `.env` files exist in both frontend and backend directories
- Verify `VITE_SHOPIFY_SHOP` and `VITE_SHOPIFY_ACCESS_TOKEN` are set in frontend/.env
- Restart the development server after adding environment variables

#### 2. Invalid Shopify Credentials
**Error**: `HTTP error! status: 400`

**Solution**:
- Verify your Shopify store URL format: `your-store.myshopify.com`
- Ensure your access token has the correct permissions
- Test your credentials with a simple curl request:
  ```bash
  curl -H "X-Shopify-Access-Token: your_token" \
       "https://your-store.myshopify.com/admin/api/2023-10/orders.json"
  ```

#### 3. Database Connection Issues
**Error**: Database connection failures

**Solution**:
- Check PostgreSQL is running: `pg_isready -h localhost`
- Verify database exists: `\l` in psql
- Check credentials in backend/.env
- Run database setup: `cd backend && npm run setup`

#### 4. CORS Issues
**Error**: CORS policy blocking requests

**Solution**:
- Ensure `FRONTEND_URL` in backend/.env matches your frontend URL
- Check the backend server logs for CORS errors
- Verify the backend is running on the expected port

### 4. Testing the Setup

#### Health Check
Test the backend is running:
```bash
curl http://localhost:3001/api/health
```

#### Test API Endpoint
Test with your actual credentials:
```bash
curl -H "shop: your-shop.myshopify.com" \
     -H "accessToken: your-access-token" \
     http://localhost:3001/api/orders/last-60-days
```

### 5. Getting Shopify Access Token

1. **Create a Private App**:
   - Go to Shopify Admin → Apps → Develop apps
   - Click "Create an app"
   - Go to "Configuration" tab
   - Enable Admin API access
   - Add these scopes:
     - `read_orders`
     - `read_customers`
     - `read_products`

2. **Get Access Token**:
   - After creating the app, go to "API credentials"
   - Copy the Admin API access token
   - Use this token in your `VITE_SHOPIFY_ACCESS_TOKEN`

### 6. Syncing Orders

To sync orders from Shopify:
```bash
curl -X POST \
  -H "shop: your-shop.myshopify.com" \
  -H "accessToken: your-access-token" \
  http://localhost:3001/api/sync/orders
```

## Development Tips

### Frontend Development
- Use `npm run dev` for hot reloading
- Environment variables must be prefixed with `VITE_`
- Restart dev server after changing .env files

### Backend Development
- Use `npm run dev` for nodemon
- Check logs for detailed error messages
- Database changes require restart

### Debugging
1. **Check browser console** for frontend errors
2. **Check backend logs** for API errors
3. **Use browser Network tab** to inspect API requests
4. **Test endpoints with curl** to isolate issues

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `Missing shop or access token` | Headers not sent | Check Dashboard.jsx configuration |
| `HTTP error! status: 400` | Invalid credentials | Verify shop URL and access token |
| `Database connection failed` | PostgreSQL not running | Start PostgreSQL service |
| `CORS error` | Mismatched URLs | Check FRONTEND_URL in backend/.env |

## Support

If you continue to experience issues:
1. Check the browser console for detailed error messages
2. Verify all environment variables are correctly set
3. Ensure PostgreSQL is running and accessible
4. Test API endpoints independently using curl or Postman
