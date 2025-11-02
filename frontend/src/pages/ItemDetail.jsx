import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItem, updateItem, deleteItem } from '../services/api';
import QRCode from 'qrcode.react';
import './ItemDetail.css';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await getItem(id);
      setItem(response.data);
      setFormData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching item:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateItem(id, formData);
      setItem(formData);
      setEditing(false);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(id);
        navigate('/inventory');
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const downloadQR = () => {
    const canvas = document.getElementById('item-qr-code');
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${item.sku}-qr-code.png`;
    link.href = url;
    link.click();
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!item) return <div className="error">Item not found</div>;

  return (
    <div className="item-detail">
      <div className="detail-header">
        <h1>{item.name}</h1>
        <div className="header-actions">
          {!editing ? (
            <>
              <button onClick={() => setEditing(true)} className="btn btn-primary">
                Edit
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                Delete
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleUpdate} className="btn btn-primary">
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-main">
          {!editing ? (
            <div className="info-grid">
              <div className="info-item">
                <label>SKU</label>
                <span>{item.sku}</span>
              </div>
              <div className="info-item">
                <label>Name</label>
                <span>{item.name}</span>
              </div>
              <div className="info-item">
                <label>Description</label>
                <span>{item.description || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Quantity</label>
                <span className="quantity-badge">{item.quantity}</span>
              </div>
              <div className="info-item">
                <label>Location</label>
                <span>{item.location}</span>
              </div>
              <div className="info-item">
                <label>Status</label>
                <span className={`status-badge ${
                  item.status === 'In Stock' ? 'status-success' :
                  item.status === 'Low Stock' ? 'status-warning' :
                  'status-danger'
                }`}>
                  {item.status}
                </span>
              </div>
              <div className="info-item">
                <label>Reorder Point</label>
                <span>{item.reorderPoint}</span>
              </div>
              <div className="info-item">
                <label>Category</label>
                <span>{item.category || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Supplier</label>
                <span>{item.supplier || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Purchase Date</label>
                <span>{item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Expiry Date</label>
                <span>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Last Scanned</label>
                <span>{item.lastScanned ? new Date(item.lastScanned).toLocaleString() : 'Never'}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="edit-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>SKU</label>
                  <input type="text" name="sku" value={formData.sku} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} />
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea name="description" value={formData.description || ''} onChange={handleChange} rows="3" />
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Reorder Point</label>
                  <input type="number" name="reorderPoint" value={formData.reorderPoint} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input type="text" name="category" value={formData.category || ''} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Supplier</label>
                  <input type="text" name="supplier" value={formData.supplier || ''} onChange={handleChange} />
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="detail-sidebar">
          <div className="qr-section">
            <h3>QR Code</h3>
            <QRCode
              id="item-qr-code"
              value={JSON.stringify({ sku: item.sku, name: item.name, id: item._id })}
              size={200}
              level="H"
            />
            <button onClick={downloadQR} className="btn btn-secondary btn-block">
              Download QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
