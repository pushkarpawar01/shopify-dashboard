import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const OrderDetails = () => {
  const { orderId } = useParams();
  const shop = import.meta.env.VITE_SHOPIFY_SHOP;
  const accessToken = import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await api.getOrderById(orderId, shop, accessToken);
        if (response.success) {
          setOrder(response.data);
        } else {
          setError('Failed to fetch order details');
        }
      } catch (err) {
        setError(err.message || 'Error fetching order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId && shop && accessToken) {
      fetchOrder();
    }
  }, [orderId, shop, accessToken]);

  if (loading) return <div>Loading order details...</div>;
  if (error) return <div>Error: {error}</div>;

  if (!order) return <div>No order found</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Order Details</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Order #{order.order_id}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-bold mb-2">Order Info</h3>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total Price:</strong> {order.total_price} {order.currency}</p>
            <p><strong>Customer:</strong> {order.customer_name}</p>
            <p><strong>Email:</strong> {order.customer_email}</p>
            <p><strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}</p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Items</h3>
            {order.items && order.items.length > 0 ? (
              <ul>
                {order.items.map(item => (
                  <li key={item.line_item_id} className="mb-2 flex items-center">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.title} className="w-16 h-16 object-cover mr-4" />
                    )}
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: {item.price}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No items found for this order.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
