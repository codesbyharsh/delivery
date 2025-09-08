import React from 'react';

const PincodeSelector = ({ pincodes, selectedPincode, onPincodeChange }) => {
  return (
    <div className="pincode-selector">
      <label>Select Pincode: </label>
      <select
        value={selectedPincode}
        onChange={(e) => onPincodeChange(e.target.value)}
      >
        <option value="">Select a pincode</option>
        {pincodes.map(pincode => (
          <option key={pincode._id} value={pincode.pincode}>
            {pincode.pincode} - {pincode.city}, {pincode.taluka}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PincodeSelector;