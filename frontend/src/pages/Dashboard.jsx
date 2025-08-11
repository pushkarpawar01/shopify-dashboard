import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const shop = import.meta.env.VITE_SHOPIFY_SHOP;
  const accessToken = import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!shop || !accessToken) {
          setError('Missing Shopify configuration');
          setLoading(false);
          return;
        }

        setLoading(true);
        const response = await api.getOrdersLast60Days(shop, accessToken);
        console.log('Fetched orders from backend:', response.data); // Added logging
        if (response.success) {
          setOrders(response.data);
        } else {
          setError(response.error || 'Failed to fetch orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Error fetching orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [shop, accessToken]);

  // Helper function to get product image
  const getProductImage = (order) => {
    if (order.items && order.items.length > 0 && order.items[0].image_url) {
      return order.items[0].image_url;
    }
    return 'https://via.placeholder.com/50x50?text=No+Image';
  };

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  if (loading) {
    return (
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-6 mx-auto my-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-6 mx-auto my-6">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Orders</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-6 mx-auto my-6">
      <div className="flex items-center space-x-3 bg-purple-600 rounded-lg p-4 mb-6">
        <div className="bg-purple-400 rounded p-2">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 2L12 8L18 2L22 6L16 12L22 18L18 22L12 16L6 22L2 18L8 12L2 6L6 2Z" />
          </svg>
        </div>
        <h1 className="text-white text-lg font-semibold">Orders from last 60 days</h1>
      </div>

      <div className="text-sm text-gray-500 mb-4">Total: {orders.length} orders</div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              There are no orders in the last 60 days. Try syncing orders or check your Shopify store.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <tr
                    key={order.order_id}
                    className="hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
                    onClick={() => window.location.href = `/orders/${order.order_id}`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      #{order.order_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{order.customer_name || 'Guest'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      ${order.total_price} {order.currency}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'PAID' || order.financial_status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'PENDING' || order.financial_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'CANCELLED' || order.financial_status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status === 'PAID' || order.financial_status === 'paid'
                          ? 'Paid'
                          : order.status === 'PENDING' || order.financial_status === 'pending'
                          ? 'Pending'
                          : order.status || order.financial_status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center mt-4 space-x-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === index + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;