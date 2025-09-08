import React from 'react';
import OrderItem from './OrderItem';

const BucketList = ({ orders, onUpdateStatus, onRemoveFromBucket }) => {
  if (orders.length === 0) return <p>No orders in your bucket</p>;

  return (
    <div className="bucket-section">
      <h2>My Delivery Bucket ({orders.length} orders)</h2>
      <div className="bucket-list">
        {orders.map(order => (
          <OrderItem 
            key={order._id} 
            order={order} 
            onUpdateStatus={onUpdateStatus}
            onRemoveFromBucket={onRemoveFromBucket}
            showStatusSelector={true}
            showRemoveButton={true}
          />
        ))}
      </div>
    </div>
  );
};

export default BucketList;