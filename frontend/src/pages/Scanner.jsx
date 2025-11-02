import React, { useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { scanItem, updateItem } from '../services/api';
import './Scanner.css';

const Scanner = () => {
  const [scannedItem, setScannedItem] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [action, setAction] = useState('view');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');

  const startScanning = () => {
    setScanning(true);
    setMessage('');
    
    const scanner = new Html5QrcodeScanner('qr-reader', {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    });

    scanner.render(onScanSuccess, onScanError);

    function onScanSuccess(decodedText) {
      scanner.clear();
      setScanning(false);
      handleScan(decodedText);
    }

    function onScanError(err) {
      console.warn(err);
    }
  };

  const handleScan = async (data) => {
    try {
      const parsedData = JSON.parse(data);
      const response = await scanItem({
        sku: parsedData.sku,
        action: 'view'
      });
      setScannedItem(response.data);
      setMessage('Item scanned successfully!');
    } catch (error) {
      console.error('Error scanning item:', error);
      setMessage('Error scanning item. Please try again.');
    }
  };

  const handleUpdateQuantity = async () => {
    if (!scannedItem) return;

    try {
      let newQuantity = scannedItem.quantity;
      
      if (action === 'add') {
        newQuantity += parseInt(quantity);
      } else if (action === 'remove') {
        newQuantity -= parseInt(quantity);
      }

      await updateItem(scannedItem._id, { quantity: newQuantity });
      setMessage(`Successfully ${action}ed ${quantity} units!`);
      
      // Refresh item data
      const response = await scanItem({
        sku: scannedItem.sku,
        action: 'view'
      });
      setScannedItem(response.data);
    } catch (error) {
      console.error('Error updating quantity:', error);
      setMessage('Error updating quantity. Please try again.');
    }
  };

  return (
    <div className="scanner">
      <h1>QR Code Scanner</h1>

      {!scanning && !scannedItem && (
        <div className="scanner-start">
          <div className="scanner-icon">📷</div>
          <p>Ready to scan QR codes</p>
          <button onClick={startScanning} className="btn btn-primary btn-large">
            Start Scanner
          </button>
        </div>
      )}

      {scanning && (
        <div className="scanner-active">
          <div id="qr-reader"></div>
          <button onClick={() => setScanning(false)} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      )}

      {scannedItem && (
        <div className="scanned-result">
          <div className="result-card">
            <h2>Scanned Item Details</h2>
            <div className="item-details">
              <div className="detail-row">
                <span className="label">SKU:</span>
                <span className="value">{scannedItem.sku}</span>
              </div>
              <div className="detail-row">
                <span className="label">Name:</span>
                <span className="value">{scannedItem.name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Current Quantity:</span>
                <span className="value">{scannedItem.quantity}</span>
              </div>
              <div className="detail-row">
                <span className="label">Location:</span>
                <span className="value">{scannedItem.location}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className={`status-badge ${
                  scannedItem.status === 'In Stock' ? 'status-success' :
                  scannedItem.status === 'Low Stock' ? 'status-warning' :
                  'status-danger'
                }`}>
                  {scannedItem.status}
                </span>
              </div>
            </div>

            <div className="quantity-update">
              <h3>Update Quantity</h3>
              <div className="update-controls">
                <select 
                  value={action} 
                  onChange={(e) => setAction(e.target.value)}
                  className="action-select"
                >
                  <option value="view">View Only</option>
                  <option value="add">Add Stock</option>
                  <option value="remove">Remove Stock</option>
                </select>
                
                {action !== 'view' && (
                  <>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="quantity-input"
                    />
                    <button onClick={handleUpdateQuantity} className="btn btn-primary">
                      Update
                    </button>
                  </>
                )}
              </div>
            </div>

            {message && (
              <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}

            <button 
              onClick={() => {
                setScannedItem(null);
                setMessage('');
              }} 
              className="btn btn-secondary"
            >
              Scan Another Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;