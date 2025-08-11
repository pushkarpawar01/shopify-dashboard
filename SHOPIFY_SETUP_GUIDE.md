# How to Get Shopify Credentials

## Getting Your Shopify Shop URL

Your shop URL is the domain of your Shopify store, usually in the format:
```
your-store-name.myshopify.com
```
You can find this by logging into your Shopify admin dashboard. The URL in your browser's address bar will contain your shop name.

## Creating a Private App and Getting Access Token

1. Log in to your Shopify admin panel.
2. Navigate to **Apps** in the sidebar.
3. Scroll down and click **Develop apps** (or **Manage private apps** if using older Shopify versions).
4. Click **Create an app**.
5. Enter an app name and assign yourself as the developer.
6. Go to the **Configuration** tab.
7. Under **Admin API integration**, click **Configure**.
8. Add the following access scopes:
   - `read_orders`
   - `read_customers`
   - `read_products`
9. Save the configuration.
10. Go to the **API credentials** tab.
11. Click **Install app** if not already installed.
12. Copy the **Admin API access token**.

## Using the Credentials

- Set the environment variables in your frontend `.env` file:
  ```
  VITE_SHOPIFY_SHOP=your-store-name.myshopify.com
  VITE_SHOPIFY_ACCESS_TOKEN=your-access-token
  ```
- Restart your frontend development server to apply the changes.

## Testing the Credentials

You can test your access token with a curl command:
```bash
curl -H "X-Shopify-Access-Token: your-access-token" \
     "https://your-store-name.myshopify.com/admin/api/2023-10/orders.json"
```

If you get a valid JSON response, your credentials are correct.

---

If you need further assistance, please refer to the official Shopify documentation:  
https://shopify.dev/apps/auth/admin-app-access-tokens
