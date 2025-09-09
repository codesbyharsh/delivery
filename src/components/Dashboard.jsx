// src/components/Dashboard.jsx - top imports
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import LocationSharing from './LocationSharing';
import PincodeSelector from './PincodeSelector';
import OrdersList from './OrdersList';
import BucketPage from './BucketPage'; // new page component
import './Dashboard.css';

const API_BASE_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [selectedPincode, setSelectedPincode] = useState('');
  const [pincodes, setPincodes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bucketList, setBucketList] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState('orders'); // 'orders' | 'bucket' | 'completed'
  const [lastLocation, setLastLocation] = useState(null);

  useEffect(() => {
    fetchPincodes();
    // if you have saved bucket list for rider, fetch it here (optional)
  }, []);

  const fetchPincodes = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/pincodes`);
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setPincodes(data);
    } catch (err) { console.error(err); setError('Failed to fetch pincodes'); }
  };

  const fetchOrders = async () => {
    if (!selectedPincode) return;
    setLoading(true); setError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/orders/available/${selectedPincode}`);
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders. Please try again.');
      setOrders([]);
    } finally { setLoading(false); }
  };

  // call when pincode changes
  useEffect(() => { if (selectedPincode) fetchOrders(); }, [selectedPincode]);

  // start/stop sharing handlers passed to LocationSharing
  const handleStartLocation = () => setIsSharingLocation(true);
  const handleStopLocation = () => setIsSharingLocation(false);

  // called by LocationSharing every time a new location is successfully posted
  const handleNewLocation = (payload) => {
    setLastLocation(payload);
    console.log('Location stored:', payload);
  };

  // toggle bucket: tries server add/remove endpoints
  const toggleBucketForOrder = async (order) => {
    try {
      const exists = bucketList.some(o => o._id === order._id);
      if (exists) {
        // remove from bucket
        await axios.post(`${API_BASE_URL}/delivery/bucket/${order._id}/remove`, { riderId: currentUser._id });
        setBucketList(prev => prev.filter(i => i._id !== order._id));
      } else {
        // add to bucket
        await axios.post(`${API_BASE_URL}/delivery/bucket/${order._id}/add`, { riderId: currentUser._id });
        setBucketList(prev => [...prev, order]);
      }
      // update orders array locally to reflect inBucketList
      setOrders(prev => prev.map(o => o._id === order._id ? { ...o, inBucketList: !exists } : o));
    } catch (err) {
      console.error('Failed toggling bucket', err);
      setError('Failed to update bucket. Try again.');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.post(`${API_BASE_URL}/orders/${orderId}/status`, { status, rider: currentUser.username });
      if (status === 'Delivered') {
        // remove from lists and add to completed
        setOrders(prev => prev.filter(o => o._id !== orderId));
        setBucketList(prev => prev.filter(o => o._id !== orderId));
        // For simplicity, fetch the updated order and add to completed
        const res = await axios.get(`${API_BASE_URL}/orders/${orderId}`); // optional: add GET /orders/:id if not present
        if (res.data) setCompletedOrders(prev => [...prev, res.data]);
      } else {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: status } : o));
        setBucketList(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: status } : o));
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status');
    }
  };

  return (
    <div className="dashboard">
      <Header user={currentUser} onLogout={logout}/>
      <div className="dashboard-content">
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button onClick={() => setView('orders')} className="btn">Orders</button>
          <button onClick={() => setView('bucket')} className="btn">My Bucket ({bucketList.length})</button>
          <button onClick={() => setView('completed')} className="btn">Completed ({completedOrders.length})</button>
        </div>

        <LocationSharing
          isSharing={isSharingLocation}
          currentUser={currentUser}
          onStarted={handleStartLocation}
          onStopped={handleStopLocation}
          onNewLocation={handleNewLocation}
        />

        <PincodeSelector pincodes={pincodes} selectedPincode={selectedPincode} onPincodeChange={setSelectedPincode} />

        {error && <div className="error-message">{error}</div>}

        {view === 'orders' && (
          <OrdersList
            orders={orders}
            loading={loading}
            selectedPincode={selectedPincode}
            onToggleBucket={toggleBucketForOrder}
            onAddToBucket={(o) => toggleBucketForOrder(o)}
            bucketList={bucketList}
          />
        )}

        {view === 'bucket' && (
          <BucketPage
            orders={bucketList}
            onUpdateStatus={updateOrderStatus}
            onRemoveFromBucket={(orderId) => toggleBucketForOrder({ _id: orderId })}
          />
        )}

        {view === 'completed' && (
          <div>
            <h2>Completed Orders</h2>
            {completedOrders.map(o => <div key={o._id}>Order #{o._id.slice(-6)} — Delivered</div>)}
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
