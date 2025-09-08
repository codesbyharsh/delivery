import React from 'react';
import OrderItem from './OrderItem';

const OrdersList = ({ orders, loading, selectedPincode, onAddToBucket, bucketList }) => {
  if (loading) return <p>Loading orders...</p>;
  
  if (!selectedPincode) return <p>Please select a pincode to view orders</p>;
  
  if (orders.length === 0) return <p>No orders found for this pincode</p>;

  return (
    <div className="orders-section">
      <h2>Available Orders (Pincode: {selectedPincode})</h2>
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