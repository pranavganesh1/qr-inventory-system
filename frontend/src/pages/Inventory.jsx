import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getItems, deleteItem, searchItems } from '../services/api';
import './Inventory.css';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, filter, searchTerm]);

  const fetchItems = async () => {
    try {
      const response = await getItems();
      setItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    if (filter !== 'all') {
      filtered = filtered.filter(item => item.status === filter);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(id);
        fetchItems();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'In Stock': return 'status-success';
      case 'Low Stock': return 'status-warning';
      case 'Critical': return 'status-danger';
      case 'Out of Stock': return 'status-danger';
      default: return '';
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="inventory">
      <div className="inventory-header">
        <h1>Inventory Management</h1>
        <Link to="/add-item" className="btn btn-primary">Add New Item</Link>
      </div>

      <div className="inventory-controls">
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Critical">Critical</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
      </div>

      <div className="inventory-table">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Quantity</th>
              <th>Location</th>
              <th>Status</th>
              <th>Last Scanned</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item._id}>
                <td>{item.sku}</td>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.location}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  {item.lastScanned 
                    ? new Date(item.lastScanned).toLocaleDateString()
                    : 'Never'
                  }
                </td>
                <td className="actions">
                  <Link to={`/item/${item._id}`} className="btn-icon" title="View">
                    👁️
                  </Link>
                  <button 
                    onClick={() => handleDelete(item._id)} 
                    className="btn-icon" 
                    title="Delete"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredItems.length === 0 && (
          <p className="no-items">No items found</p>
        )}
      </div>
    </div>
  );
};

export default Inventory;