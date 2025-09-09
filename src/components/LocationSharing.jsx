// src/components/LocationSharing.jsx
import React, { useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const LocationSharing = ({ isSharing, currentUser, onStarted, onStopped, onNewLocation }) => {
  const intervalRef = useRef(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!isSharing) return;
    // get permission & start sending location every 3 seconds
    let lastSent = null;

    const sendPosition = async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const payload = {
        username: currentUser.username,
        name: currentUser.name,
        latitude: Number(lat),
        longitude: Number(lon),
        timestamp: new Date().toISOString()
      };
      try {
        const res = await axios.post(`${API_BASE}/rider/location`, payload);
        if (onNewLocation) onNewLocation(payload);
      } catch (err) {
        console.error('Failed to send location', err);
      }
    };

    const success = (position) => {
      // send immediately then every 3s
      sendPosition(position);
      // interval sends current coordinates every 3s
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          navigator.geolocation.getCurrentPosition(sendPosition, err => {
            console.error('geolocation error:', err);
          }, { enableHighAccuracy: true, maximumAge: 1000 });
        }, 3000);
      }
    };

    const fail = (err) => console.error('geolocation failed:', err);

    // ask for permission and get initial
    navigator.geolocation.getCurrentPosition(success, fail, { enableHighAccuracy: true });

    // cleanup on stop
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [isSharing, currentUser, onNewLocation]);

  return (
    <div className="location-sharing">
      <h3>Location Sharing</h3>
      {!isSharing ? (
        <button onClick={onStarted} className="btn btn-primary">Start Sharing Location</button>
      ) : (
        <button onClick={onStopped} className="btn btn-secondary">Stop Sharing Location</button>
      )}
      {isSharing && <p className="status">Sharing your location every 3 seconds...</p>}
    </div>
  );
};

export default LocationSharing;
