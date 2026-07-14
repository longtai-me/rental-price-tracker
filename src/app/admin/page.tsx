'use client';

import { useState, useEffect } from 'react';
import './admin.css';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/rentals', {
        headers: {
          'Authorization': `Bearer ${password}`
        }
      });
      const data = await res.json() as any;
      if (res.ok) {
        setRentals(data.data || []);
      } else {
        alert(`錯誤: ${data.error || 'Authentication failed or error fetching rentals'}`);
        setIsAuthenticated(false);
      }
    } catch (e: any) {
      alert(`連線錯誤: ${e.message}`);
      console.error(e);
    }
    setLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
    fetchRentals();
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch('/api/admin/rentals', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`
        },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        alert('Rental approved!');
        fetchRentals();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to reject and delete this rental?')) return;
    try {
      const res = await fetch('/api/admin/rentals', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`
        },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        alert('Rental rejected!');
        fetchRentals();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-container">
        <div className="glass-panel login-container animate-fade-in">
          <h2>Admin Login</h2>
          <form className="login-form" onSubmit={handleLogin}>
            <div>
              <input
                type="password"
                required
                className="input-field"
                style={{ width: '100%' }}
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary">
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container animate-fade-in">
      <div className="admin-header">
        <h1>待審核租屋物件</h1>
        <button 
          onClick={() => fetchRentals()}
          className="btn-secondary"
        >
          重新整理
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>載入中...</p>
      ) : rentals.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          目前沒有等待審核的物件。
        </div>
      ) : (
        <div className="rental-grid">
          {rentals.map((rental) => (
            <div key={rental.id} className="glass-panel rental-card animate-fade-in">
              <div className="rental-card-content">
                <h3>{rental.city}{rental.district} - {rental.type}</h3>
                <p className="address">{rental.address}</p>
                
                <div className="rental-details">
                  <p><span>租金:</span> NT$ {rental.price} /月</p>
                  <p><span>格局:</span> {rental.layout}</p>
                  <p><span>坪數:</span> {rental.area} 坪</p>
                  <p><span>樓層:</span> {rental.floor}</p>
                </div>
                <div className="rental-date">
                  提交時間: {new Date(rental.createdAt).toLocaleString()}
                </div>
              </div>
              
              <div className="rental-actions">
                <button
                  onClick={() => handleApprove(rental.id)}
                  className="btn-approve"
                >
                  核准 (Approve)
                </button>
                <button
                  onClick={() => handleDelete(rental.id)}
                  className="btn-reject"
                >
                  拒絕 (Reject)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
