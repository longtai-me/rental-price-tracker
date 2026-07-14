'use client';

import { useState, useEffect } from 'react';
import './admin.css';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'archived'>('pending');

  const fetchRentals = async (token = password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/rentals', {
        headers: {
          'Authorization': `Bearer ${token}`
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
    fetchRentals(password);
  };

  const executeAction = async (method: string, body: any, token: string) => {
    return fetch('/api/admin/rentals', {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
  };

  const handleAction = async (id: string, action: string, method: string = 'PATCH') => {
    let currentToken = password;
    let res = await executeAction(method, { id, action }, currentToken);

    // If forbidden, ask for the correct password
    if (res.status === 403) {
      const promptText = method === 'DELETE' ? '完全刪除需要超級管理員密碼，請輸入：' : '此操作需要進階密碼，請輸入：';
      const newToken = prompt(promptText);
      if (!newToken) return; // User cancelled
      currentToken = newToken;
      res = await executeAction(method, { id, action }, currentToken);
    }

    const data = await res.json() as any;
    if (res.ok) {
      alert('操作成功！');
      fetchRentals(password);
    } else {
      alert(`錯誤: ${data.error || '操作失敗'}`);
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
                placeholder="輸入任何管理員密碼"
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

  const pendingRentals = rentals.filter(r => r.approved === 0);
  const publishedRentals = rentals.filter(r => r.approved === 1);
  const archivedRentals = rentals.filter(r => r.approved === -1);

  const renderRentals = (list: any[], tab: string) => {
    if (loading) return <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>載入中...</p>;
    if (list.length === 0) return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        目前沒有符合條件的物件。
      </div>
    );

    return (
      <div className="rental-grid">
        {list.map((rental) => (
          <div key={rental.id} className="glass-panel rental-card animate-fade-in">
            <div className="rental-card-content">
              <h3>{rental.city}{rental.district} - {rental.type}</h3>
              <p className="address">{rental.address}</p>
              
              <div className="rental-details">
                <p><span>租金:</span> NT$ {rental.price} /月</p>
                <p><span>格局:</span> {rental.layout}</p>
                <p><span>坪數:</span> {rental.area} 坪</p>
                <p><span>樓層:</span> {rental.floor}</p>
                {rental.contractFile && (
                  <p>
                    <a href={`/api/contracts/${rental.contractFile}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>
                      🔗 查看契約書附件
                    </a>
                  </p>
                )}
              </div>
              <div className="rental-date">
                提交時間: {new Date(rental.createdAt).toLocaleString()}
              </div>
            </div>
            
            <div className="rental-actions">
              {tab === 'pending' && (
                <>
                  <button onClick={() => handleAction(rental.id, 'approve')} className="btn-approve">
                    核准上架
                  </button>
                  <button onClick={() => handleAction(rental.id, 'reject')} className="btn-reject">
                    拒絕 (封存)
                  </button>
                </>
              )}
              {tab === 'published' && (
                <button onClick={() => handleAction(rental.id, 'remove')} className="btn-remove">
                  下架移除
                </button>
              )}
              {tab === 'archived' && (
                <button onClick={() => handleAction(rental.id, 'unarchive')} className="btn-approve">
                  撤銷封存/重新審核
                </button>
              )}
              <button onClick={() => {
                if(confirm('警告：這是永久刪除操作，無法復原。是否繼續？')) {
                  handleAction(rental.id, 'delete', 'DELETE');
                }
              }} className="btn-hard-delete">
                完全刪除
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="admin-container animate-fade-in">
      <div className="admin-header">
        <h1>後台管理系統</h1>
        <button 
          onClick={() => fetchRentals(password)}
          className="btn-secondary"
        >
          重新整理
        </button>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          待審核 ({pendingRentals.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'published' ? 'active' : ''}`}
          onClick={() => setActiveTab('published')}
        >
          已上架 ({publishedRentals.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'archived' ? 'active' : ''}`}
          onClick={() => setActiveTab('archived')}
        >
          已封存/拒絕 ({archivedRentals.length})
        </button>
      </div>

      {activeTab === 'pending' && renderRentals(pendingRentals, 'pending')}
      {activeTab === 'published' && renderRentals(publishedRentals, 'published')}
      {activeTab === 'archived' && renderRentals(archivedRentals, 'archived')}

    </div>
  );
}
