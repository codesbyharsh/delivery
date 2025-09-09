// src/DeliveryPartnerApp.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const DELIVERY_PARTNERS = [
  { id: 1, username: 'rider1', password: 'pass1', name: 'Raj Sharma' },
  { id: 2, username: 'rider2', password: 'pass2', name: 'Vikram Singh' },
  { id: 3, username: 'rider3', password: 'pass3', name: 'Sunil Kumar' },
  { id: 4, username: 'rider4', password: 'pass4', name: 'Ankit Patel' },
  { id: 5, username: 'rider5', password: 'pass5', name: 'Mohan Das' },
  { id: 6, username: 'rider6', password: 'pass6', name: 'Suresh Nair' },
  { id: 7, username: 'rider7', password: 'pass7', name: 'Rahul Mehta' },
  { id: 8, username: 'rider8', password: 'pass8', name: 'Amit Verma' },
  { id: 9, username: 'rider9', password: 'pass9', name: 'Nitin Joshi' },
  { id: 10, username: 'rider10', password: 'pass10', name: 'Prakash Gupta' }
];

const DeliveryPartnerApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [selectedPincode, setSelectedPincode] = useState('');
  const [pincodes, setPincodes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bucketList, setBucketList] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('orders'); // 'orders' | 'bucket' | 'completed'
  const watchIdRef = useRef(null);
  const locationIntervalRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('deliveryPartner');
    if (saved) {
      const u = JSON.parse(saved);
      setCurrentUser(u);
      setIsLoggedIn(true);
      fetchPincodes();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    const user = DELIVERY_PARTNERS.find(
      partner => partner.username === username && partner.password === password
    );
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      localStorage.setItem('deliveryPartner', JSON.stringify(user));
      fetchPincodes();
    } else {
      setError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    stopSharingLocation();
    setCurrentUser(null);
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setSelectedPincode('');
    setOrders([]);
    setBucketList([]);
    setCompletedOrders([]);
    localStorage.removeItem('deliveryPartner');
  };

  const fetchPincodes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pincodes`);
      const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setPincodes(data);
    } catch (err) {
      console.error('Error fetching pincodes:', err);
      setError('Failed to fetch pincodes');
    }
  };

  const fetchOrders = async () => {
    if (!selectedPincode) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/available/${selectedPincode}`);
      const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPincode) fetchOrders();
  }, [selectedPincode]);

  // toggle add/remove for bucket list
  const toggleBucket = (order) => {
    const exists = bucketList.some(i => i._id === order._id);
    if (exists) {
      setBucketList(prev => prev.filter(i => i._id !== order._id));
    } else {
      setBucketList(prev => [...prev, order]);
    }
  };

  // update order status; if Delivered -> move to completedOrders and remove from others
  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.post(`${API_BASE_URL}/orders/${orderId}/status`, {
        status,
        rider: currentUser?.username || currentUser?.name || 'unknown'
      });

      // update local lists
      if (status === 'Delivered') {
        // remove from orders and bucket, add to completed
        setOrders(prev => prev.filter(o => o._id !== orderId));
        const completedItem = orders.find(o => o._id === orderId) || bucketList.find(o => o._id === orderId);
        if (completedItem) {
          setCompletedOrders(prev => [{ ...completedItem, orderStatus: 'Delivered' }, ...prev]);
        }
        setBucketList(prev => prev.filter(i => i._id !== orderId));
      } else {
        // update status in orders & bucket
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: status } : o));
        setBucketList(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: status } : o));
      }

      alert('Status updated');
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status');
    }
  };

  // Location sharing helpers
  const startSharingLocation = async () => {
    setError('');
    if (!currentUser) { setError('Login first to share location'); return; }
    if (!('geolocation' in navigator)) { setError('Geolocation not supported'); return; }

    try {
      // check permission (optional)
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const p = await navigator.permissions.query({ name: 'geolocation' });
          if (p.state === 'denied') {
            setError('Location permission denied. Allow location in browser settings.');
            return;
          }
        } catch (permErr) {
          // ignore permission check errors and proceed to request position
        }
      }

      // attempt watchPosition
      const watchId = navigator.geolocation.watchPosition(async (pos) => {
        try {
          await axios.post(`${API_BASE_URL}/rider/location`, {
            username: currentUser.username,
            latitude: parseFloat(pos.coords.latitude),
            longitude: parseFloat(pos.coords.longitude),
            timestamp: new Date().toISOString()
          });
          // optional: console.log('Location posted', pos.coords);
        } catch (err) {
          console.error('Error posting location:', err);
        }
      }, async (err) => {
        console.error('watchPosition error:', err);
        // fallback: attempt single-shot getCurrentPosition every 10s
        // only set fallback if user hasn't stopped sharing
        if (!watchIdRef.current && isSharingLocation) return;
      }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 });

      watchIdRef.current = watchId;
      setIsSharingLocation(true);

      // As extra fallback for environments where watchPosition isn't reliable,
      // also push a location every 12s using getCurrentPosition:
      locationIntervalRef.current = setInterval(async () => {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          try {
            await axios.post(`${API_BASE_URL}/rider/location`, {
              username: currentUser.username,
              latitude: parseFloat(pos.coords.latitude),
              longitude: parseFloat(pos.coords.longitude),
              timestamp: new Date().toISOString()
            });
          } catch (err) {
            console.error('Error posting fallback location:', err);
          }
        }, (e) => {
          console.error('getCurrentPosition fallback error:', e);
        }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 });
      }, 12_000);

      alert('Started sharing location — allow browser location permission if prompted.');
    } catch (err) {
      console.error('Error starting location sharing:', err);
      setError('Unable to start location sharing');
    }
  };

  const stopSharingLocation = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
    setIsSharingLocation(false);
    alert('Stopped sharing location');
  };

  // UI helpers
  const goToOrders = () => setView('orders');
  const goToBucket = () => setView('bucket');
  const goToCompleted = () => setView('completed');

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-form">
          <h2>Delivery Partner Login</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button className="btn btn-primary" type="submit">Login</button>
          </form>
        </div>
      </div>
    );
  }

  // Orders view
  const OrdersView = (
    <div className="orders-section">
      <h2>Available Orders ({selectedPincode ? `Pincode: ${selectedPincode}` : 'Select a pincode'})</h2>
      <div style={{ marginBottom: 12 }}>
        <label>Select Pincode:&nbsp;</label>
        <select value={selectedPincode} onChange={(e) => setSelectedPincode(e.target.value)}>
          <option value="">Select a pincode</option>
          {pincodes.map(p => <option key={p._id} value={p.pincode}>{p.pincode} - {p.city}</option>)}
        </select>
        <button style={{ marginLeft: 8 }} onClick={fetchOrders} className="btn btn-primary">Refresh Orders</button>
      </div>

      {loading && <p>Loading orders...</p>}
      {!loading && selectedPincode && orders.length === 0 && <p>No orders for this pincode.</p>}

      {orders.map(order => (
        <div key={order._id} className="order-item" style={{ marginBottom: 10 }}>
          <div className="order-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h4>Order #{order._id.slice(-6)}</h4>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="order-details">
            <p><strong>Customer:</strong> {order.user?.name || 'N/A'}</p>
            <p><strong>Items:</strong> {order.items.length}</p>
            <p><strong>Total:</strong> ₹{order.totalAmount}</p>
            <p><strong>Address:</strong> {order.shippingAddress.addressLine1}, {order.shippingAddress.city}</p>
            <p><strong>Pincode:</strong> {order.shippingAddress.pincode}</p>
            <p><strong>Status:</strong> {order.orderStatus}</p>
          </div>
          <div className="order-actions" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              onClick={() => toggleBucket(order)}
              className="btn"
              style={{ backgroundColor: bucketList.some(i => i._id === order._id) ? '#e74c3c' : '#3498db', color: 'white' }}
            >
              {bucketList.some(i => i._id === order._id) ? 'Remove from Bucket' : 'Add to Bucket'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  // Bucket view (separate page)
  const BucketView = (
    <div className="bucket-section">
      <h2>My Delivery Bucket ({bucketList.length})</h2>
      {bucketList.length === 0 ? <p>No orders in your bucket</p> : (
        <div className="bucket-list">
          {bucketList.map(order => (
            <div key={order._id} className="order-item" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h4>Order #{order._id.slice(-6)}</h4>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <p><strong>Customer:</strong> {order.user?.name || 'N/A'}</p>
                <p><strong>Items:</strong> {order.items.length}</p>
                <p><strong>Total:</strong> ₹{order.totalAmount}</p>
                <p><strong>Address:</strong> {order.shippingAddress.addressLine1}, {order.shippingAddress.city}</p>
                <p><strong>Pincode:</strong> {order.shippingAddress.pincode}</p>
                <p><strong>Status:</strong> {order.orderStatus}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <select value={order.orderStatus} onChange={(e) => updateOrderStatus(order._id, e.target.value)}>
                  <option value="Placed">Placed</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Queue for Tomorrow">Queue for Tomorrow</option>
                </select>
                <button onClick={() => toggleBucket(order)} className="btn btn-secondary">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Completed orders view
  const CompletedView = (
    <div className="completed-section">
      <h2>Completed Deliveries ({completedOrders.length})</h2>
      {completedOrders.length === 0 ? <p>No completed deliveries yet.</p> : (
        <div className="completed-list">
          {completedOrders.map(order => (
            <div key={order._id} className="order-item" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h4>Order #{order._id.slice(-6)}</h4>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <p><strong>Customer:</strong> {order.user?.name || 'N/A'}</p>
                <p><strong>Total:</strong> ₹{order.totalAmount}</p>
                <p><strong>Pincode:</strong> {order.shippingAddress.pincode}</p>
                <p><strong>Delivered At:</strong> {order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="delivery-app">
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>Delivery Partner App</h1>
          <button className="btn" onClick={goToOrders}>Orders</button>
          <button className="btn" onClick={goToBucket}>Bucket</button>
          <button className="btn" onClick={goToCompleted}>Completed</button>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span>Welcome, {currentUser.name}</span>
          {!isSharingLocation ? (
            <button className="btn btn-primary" onClick={startSharingLocation}>Start Sharing Location</button>
          ) : (
            <button className="btn btn-secondary" onClick={stopSharingLocation}>Stop Sharing Location</button>
          )}
          <button onClick={handleLogout} className="btn btn-danger">Logout</button>
        </div>
      </header>

      <main style={{ padding: 16 }}>
        {error && <div className="error-message" style={{ marginBottom: 12 }}>{error}</div>}
        {view === 'orders' && OrdersView}
        {view === 'bucket' && BucketView}
        {view === 'completed' && CompletedView}
      </main>
    </div>
  );
};

export default DeliveryPartnerApp;
