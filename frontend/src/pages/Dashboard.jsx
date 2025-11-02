import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getItems, getTransactions } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, transactionsRes] = await Promise.all([
        getItems(),
        getTransactions()
      ]);

      const itemsData = itemsRes.data;
      setItems(itemsData);

      // Calculate stats
      setStats({
        total: itemsData.length,
        inStock: itemsData.filter(i => i.status === 'In Stock').length,
        lowStock: itemsData.filter(i => i.status === 'Low Stock' || i.status === 'Critical').length,
        outOfStock: itemsData.filter(i => i.status === 'Out of Stock').length
      });

      setRecentActivity(transactionsRes.data.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'In Stock', count: stats.inStock },
    { name: 'Low Stock', count: stats.lowStock },
    { name: 'Out of Stock', count: stats.outOfStock }
  ];

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <Link to="/add-item" className="btn btn-primary">Add New Item</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>Total Items</h3>
            <p className="stat-number">{stats.total}</p>
          </div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>In Stock</h3>
            <p className="stat-number">{stats.inStock}</p>
          </div>
        </div>
        <div className="stat-card stat-warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>Low Stock</h3>
            <p className="stat-number">{stats.lowStock}</p>
          </div>
        </div>
        <div className="stat-card stat-danger">
          <div className="stat-icon">❌</div>
          <div className="stat-info">
            <h3>Out of Stock</h3>
            <p className="stat-number">{stats.outOfStock}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="chart-container">
          <h2>Stock Status Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'add' ? '➕' : '➖'}
                  </div>
                  <div className="activity-details">
                    <p className="activity-title">{activity.itemName}</p>
                    <p className="activity-desc">
                      {activity.type === 'add' ? 'Added' : 'Removed'} {activity.quantity} units
                    </p>
                    <p className="activity-time">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-activity">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      <div className="alerts-section">
        <h2>Alerts</h2>
        <div className="alerts-list">
          {items.filter(item => item.status === 'Low Stock' || item.status === 'Critical').map(item => (
            <div key={item._id} className={`alert-item ${item.status === 'Critical' ? 'critical' : 'warning'}`}>
              <span className="alert-icon">⚠️</span>
              <div className="alert-content">
                <strong>{item.name}</strong>
                <p>{item.status} - Current quantity: {item.quantity}</p>
              </div>
              <Link to={`/item/${item._id}`} className="alert-action">View</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;