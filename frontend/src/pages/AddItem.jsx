import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem } from '../services/api';
import QRCode from 'qrcode.react';
import './AddItem.css';

const AddItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    quantity: 0,
    location: '',
    reorderPoint: 10,
    supplier: '',
    category: '',
    purchaseDate: '',
    expiryDate: ''
  });
  const [qrData, setQrData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Generate QR preview
    if (name === 'sku' || name === 'name') {
      setQrData(JSON.stringify({
        sku: name === 'sku' ? value : formData.sku,
        name: name === 'name' ? value : formData.name
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createItem(formData);
      navigate('/inventory');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating item');
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const canvas = document.getElementById('qr-code');
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${formData.sku}-qr-code.png`;
    link.href = url;
    link.click();
  };

  return (
    <div className="add-item">
      <h1>Add New Item</h1>
      
      <div className="add-item-container">
        <form onSubmit={handleSubmit} className="item-form">
          <div className="form-grid">
            <div className="form-group">
              <label>SKU *</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
                placeholder="e.g., MTR-001"
              />
            </div>

            <div className="form-group">
              <label>Item Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Motor Part A"
              />
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Item description..."
              />
            </div>

            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g., Shelf A-1"
              />
            </div>

            <div className="form-group">
              <label>Reorder Point</label>
              <input
                type="number"
                name="reorderPoint"
                value={formData.reorderPoint}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Electronics"
              />
            </div>

            <div className="form-group">
              <label>Supplier</label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                placeholder="Supplier name"
              />
            </div>

            <div className="form-group">
              <label>Purchase Date</label>
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Expiry Date</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/inventory')} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Creating...' : 'Create Item'}
            </button>
          </div>
        </form>

        <div className="qr-preview">
          <h3>QR Code Preview</h3>
          {qrData ? (
            <>
              <QRCode id="qr-code" value={qrData} size={200} level="H" />
              <button onClick={downloadQR} className="btn btn-secondary btn-small">
                Download QR Code
              </button>
            </>
          ) : (
            <div className="qr-placeholder">
              <p>Fill SKU and Name to generate QR code</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddItem;