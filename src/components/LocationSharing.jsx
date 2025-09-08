import React from 'react';

const LocationSharing = ({ isSharing, onToggleSharing }) => {
  return (
    <div className="location-sharing">
      <h3>Location Sharing</h3>
      {!isSharing ? (
        <button onClick={onToggleSharing} className="btn btn-primary">
          Start Sharing Location
        </button>
      ) : (
        <button onClick={onToggleSharing} className="btn btn-secondary">
          Stop Sharing Location
        </button>
      )}
      {isSharing && <p className="status">Sharing your location...</p>}
    </div>
  );
};

export default LocationSharing;