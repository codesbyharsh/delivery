// DeliveryPartnerApp.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// API base URL - adjust based on your backend
const API_BASE_URL = 'http://localhost:5000/api';

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
  const [loading, setLoading] = useState(false);

  // Predefined delivery partners (for demo purposes)
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

  // Login function
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

  // Logout function
  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setSelectedPincode('');
    setOrders([]);
    setBucketList([]);
    localStorage.removeItem('deliveryPartner');
    stopSharingLocation();
  };

  // Fetch pincodes from MongoDB
  const fetchPincodes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pincodes`);
      setPincodes(response.data);
    } catch (err) {
      console.error('Error fetching pincodes:', err);
      setError('Failed to fetch pincodes');
    }
  };

  // Start sharing location
  const startSharingLocation = () => {
    setIsSharingLocation(true);
    // In a real app, you would start tracking the user's location here
    console.log('Location sharing started');
  };

  // Stop sharing location
  const stopSharingLocation = () => {
    setIsSharingLocation(false);
    // In a real app, you would stop tracking the user's location here
    console.log('Location sharing stopped');
  };

  // Fetch orders based on selected pincode
  const fetchOrders = async () => {
    if (!selectedPincode) return;
    
    setLoading(true);
    try {
      // Fetch all orders and filter by pincode on the client side
      // In a production app, you'd want to implement server-side filtering
      const response = await axios.get(`${API_BASE_URL}/orders`);
      const filteredOrders = response.data.data.filter(order => 
        order.shippingAddress.pincode === selectedPincode
      );
      setOrders(filteredOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
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

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`${API_BASE_URL}/orders/${orderId}`, { orderStatus: status });
      
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

  // Check if user is logged in on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('deliveryPartner');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsLoggedIn(true);
      fetchPincodes();
    }
  }, []);

  // Fetch orders when pincode changes
  useEffect(() => {
    if (selectedPincode) {
      fetchOrders();
    }
  }, [selectedPincode]);

  // Login form
  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-form">
          <h2>Delivery Partner Login</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="btn btn-primary">Login</button>
          </form>
        </div>
      </div>
    );
  }

  // Main app after login
  return (
    <div className="delivery-app">
      <header className="app-header">
        <h1>Delivery Partner App</h1>
        <div className="user-info">
          <span>Welcome, {currentUser.name}</span>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </header>

      <div className="app-content">
        <div className="location-sharing">
          <h3>Location Sharing</h3>
          {!isSharingLocation ? (
            <button onClick={startSharingLocation} className="btn btn-primary">
              Start Sharing Location
            </button>
          ) : (
            <button onClick={stopSharingLocation} className="btn btn-secondary">
              Stop Sharing Location
            </button>
          )}
          {isSharingLocation && <p className="status">Sharing your location...</p>}
        </div>

        <div className="pincode-selector">
          <label>Select Pincode: </label>
          <select
            value={selectedPincode}
            onChange={(e) => setSelectedPincode(e.target.value)}
          >
            <option value="">Select a pincode</option>
            {pincodes.map(pincode => (
              <option key={pincode._id} value={pincode.pincode}>
                {pincode.pincode} - {pincode.city}, {pincode.taluka}
              </option>
            ))}
          </select>
        </div>

        <div className="orders-section">
          <h2>Available Orders ({selectedPincode ? `Pincode: ${selectedPincode}` : 'Select a pincode'})</h2>
          
          {loading && <p>Loading orders...</p>}
          
          {!loading && orders.length === 0 && selectedPincode && (
            <p>No orders found for this pincode</p>
          )}
          
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-item">
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
                  <button 
                    onClick={() => addToBucketList(order)}
                    disabled={bucketList.some(item => item._id === order._id)}
                    className="btn btn-primary"
                  >
                    Add to Bucket
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bucket-section">
          <h2>My Delivery Bucket ({bucketList.length} orders)</h2>
          
          {bucketList.length === 0 ? (
            <p>No orders in your bucket</p>
          ) : (
            <div className="bucket-list">
              {bucketList.map(order => (
                <div key={order._id} className="order-item">
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
                    <select
                      value={order.orderStatus}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="status-select"
                    >
                      <option value="Placed">Placed</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Queue for Tomorrow">Queue for Tomorrow</option>
                    </select>
                    <button 
                      onClick={() => removeFromBucketList(order._id)}
                      className="btn btn-secondary"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// CSS Styles for mobile-friendly design
const styles = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background-color: #f5f5f5;
    color: #333;
    line-height: 1.6;
  }
  
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
  }
  
  .login-form {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
  }
  
  .login-form h2 {
    margin-bottom: 20px;
    text-align: center;
    color: #2c3e50;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
  }
  
  .form-group input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
  }
  
  .error-message {
    color: #e74c3c;
    margin: 10px 0;
    padding: 10px;
    background-color: #fadbd8;
    border-radius: 4px;
    text-align: center;
  }
  
  .btn {
    padding: 12px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    transition: background-color 0.3s;
  }
  
  .btn-primary {
    background-color: #3498db;
    color: white;
  }
  
  .btn-primary:hover {
    background-color: #2980b9;
  }
  
  .btn-secondary {
    background-color: #95a5a6;
    color: white;
  }
  
  .btn-secondary:hover {
    background-color: #7f8c8d;
  }
  
  .btn:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
  }
  
  .delivery-app {
    max-width: 100%;
    overflow-x: hidden;
    min-height: 100vh;
    background-color: #f5f5f5;
  }
  
  .app-header {
    background-color: #2c3e50;
    color: white;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .app-header h1 {
    font-size: 1.5rem;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .app-content {
    padding: 20px;
    max-width: 1000px;
    margin: 0 auto;
  }
  
  .location-sharing, .pincode-selector {
    margin-bottom: 20px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .location-sharing h3, .pincode-selector label {
    margin-bottom: 10px;
    display: block;
    color: #2c3e50;
  }
  
  .status {
    margin-top: 10px;
    font-style: italic;
    color: #7f8c8d;
  }
  
  .pincode-selector select {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    width: 100%;
    max-width: 300px;
  }
  
  .orders-section, .bucket-section {
    margin-bottom: 30px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .orders-section h2, .bucket-section h2 {
    margin-bottom: 15px;
    color: #2c3e50;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }
  
  .order-item {
    background: #f9f9f9;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    border-left: 4px solid #3498db;
  }
  
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .order-header h4 {
    color: #2c3e50;
  }
  
  .order-date {
    color: #7f8c8d;
    font-size: 0.9em;
  }
  
  .order-details p {
    margin-bottom: 5px;
    font-size: 0.95em;
  }
  
  .order-actions {
    margin-top: 15px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  
  .status-select {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    flex-grow: 1;
  }
  
  @media (max-width: 768px) {
    .app-header {
      flex-direction: column;
      text-align: center;
    }
    
    .user-info {
      flex-direction: column;
    }
    
    .order-header {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .order-actions {
      flex-direction: column;
    }
    
    .btn {
      width: 100%;
    }
    
    .pincode-selector select {
      max-width: 100%;
    }
  }
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default DeliveryPartnerApp;