import React from 'react';

const Header = ({ user, onLogout }) => {
  return (
    <header className="app-header">
      <h1>Delivery Partner App</h1>
      <div className="user-info">
        <span>Welcome, {user.name}</span>
        <button onClick={onLogout} className="btn btn-secondary">Logout</button>
      </div>
    </header>
  );
};

export default Header;