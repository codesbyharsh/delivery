import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import LocationSharing from './LocationSharing';
import PincodeSelector from './PincodeSelector';
import OrdersList from './OrdersList';
import BucketList from './BucketList';
import axios from 'axios';
import './Dashboard.css';

const API_BASE_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [selectedPincode, setSelectedPincode] = useState('');
  const [pincodes, setPincodes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bucketList, setBucketList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch pincodes from backend
  const fetchPincodes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pincodes`);
      setPincodes(response.data);
    } catch (err) {
      console.error('Error fetching pincodes:', err);
      setError('Failed to fetch pincodes');
    }
  };

  // Fetch orders based on selected pincode
  const fetchOrders = async () => {
    if (!selectedPincode) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/available/${selectedPincode}`);
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.post(`${API_BASE_URL}/orders/${orderId}/status`, { 
        status, 
        rider: currentUser.username 
      });
      
      // Update local state
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, orderStatus: status } : order
      ));
      
      setBucketList(bucketList.map(order => 
        order._id === orderId ? { ...order, orderStatus: status } : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status');
    }
  };

  // Add order to bucket list
  const addToBucketList = (order) => {
    if (!bucketList.find(item => item._id === order._id)) {
      setBucketList([...bucketList, order]);
    }
  };

  // Remove order from bucket list
  const removeFromBucketList = (orderId) => {
    setBucketList(bucketList.filter(item => item._id !== orderId));
  };

  useEffect(() => {
    fetchPincodes();
  }, []);

  useEffect(() => {
    if (selectedPincode) {
      fetchOrders();
    }
  }, [selectedPincode]);

  return (
    <div className="dashboard">
      <Header user={currentUser} onLogout={logout} />
      
      <div className="dashboard-content">
        <LocationSharing 
          isSharing={isSharingLocation} 
          onToggleSharing={() => setIsSharingLocation(!isSharingLocation)} 
        />
        
        <PincodeSelector 
          pincodes={pincodes} 
          selectedPincode={selectedPincode} 
          onPincodeChange={setSelectedPincode} 
        />
        
        <div className="orders-container">
          <OrdersList 
            orders={orders} 
            loading={loading}
            selectedPincode={selectedPincode}
            onAddToBucket={addToBucketList}
            bucketList={bucketList}
          />
          
          <BucketList 
            orders={bucketList}
            onUpdateStatus={updateOrderStatus}
            onRemoveFromBucket={removeFromBucketList}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;