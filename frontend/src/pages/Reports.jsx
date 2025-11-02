import React, { useState, useEffect } from 'react';
import { getItems } from '../services/api';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import './Reports.css';

const Reports = () => {
  const [items, setItems] = useState([]);
  const [reportType, setReportType] = useState('stock');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getItems();
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const stockData = [
    { name: 'In Stock', value: items.filter(i => i.status === 'In Stock').length },
    { name: 'Low Stock', value: items.filter(i => i.status === 'Low Stock').length },
    { name: 'Critical', value: items.filter(i => i.status === 'Critical').length },
    { name: 'Out of Stock', value: items.filter(i => i.status === 'Out of Stock').length }
  ];

  const categoryData = items.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    const existing = acc.find(c => c.name === category);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ name: category, count: 1 });
    }
    return acc;
  }, []);

  const lowStockItems = items.filter(i => i.status === 'Low Stock' || i.status === 'Critical');

  const COLORS = ['#4F46E5', '#F59E0B', '#EF4444', '#6B7280'];

  const exportToCSV = () => {
    const headers = ['SKU', 'Name', 'Quantity', 'Location', 'Status', 'Category'];
    const rows = items.map(item => [
      item.sku,
      item.name,
      item.quantity,
      item.location,
      item.status,
      item.category || 'N/A'
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="reports">
      <div className="reports-header">
        <h1>Reports & Analytics</h1>
        <div className="header-actions">
          <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="report-select">
            <option value="stock">Stock Overview</option>
            <option value="low-stock">Low Stock Report</option>
            <option value="category">Category Analysis</option>
          </select>
          <button onClick={exportToCSV} className="btn btn-primary">
            Export CSV
          </button>
        </div>
      </div>

      {reportType === 'stock' && (
        <div className="report-content">
          <div className="chart-container">
            <h2>Stock Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stockData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stockData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="stats-summary">
            <h2>Summary Statistics</h2>
            <div className="summary-grid">
              <div className="summary-card">
                <h3>Total Items</h3>
                <p className="summary-value">{items.length}</p>
              </div>
              <div className="summary-card">
                <h3>Total Units</h3>
                <p className="summary-value">{items.reduce((sum, item) => sum + item.quantity, 0)}</p>
              </div>
              <div className="summary-card">
                <h3>Low Stock Alerts</h3>
                <p className="summary-value warning">{lowStockItems.length}</p>
              </div>
              <div className="summary-card">
                <h3>Categories</h3>
                <p className="summary-value">{categoryData.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportType === 'low-stock' && (
        <div className="report-content">
          <h2>Low Stock Items</h2>
          <div className="low-stock-table">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Current Qty</th>
                  <th>Reorder Point</th>
                  <th>Status</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map(item => (
                  <tr key={item._id}>
                    <td>{item.sku}</td>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.reorderPoint}</td>
                    <td>
                      <span className={`status-badge ${item.status === 'Critical' ? 'status-danger' : 'status-warning'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'category' && (
        <div className="report-content">
          <div className="chart-container">
            <h2>Items by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;