import React from 'react';

const OrderItem = ({ 
  order, 
  onAddToBucket, 
  onUpdateStatus, 
  onRemoveFromBucket, 
  inBucket = false, 
  showAddButton = false,
  showStatusSelector = false,
  showRemoveButton = false 
}) => {
  return (
    <div className="order-item">
      <div className="order-header">
        <h4>Order #{order._id.slice(-6)}</h4>
        <span className="order-date">
          {new Date(order.createdAt).toLocaleDateString()}
        </span>
      </div>
      <div className="order-details">
        <p><strong>Customer:</strong> {order.user?.name || 'N/A'}</p>
        <p><strong>Items:</strong> {order.items.length} items</p>
        <p><strong>Total:</strong> ₹{order.totalAmount}</p>
        <p><strong>Address:</strong> {order.shippingAddress.addressLine1}, {order.shippingAddress.city}</p>
        <p><strong>Pincode:</strong> {order.shippingAddress.pincode}</p>
        <p><strong>Status:</strong> {order.orderStatus}</p>
      </div>
      <div className="order-actions">
        {showAddButton && (
          <button 
            onClick={() => onAddToBucket(order)}
            disabled={inBucket}
            className="btn btn-primary"
          >
            Add to Bucket
          </button>
        )}
        
        {showStatusSelector && (
          <select
            value={order.orderStatus}
            onChange={(e) => onUpdateStatus(order._id, e.target.value)}
            className="status-select"
          >
            <option value="Placed">Placed</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Queue for Tomorrow">Queue for Tomorrow</option>
          </select>
        )}
        
        {showRemoveButton && (
          <button 
            onClick={() => onRemoveFromBucket(order._id)}
            className="btn btn-secondary"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderItem;