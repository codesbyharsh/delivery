// src/components/BucketPage.jsx
import React from 'react';

const BucketPage = ({ orders, onUpdateStatus, onRemoveFromBucket }) => {
  return (
    <div className="bucket-section">
      <h2>My Delivery Bucket ({orders.length})</h2>
      {orders.length === 0 ? <p>No orders in your bucket</p> : (
        <div className="bucket-list">
          {orders.map(order => (
            <div key={order._id} className="order-item">
              <div className="order-header">
                <h4>Order #{order._id.slice(-6)}</h4>
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="order-details">
                <p><strong>Customer:</strong> {order.user?.name} / {order.user?.mobile}</p>
                <p><strong>Address:</strong> {order.shippingAddress.addressLine1}, {order.shippingAddress.city} ({order.shippingAddress.pincode})</p>
                <p><strong>Items:</strong> {order.items.map(i => `${i.product?.name || 'item'} x${i.quantity}`).join(', ')}</p>
                <p><strong>Status:</strong> {order.orderStatus}</p>
              </div>
              <div className="order-actions">
              <select value={order.orderStatus} onChange={(e) => onUpdateStatus(order._id, e.target.value)}>
                <option value="Order Placed">Order Placed</option>
                <option value="Packed / Processing">Packed / Processing</option>
                <option value="Shipped / Dispatched">Shipped / Dispatched</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>

                <button onClick={() => onRemoveFromBucket(order._id)} className="btn btn-secondary">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BucketPage;
