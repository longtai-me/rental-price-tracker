'use client';

import { useState, useEffect } from 'react';
import './admin.css';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'archived'>('pending');
  const [editingRental, setEditingRental] = useState<any | null>(null);
  const [isHoneypot, setIsHoneypot] = useState(false);
  const [honeypotClicks, setHoneypotClicks] = useState(0);

  useEffect(() => {
    fetch('/api/admin/access-log', {
      method: 'POST',
      cache: 'no-store',
      keepalive: true,
    }).catch((error) => {
      console.error('Failed to record admin access', error);
    });
  }, []);

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
    if (password === 'v4513226cdae34746b4dedf0b4dfa099e1781791509496') {
      fetch('/api/admin/access-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ honeypot: true })
      }).catch(() => {});
      setIsAuthenticated(true);
      setIsHoneypot(true);
      setRentals([]); // Show empty list to confuse the attacker
      return;
    }
    setIsAuthenticated(true);
    fetchRentals(password);
  };

  const handleHoneypotInteraction = () => {
    if (isHoneypot) {
      setHoneypotClicks(prev => {
        const newCount = prev + 1;
        if (newCount === 3) {
          alert('你知道什麼是蜜罐嗎？');
        }
        return newCount;
      });
    }
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRental) return;
    
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = Object.fromEntries(formData.entries());
    
    // Explicitly handle booleans since unchecked boxes are omitted from FormData
    const booleanFields = [
      'hasElevator', 'hasParking', 
      'canPet', 'canCook', 'trashService', 'hasBalcony', 'canMoveHuji', 
      'canSubsidize', 'agencyFeeCharged'
    ];
    for (const field of booleanFields) {
      data[field] = formData.has(field);
    }
    data.includesWater = data.waterBillingType === 'included';
    data.includesElectricity = data.electricityBillingType === 'included';

    // Handle array fields
    data.equipment = formData.getAll('equipments');
    data.transportation = formData.getAll('transports');
    
    const payload = {
      action: 'edit',
      id: editingRental.id,
      ...data
    };

    let currentToken = password;
    let res = await executeAction('PUT', payload, currentToken);

    if (res.status === 403) {
      const newToken = prompt('此操作需要編輯密碼，請輸入：');
      if (!newToken) return;
      currentToken = newToken;
      res = await executeAction('PUT', payload, currentToken);
    }

    if (res.ok) {
      alert('編輯成功！');
      setEditingRental(null);
      fetchRentals(password);
    } else {
      const errorData = await res.json() as any;
      alert(`錯誤: ${errorData.error || '編輯失敗'}`);
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
                placeholder="請輸入密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-admin-password="v4513226cdae34746b4dedf0b4dfa099e1781791509496"
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
                <p><span>租期:</span> {rental.startDate ? `${rental.startDate} 起租` : ''} {rental.leaseTerm ? `${rental.leaseTerm} 年` : ''}</p>
                {rental.ghostStory && <p style={{color: '#ef4444', fontStyle: 'italic', marginTop: '0.5rem'}}>👻 鬼故事: {rental.ghostStory}</p>}
                {rental.contractFile && (
                  <p>
                    <a href={`/api/contracts?key=${encodeURIComponent(rental.contractFile)}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>
                      查看契約書附件
                    </a>
                  </p>
                )}
              </div>
              <div className="rental-date">
                提交時間: {new Date(rental.createdAt).toLocaleString()}
              </div>
            </div>
            
            <div className="rental-actions">
              <button onClick={() => setEditingRental(rental)} className="btn-secondary">
                編輯
              </button>
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
    <div className="admin-container animate-fade-in" onClickCapture={handleHoneypotInteraction}>
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

      {editingRental && (
        <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100}}>
          <div className="glass-panel" style={{width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem'}}>
            <h2>編輯租屋資訊</h2>
            <form onSubmit={handleEditSubmit} className="form-grid" style={{marginTop: '1.5rem'}}>
              <div className="form-group">
                <label>登錄者身分</label>
                <select name="posterRole" defaultValue={editingRental.posterRole || 'renter'} className="input-field">
                  <option value="renter">租客</option>
                  <option value="landlord">房東</option>
                  <option value="agent">房仲</option>
                </select>
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
                <label className="checkbox-label-custom" style={{ margin: 0 }}>
                  <input type="checkbox" name="agencyFeeCharged" defaultChecked={editingRental.agencyFeeCharged} /> 承租需收取仲介費
                </label>
              </div>

              <div className="form-group">
                <label>縣市</label>
                <input type="text" name="city" defaultValue={editingRental.city} className="input-field" />
              </div>
              <div className="form-group">
                <label>區域</label>
                <input type="text" name="district" defaultValue={editingRental.district} className="input-field" />
              </div>
              <div className="form-group" style={{gridColumn: '1 / -1'}}>
                <label>地址</label>
                <input type="text" name="address" defaultValue={editingRental.address} className="input-field" />
              </div>
              <div className="form-group">
                <label>型態</label>
                <select name="type" defaultValue={editingRental.type} className="input-field">
                  <option>整層住家</option>
                  <option>獨立套房</option>
                  <option>分租套房</option>
                  <option>雅房</option>
                </select>
              </div>
              <div className="form-group">
                <label>格局</label>
                <input type="text" name="layout" defaultValue={editingRental.layout} className="input-field" />
              </div>
              <div className="form-group">
                <label>坪數</label>
                <input type="number" step="0.1" name="area" defaultValue={editingRental.area} className="input-field" />
              </div>
              <div className="form-group">
                <label>樓層</label>
                <input type="text" name="floor" defaultValue={editingRental.floor} className="input-field" />
              </div>
              <div className="form-group">
                <label>屋齡</label>
                <input type="number" name="buildingAge" defaultValue={editingRental.buildingAge} className="input-field" />
              </div>
              <div className="form-group">
                <label>租金</label>
                <input type="number" name="price" defaultValue={editingRental.price} className="input-field" />
              </div>
              <div className="form-group">
                <label>起租日</label>
                <input type="date" name="startDate" defaultValue={editingRental.startDate} className="input-field" />
              </div>
              <div className="form-group">
                <label>租屋期限 (年)</label>
                <select name="leaseTerm" defaultValue={editingRental.leaseTerm} className="input-field">
                  <option value="">(未設定)</option>
                  <option value="0.5">半年 (0.5年)</option>
                  <option value="1">1年</option>
                  <option value="2">2年</option>
                  <option value="3">3年以上</option>
                </select>
              </div>
              <div className="form-group" style={{gridColumn: '1 / -1'}}>
                <label>租屋鬼故事</label>
                <textarea 
                  name="ghostStory" 
                  defaultValue={editingRental.ghostStory} 
                  className="input-field" 
                  rows={3} 
                />
              </div>
              <div className="form-group">
                <label>電費收費標準</label>
                <select name="electricityBillingType" defaultValue={editingRental.electricityBillingType || (editingRental.includesElectricity ? 'included' : 'taipower')} className="input-field">
                  <option value="included">包含在房租中</option>
                  <option value="taipower">依照台電價格</option>
                  <option value="custom">其他標準</option>
                </select>
              </div>
              <div className="form-group">
                <label>電費一般標準 (元/度)</label>
                <input type="number" step="0.1" min="0" name="electricityPricePerKwh" defaultValue={editingRental.electricityPricePerKwh || ''} className="input-field" />
              </div>
              <div className="form-group">
                <label>電費夏季標準 (元/度)</label>
                <input type="number" step="0.1" min="0" name="electricitySummerPricePerKwh" defaultValue={editingRental.electricitySummerPricePerKwh || ''} className="input-field" />
              </div>
              <div className="form-group">
                <label>水費收費標準</label>
                <select name="waterBillingType" defaultValue={editingRental.waterBillingType || (editingRental.includesWater ? 'included' : 'taiwater')} className="input-field">
                  <option value="included">包含在房租中</option>
                  <option value="taiwater">依照台水價格</option>
                  <option value="custom">其他標準</option>
                </select>
              </div>
              <div className="form-group">
                <label>水費一般標準 (元/度)</label>
                <input type="number" step="0.1" min="0" name="waterPricePerUnit" defaultValue={editingRental.waterPricePerUnit || ''} className="input-field" />
              </div>
              <div className="form-group">
                <label>水費夏季標準 (元/度)</label>
                <input type="number" step="0.1" min="0" name="waterSummerPricePerUnit" defaultValue={editingRental.waterSummerPricePerUnit || ''} className="input-field" />
              </div>
              <div className="form-group">
                <label>緯度 (Latitude)</label>
                <input type="number" step="any" name="latitude" defaultValue={editingRental.latitude} className="input-field" placeholder="例如: 24.1477" />
              </div>
              <div className="form-group">
                <label>經度 (Longitude)</label>
                <input type="number" step="any" name="longitude" defaultValue={editingRental.longitude} className="input-field" placeholder="例如: 120.6736" />
              </div>
              <div className="form-group">
                <label>性別限制</label>
                <select name="genderRestriction" defaultValue={
                  editingRental.genderRestriction === '限女' ? 'female' : 
                  editingRental.genderRestriction === '限男' ? 'male' : 'none'
                } className="input-field">
                  <option value="none">不限</option>
                  <option value="female">限女</option>
                  <option value="male">限男</option>
                </select>
              </div>

              <div className="form-group" style={{gridColumn: '1 / -1'}}>
                <label style={{marginBottom: '0.5rem', display: 'block'}}>房屋特色與條件</label>
                <div className="checkbox-grid">
                  <label className="checkbox-label-custom"><input type="checkbox" name="hasElevator" defaultChecked={editingRental.hasElevator} /> 有電梯</label>
                  <label className="checkbox-label-custom"><input type="checkbox" name="hasParking" defaultChecked={editingRental.hasParking} /> 有車位</label>
                  <label className="checkbox-label-custom"><input type="checkbox" name="canPet" defaultChecked={editingRental.canPet} /> 可養寵物</label>
                  <label className="checkbox-label-custom"><input type="checkbox" name="canCook" defaultChecked={editingRental.canCook} /> 可開伙</label>
                  <label className="checkbox-label-custom"><input type="checkbox" name="trashService" defaultChecked={editingRental.trashService} /> 代收垃圾</label>
                  <label className="checkbox-label-custom"><input type="checkbox" name="hasBalcony" defaultChecked={editingRental.hasBalcony} /> 有陽台</label>
                  <label className="checkbox-label-custom"><input type="checkbox" name="canMoveHuji" defaultChecked={editingRental.canMoveHuji} /> 可入戶籍</label>
                  <label className="checkbox-label-custom"><input type="checkbox" name="canSubsidize" defaultChecked={editingRental.canSubsidize} /> 可申請租補</label>
                </div>
              </div>

              <div className="form-group" style={{gridColumn: '1 / -1'}}>
                <label style={{marginBottom: '0.5rem', display: 'block'}}>提供設備與家具</label>
                <div className="checkbox-grid">
                  {['冷氣', '洗衣機', '冰箱', '熱水器', '天然瓦斯', '網路', '第四台', '雙人床', '單人床', '衣櫃', '沙發', '桌椅'].map(eq => (
                    <label key={eq} className="checkbox-label-custom">
                      <input type="checkbox" name="equipments" value={eq} defaultChecked={editingRental.equipment?.includes(eq)} /> {eq}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{gridColumn: '1 / -1'}}>
                <label style={{marginBottom: '0.5rem', display: 'block'}}>周邊交通</label>
                <div className="checkbox-grid">
                  {['捷運', '公車', '火車', '高鐵', '鄰近停車場'].map(tr => (
                    <label key={tr} className="checkbox-label-custom">
                      <input type="checkbox" name="transports" value={tr} defaultChecked={editingRental.transportation?.includes(tr)} /> {tr}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                <button type="button" onClick={() => setEditingRental(null)} className="btn-secondary" style={{flex: 1}}>取消</button>
                <button type="submit" className="btn-primary" style={{flex: 1}}>儲存</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
