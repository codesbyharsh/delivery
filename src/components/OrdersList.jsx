// src/components/OrdersList.jsx (updated)
import React from 'react';
import OrderItem from './OrderItem';

const OrdersList = ({ orders, loading, selectedPincode, onToggleBucket, bucketList }) => {
  if (loading) return <p className="loading-message">Loading orders...</p>;
  if (!selectedPincode) return <p className="info-message">Please select a pincode to view orders</p>;
  if (orders.length === 0) return (
    <div className="orders-section">
      <h2>Available Orders (Pincode: {selectedPincode})</h2>
      <p className="info-message">No orders found for this pincode. Orders will appear here when customers place orders with this pincode.</p>
    </div>
  );

  return (
    <div className="orders-section">
      <h2>Available Orders (Pincode: {selectedPincode}) - {orders.length} found</h2>
      <div className="orders-list">
        {orders.map(order => {
          const inBucket = bucketList.some(i => i._id === order._id) || order.inBucketList;
          return (
            <div key={order._id} className="order-item">
              <div className="order-header">
                <h4>Order #{order._id.slice(-6)}</h4>
                <span className="order-date">{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="order-details">
                <p><strong>Customer:</strong> {order.user?.name || 'N/A'} ({order.user?.mobile || '—'})</p>
                <p><strong>When:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                <p><strong>Items:</strong> {order.items.map(it => `${it.product?.name || 'Item'} x${it.quantity}`).join(', ')}</p>
                <p><strong>Total:</strong> ₹{order.totalAmount}</p>
                <p><strong>Address:</strong> {order.shippingAddress.addressLine1}, {order.shippingAddress.city}</p>
                <p><strong>Pincode:</strong> {order.shippingAddress.pincode}</p>
                <p><strong>Status:</strong> {order.orderStatus}</p>
                <p><strong>Payment:</strong> {order.paymentMethod} / {order.paymentStatus}</p>
              </div>
              <div className="order-actions">
                <button onClick={() => onToggleBucket(order)} className={`btn ${inBucket ? 'btn-secondary' : 'btn-primary'}`}>
                  {inBucket ? 'Remove from Bucket' : 'Add to Bucket'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersList;
