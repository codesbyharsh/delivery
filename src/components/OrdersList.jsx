import React from 'react';
import OrderItem from './OrderItem';

const OrdersList = ({ orders, loading, selectedPincode, onAddToBucket, bucketList }) => {
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
        {orders.map(order => (
          <OrderItem 
            key={order._id} 
            order={order} 
            onAddToBucket={onAddToBucket}
            inBucket={bucketList.some(item => item._id === order._id)}
            showAddButton={true}
          />
        ))}
      </div>
    </div>
  );
};

export default OrdersList;