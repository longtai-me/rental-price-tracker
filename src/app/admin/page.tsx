'use client';

import { useState, useEffect } from 'react';
import { Check, X, PencilSimple, Trash, ArchiveBox, ArrowUUpLeft, MagnifyingGlass, MapPin, House, CurrencyDollar, CheckCircle, XCircle, FileText } from '@phosphor-icons/react';
import DraggableMapWrapper from '@/components/DraggableMapWrapper';
import './admin.css';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'archived'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Honeypot state
  const [isHoneypot, setIsHoneypot] = useState(false);
  const [honeypotClicks, setHoneypotClicks] = useState(0);

  // Edit Modal State
  const [editingRental, setEditingRental] = useState<any | null>(null);
  const [editLat, setEditLat] = useState<number>(25.0330);
  const [editLng, setEditLng] = useState<number>(121.5654);
  const [geocodeStatus, setGeocodeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [editElectricityType, setEditElectricityType] = useState<string>('');
  const [editWaterType, setEditWaterType] = useState<string>('');

  useEffect(() => {
    fetch('/api/admin/access-log', {
      method: 'POST',
      cache: 'no-store',
      keepalive: true,
    }).catch((error) => {
      console.error('Failed to record admin access', error);
    });
  }, []);

  useEffect(() => {
    if (editingRental) {
      setEditLat(editingRental.latitude || 25.0330);
      setEditLng(editingRental.longitude || 121.5654);
      setGeocodeStatus('idle');
      setEditElectricityType(editingRental.electricityBillingType || (editingRental.includesElectricity ? 'included' : 'taipower'));
      setEditWaterType(editingRental.waterBillingType || (editingRental.includesWater ? 'included' : 'taiwater'));
    }
  }, [editingRental]);

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
          alert(`你知道什麼是蜜罐嗎？\n你真不覺得這裡很空虛嗎？\n我不是說過密碼不在前端嗎？\n但你說實話，密碼復不復雜，我真的記不起來`);
        }
        return newCount;
      });
    }
  };

  const executeAction = async (method: string, body: any, token: string) => {
    const isFormData = body instanceof FormData;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`
    };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    return fetch('/api/admin/rentals', {
      method,
      headers,
      body: isFormData ? body : JSON.stringify(body)
    });
  };

  const handleAction = async (id: string, action: string, method: string = 'PATCH') => {
    let currentToken = password;
    let res = await executeAction(method, { id, action }, currentToken);

    if (res.status === 403) {
      const promptText = method === 'DELETE' ? '完全刪除需要超級管理員密碼，請輸入：' : '此操作需要進階密碼，請輸入：';
      const newToken = prompt(promptText);
      if (!newToken) return; 
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

  const handleAutoGeocode = async () => {
    const form = document.getElementById('edit-form') as HTMLFormElement;
    if (!form) return;
    const formData = new FormData(form);
    const city = formData.get('city') as string || '';
    const district = formData.get('district') as string || '';
    const address = formData.get('address') as string || '';
    const query = `${city}${district}${address}`.trim();
    
    if (!query) {
      alert('請先填寫縣市、區域及詳細地址');
      return;
    }
    
    setGeocodeStatus('loading');
    const fetchGeocode = async (q: string) => {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=tw`, { headers: { 'User-Agent': 'rental-price-tracker/1.0' } });
      return await res.json() as any[];
    };
    
    try {
      let data = await fetchGeocode(query);
      if (!data || data.length === 0) {
        const roadMatch = address.match(/(.+?[路街大道段])/);
        if (roadMatch) {
          const fallbackQuery = `${city}${district}${roadMatch[1]}`;
          if (fallbackQuery !== query) data = await fetchGeocode(fallbackQuery);
        }
      }
      
      if (data && data.length > 0) {
        setEditLat(parseFloat(data[0].lat));
        setEditLng(parseFloat(data[0].lon));
        setGeocodeStatus('success');
      } else {
        setGeocodeStatus('error');
      }
    } catch {
      setGeocodeStatus('error');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRental) return;
    
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = Object.fromEntries(formData.entries());
    
    const booleanFields = ['hasElevator', 'hasParking', 'canPet', 'canCook', 'trashService', 'hasBalcony', 'canMoveHuji', 'canSubsidize', 'agencyFeeCharged', 'badLandlord'];
    for (const field of booleanFields) {
      formData.set(field, formData.has(field) ? 'true' : 'false');
    }
    formData.set('includesWater', formData.get('waterBillingType') === 'included' ? 'true' : 'false');
    formData.set('includesElectricity', formData.get('electricityBillingType') === 'included' ? 'true' : 'false');
    
    // Parse features
    const featuresArr = [];
    if (formData.get('hasManager') === 'on') featuresArr.push('有管理員');
    const managementFee = formData.get('managementFee');
    if (managementFee) featuresArr.push(`管理費:${managementFee}`);
    
    // Arrays are kept as equipments and transports
    
    
    formData.set('id', editingRental.id);
    formData.set('action', 'edit');
    formData.set('latitude', String(editLat));
    formData.set('longitude', String(editLng));
    // Re-append parsed features to override original input values
    formData.delete('features');
    featuresArr.forEach(f => formData.append('features', f));
    
    let currentToken = password;
    let res = await executeAction('PUT', formData, currentToken);

    if (res.status === 403) {
      const newToken = prompt('此操作需要編輯密碼，請輸入：');
      if (!newToken) return;
      currentToken = newToken;
      res = await executeAction('PUT', formData, currentToken);
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
            <button type="submit" className="btn-primary">Sign in</button>
          </form>
        </div>
      </div>
    );
  }

  const getFilteredList = (list: any[]) => {
    return list.filter(r => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (r.city || '').toLowerCase().includes(q) ||
        (r.district || '').toLowerCase().includes(q) ||
        (r.address || '').toLowerCase().includes(q) ||
        (r.id || '').toLowerCase().includes(q)
      );
    });
  };

  const pendingRentals = getFilteredList(rentals.filter(r => r.approved === 0));
  const publishedRentals = getFilteredList(rentals.filter(r => r.approved === 1));
  const archivedRentals = getFilteredList(rentals.filter(r => r.approved === -1));

  const renderRentals = (list: any[], tab: string) => {
    if (loading) return <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>載入中...</p>;
    if (list.length === 0) return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        目前沒有符合條件的物件。
      </div>
    );

    return (
      <>
        {/* Desktop Data Table */}
        <div className="admin-table-container animate-fade-in">
          <table className="admin-table">
            <thead>
              <tr>
                <th>地點</th>
                <th>詳細地址</th>
                <th>型態/格局</th>
                <th>租金/坪數</th>
                <th>狀態標籤</th>
                <th>提交時間</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {list.map(rental => (
                <tr key={rental.id}>
                  <td>{rental.city}{rental.district}</td>
                  <td>{rental.address}</td>
                  <td>{rental.type}<br/><span style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>{rental.layout}</span></td>
                  <td>NT$ {rental.price}<br/><span style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>{rental.area} 坪</span></td>
                  <td>
                    <div className="badge-group">
                      {rental.verificationStatus === 'verified' && <span className="badge" style={{background: '#d1fae5', color: '#059669'}}>✅ 已審核</span>}
                      {rental.verificationStatus === 'doubtful' && <span className="badge" style={{background: '#fee2e2', color: '#b91c1c'}}>❓ 存疑</span>}
                      {rental.verificationStatus === 'verified' && <span className="badge" style={{background: '#d1fae5', color: '#059669'}}>✅ 已審核</span>}
                  {rental.verificationStatus === 'doubtful' && <span className="badge" style={{background: '#fee2e2', color: '#b91c1c'}}>❓ 存疑</span>}
                  {rental.ghostStory && <span className="badge badge-ghost">👻 鬼故事</span>}
                      {rental.badLandlord && <span className="badge badge-bad-landlord">⚠️ 惡房東</span>}
                      {rental.evidenceLink && <a href={rental.evidenceLink} target="_blank" rel="noreferrer" className="badge badge-evidence">🔗 證據</a>}
                      {rental.contractFile && <a href={`/api/contracts?key=${encodeURIComponent(rental.contractFile)}`} target="_blank" rel="noreferrer" className="badge badge-contract">📄 契約</a>}
                    </div>
                  </td>
                  <td style={{fontSize: '0.85rem'}}>{new Date(rental.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => setEditingRental(rental)} className="action-btn edit" title="編輯"><PencilSimple size={32} weight="regular" /></button>
                      {tab === 'pending' && (
                        <>
                          <button onClick={() => handleAction(rental.id, 'approve')} className="action-btn approve" title="核准上架"><Check size={32} weight="regular" /></button>
                          <button onClick={() => handleAction(rental.id, 'reject')} className="action-btn reject" title="拒絕(封存)"><X size={32} weight="regular" /></button>
                        </>
                      )}
                      {tab === 'published' && (
                        <button onClick={() => handleAction(rental.id, 'remove')} className="action-btn reject" title="下架移除"><ArchiveBox size={32} weight="regular" /></button>
                      )}
                      {tab === 'archived' && (
                        <button onClick={() => handleAction(rental.id, 'unarchive')} className="action-btn approve" title="撤銷封存/重新審核"><ArrowUUpLeft size={32} weight="regular" /></button>
                      )}
                      <button onClick={() => { if(confirm('警告：這是永久刪除操作，無法復原。是否繼續？')) { handleAction(rental.id, 'delete', 'DELETE'); } }} className="action-btn delete" title="完全刪除"><Trash size={32} weight="regular" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List (hidden on desktop) */}
        <div className="mobile-card-list animate-fade-in">
          {list.map(rental => (
            <div key={rental.id} className="mobile-card">
              <div className="mobile-card-header">
                <span className="mobile-card-title">{rental.city}{rental.district} - {rental.type}</span>
                <span className="mobile-card-price">NT$ {rental.price}</span>
              </div>
              <div className="mobile-card-details">
                <p>{rental.address}</p>
                <p>{rental.layout} | {rental.area} 坪</p>
                <div className="badge-group" style={{ flexWrap: 'wrap', gap: '4px' }}>
                  {rental.ghostStory && <span className="badge badge-ghost">👻 鬼故事</span>}
                  {rental.badLandlord && <span className="badge badge-bad-landlord">⚠️ 惡房東</span>}
                  {rental.evidenceLink && <a href={rental.evidenceLink} target="_blank" rel="noreferrer" className="badge badge-evidence">🔗 證據</a>}
                  {rental.contractFile && <a href={`/api/contracts?key=${encodeURIComponent(rental.contractFile)}`} target="_blank" rel="noreferrer" className="badge badge-contract">📄 契約</a>}
                  {rental.hasElevator && <span className="badge" style={{background: '#e5e7eb', color: '#374151'}}>電梯</span>}
                  {rental.hasParking && <span className="badge" style={{background: '#e5e7eb', color: '#374151'}}>車位</span>}
                  {rental.canPet && <span className="badge" style={{background: '#e5e7eb', color: '#374151'}}>寵物</span>}
                  {rental.features?.includes('有管理員') && <span className="badge" style={{background: '#e5e7eb', color: '#374151'}}>管理員</span>}
                </div>
              </div>
              <div className="mobile-card-actions">
                <button onClick={() => setEditingRental(rental)} className="action-btn edit"><PencilSimple size={32} weight="regular" /></button>
                {tab === 'pending' && (
                  <>
                    <button onClick={() => handleAction(rental.id, 'approve')} className="action-btn approve"><Check size={32} weight="regular" /></button>
                    <button onClick={() => handleAction(rental.id, 'reject')} className="action-btn reject"><X size={32} weight="regular" /></button>
                  </>
                )}
                {tab === 'published' && <button onClick={() => handleAction(rental.id, 'remove')} className="action-btn reject"><ArchiveBox size={32} weight="regular" /></button>}
                {tab === 'archived' && <button onClick={() => handleAction(rental.id, 'unarchive')} className="action-btn approve"><ArrowUUpLeft size={32} weight="regular" /></button>}
                <button onClick={() => { if(confirm('警告：這是永久刪除操作，無法復原。是否繼續？')) handleAction(rental.id, 'delete', 'DELETE'); }} className="action-btn delete"><Trash size={32} weight="regular" /></button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <>
    <div className="admin-container animate-fade-in" onClickCapture={handleHoneypotInteraction}>
      <div className="admin-header">
        <h1>後台管理系統</h1>
        <button onClick={() => fetchRentals(password)} className="btn-secondary">重新整理</button>
      </div>

      <div className="admin-controls">
        <div className="admin-tabs">
          <button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
            待審核 ({pendingRentals.length})
          </button>
          <button className={`tab-btn ${activeTab === 'published' ? 'active' : ''}`} onClick={() => setActiveTab('published')}>
            已上架 ({publishedRentals.length})
          </button>
          <button className={`tab-btn ${activeTab === 'archived' ? 'active' : ''}`} onClick={() => setActiveTab('archived')}>
            已封存/拒絕 ({archivedRentals.length})
          </button>
        </div>

        <div className="search-container">
          <MagnifyingGlass color="#9ca3af"  size={32} weight="regular" />
          <input 
            type="text" 
            placeholder="搜尋城市、區域、地址或ID..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {activeTab === 'pending' && renderRentals(pendingRentals, 'pending')}
      {activeTab === 'published' && renderRentals(publishedRentals, 'published')}
      {activeTab === 'archived' && renderRentals(archivedRentals, 'archived')}
    </div>

      {editingRental && (
        <div className="modal-overlay">
          <div className="edit-modal-content">
            <div className="edit-modal-header">
              <h2>編輯租屋資訊</h2>
              <button onClick={() => setEditingRental(null)} style={{background: 'none', border: 'none', cursor: 'pointer'}}><X color="#6b7280"  size={32} weight="regular" /></button>
            </div>
            
            <div className="edit-modal-body">
              <form id="edit-form" onSubmit={handleEditSubmit}>
                
                {/* 區塊 1: 基本資料與位置 */}
                <div className="modal-section">
                  <h3><MapPin style={{verticalAlign: 'sub', marginRight: '0.4rem'}} size={32} weight="regular" />基本資料與位置</h3>
                  <div className="form-grid">

                    <div className="form-group">
                      <label>縣市</label>
                      <input type="text" name="city" defaultValue={editingRental.city} className="input-field" />
                    </div>
                    <div className="form-group">
                      <label>區域</label>
                      <input type="text" name="district" defaultValue={editingRental.district} className="input-field" />
                    </div>
                    <div className="form-group" style={{gridColumn: '1 / -1'}}>
                      <label>詳細地址</label>
                      <input type="text" name="address" defaultValue={editingRental.address} className="input-field" />
                    </div>
                    
                    {/* 地圖座標選擇器 */}
                    <div className="form-group" style={{gridColumn: '1 / -1'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
                        <label style={{margin: 0}}>精確座標 (拖曳圖釘微調)</label>
                        <button type="button" onClick={handleAutoGeocode} className="btn-secondary" style={{padding: '0.3rem 0.6rem', fontSize: '0.85rem'}}>
                          {geocodeStatus === 'loading' ? '定位中...' : '從地址自動定位'}
                        </button>
                      </div>
                      {geocodeStatus === 'success' && <p style={{fontSize: '0.8rem', color: '#10b981', marginBottom: '0.5rem'}}>定位成功！</p>}
                      {geocodeStatus === 'error' && <p style={{fontSize: '0.8rem', color: '#f59e0b', marginBottom: '0.5rem'}}>無法精確定位，建議手動拖曳圖釘或補齊地址。</p>}
                      
                      <div style={{ border: '1px solid var(--card-border)', borderRadius: '8px', overflow: 'hidden' }}>
                        <DraggableMapWrapper lat={editLat} lng={editLng} onChange={(newLat, newLng) => { setEditLat(newLat); setEditLng(newLng); }} />
                      </div>
                      <div style={{display: 'flex', gap: '1rem', marginTop: '0.5rem'}}>
                        <input type="text" disabled value={`Lat: ${editLat.toFixed(6)}`} className="input-field" style={{background: '#f3f4f6'}}/>
                        <input type="text" disabled value={`Lng: ${editLng.toFixed(6)}`} className="input-field" style={{background: '#f3f4f6'}}/>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 區塊 1.5: 認證與登錄者資訊 */}
                <div className="modal-section" style={{ borderLeft: '4px solid #3b82f6' }}>
                  <h3 style={{ color: '#3b82f6' }}><CheckCircle style={{verticalAlign: 'sub', marginRight: '0.4rem'}} size={32} weight="regular" />管理員設定與登錄者</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>認證狀態</label>
                      <select name="verificationStatus" defaultValue={editingRental.verificationStatus || 'unverified'} className="input-field">
                        <option value="unverified">未驗證</option>
                        <option value="verified">✅ 已審核</option>
                        <option value="doubtful">❓ 存疑</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>刊登者身分</label>
                      <select name="posterRole" defaultValue={editingRental.posterRole || 'renter'} className="input-field">
                        <option value="renter">租客</option>
                        <option value="landlord">房東</option>
                        <option value="agent">房仲</option>
                      </select>
                    </div>
                    <div className="form-group" style={{gridColumn: '1 / -1'}}>
                      <label>聯絡信箱 (選填)</label>
                      <input type="email" name="contactEmail" defaultValue={editingRental.contactEmail} placeholder="僅供管理員聯絡用" className="input-field" />
                    </div>
                    <div className="form-group" style={{gridColumn: '1 / -1'}}>
                      <label>租賃契約書 (如有上傳新檔案將會覆蓋舊檔)</label>
                      {editingRental.contractFile && (
                        <p style={{fontSize: '0.85rem', marginBottom: '0.5rem'}}>
                          目前檔案：<a href={`/api/contracts?key=${encodeURIComponent(editingRental.contractFile)}`} target="_blank" rel="noreferrer">檢視</a>
                        </p>
                      )}
                      <input type="file" name="contractFile" accept=".pdf,image/*" className="input-field" />
                    </div>
                  </div>
                </div>

                {/* 區塊 2: 房屋規格 */}
                <div className="modal-section">
                  <h3><House style={{verticalAlign: 'sub', marginRight: '0.4rem'}} size={32} weight="regular" />房屋規格</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>房屋類型</label>
                      <select name="type" defaultValue={editingRental.type} className="input-field">
                        <option value="獨立套房">獨立套房</option>
                        <option value="分租套房">分租套房</option>
                        <option value="雅房">雅房</option>
                        <option value="整層住家">整層住家</option>
                        <option value="車位">車位</option>
                        <option value="其他">其他</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>格局</label>
                      <input type="text" name="layout" defaultValue={editingRental.layout} className="input-field" placeholder="例: 1房1廳1衛" />
                    </div>
                    <div className="form-group">
                      <label>坪數</label>
                      <input type="number" step="0.1" name="area" defaultValue={editingRental.area} className="input-field" />
                    </div>
                    <div className="form-group">
                      <label>樓層</label>
                      <input type="text" name="floor" defaultValue={editingRental.floor} className="input-field" placeholder="例: 4F/5F" />
                    </div>
                    <div className="form-group">
                      <label>屋齡 (年)</label>
                      <input type="number" name="buildingAge" defaultValue={editingRental.buildingAge} className="input-field" />
                    </div>
                    <div className="form-group">
                      <label>性別限制</label>
                      <select name="genderRestriction" defaultValue={editingRental.genderRestriction === 'female' ? '限女' : editingRental.genderRestriction === 'male' ? '限男' : '不限'} className="input-field">
                        <option value="不限">不限性別</option>
                        <option value="限女">限女</option>
                        <option value="限男">限男</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 區塊 3: 租金與水電 */}
                <div className="modal-section">
                  <h3><CurrencyDollar style={{verticalAlign: 'sub', marginRight: '0.4rem'}} size={32} weight="regular" />租金與水電</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>月租金</label>
                      <input type="number" name="price" defaultValue={editingRental.price} className="input-field" />
                    </div>
                    <div className="form-group">
                      <label>管理費</label>
                      <input type="number" name="managementFee" defaultValue={editingRental.features?.find((f: string) => f.startsWith('管理費:'))?.replace('管理費:', '') || ''} className="input-field" placeholder="留空表示無" />
                    </div>
                    <div className="form-group">
                      <label>起租日</label>
                      <input type="date" name="startDate" defaultValue={editingRental.startDate} className="input-field" />
                    </div>
                    <div className="form-group">
                      <label>租期</label>
                      <select name="leaseTerm" defaultValue={editingRental.leaseTerm || '1年'} className="input-field">
                        <option value="1年">1年</option>
                        <option value="半年">半年</option>
                        <option value="短租">短租 (少於半年)</option>
                        <option value="其他">其他</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>電費收費標準</label>
                      <select name="electricityBillingType" value={editElectricityType} onChange={e => setEditElectricityType(e.target.value)} className="input-field">
                        <option value="included">包含在房租中</option><option value="taipower">依照台電價格</option><option value="custom">其他標準</option>
                      </select>
                    </div>
                    {editElectricityType === 'custom' && (
                      <div className="form-group" style={{gridColumn: '1 / -1'}}>
                        <label>自訂電費價格 (每度)</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input type="number" step="0.1" min="0" name="electricityPricePerKwh" defaultValue={editingRental.electricityPricePerKwh} placeholder="非夏季" className="input-field" />
                          <input type="number" step="0.1" min="0" name="electricitySummerPricePerKwh" defaultValue={editingRental.electricitySummerPricePerKwh} placeholder="夏季" className="input-field" />
                        </div>
                      </div>
                    )}
                    <div className="form-group">
                      <label>水費收費標準</label>
                      <select name="waterBillingType" value={editWaterType} onChange={e => setEditWaterType(e.target.value)} className="input-field">
                        <option value="included">包含在房租中</option><option value="taiwater">依照台水價格</option><option value="custom">其他標準</option>
                      </select>
                    </div>
                    {editWaterType === 'custom' && (
                      <div className="form-group" style={{gridColumn: '1 / -1'}}>
                        <label>自訂水費價格 (每單位)</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input type="number" step="0.1" min="0" name="waterPricePerUnit" defaultValue={editingRental.waterPricePerUnit} placeholder="非夏季" className="input-field" />
                          <input type="number" step="0.1" min="0" name="waterSummerPricePerUnit" defaultValue={editingRental.waterSummerPricePerUnit} placeholder="夏季" className="input-field" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 區塊 4: 房屋條件與設備 */}
                <div className="modal-section">
                  <h3><CheckCircle style={{verticalAlign: 'sub', marginRight: '0.4rem'}} size={32} weight="regular" />條件與設備</h3>
                  <div className="checkbox-grid" style={{marginBottom: '1rem'}}>
                    <label className="checkbox-label-custom"><input type="checkbox" name="hasElevator" defaultChecked={editingRental.hasElevator} /> 有電梯</label>
                    <label className="checkbox-label-custom"><input type="checkbox" name="hasParking" defaultChecked={editingRental.hasParking} /> 有車位</label>
                    <label className="checkbox-label-custom"><input type="checkbox" name="hasManager" defaultChecked={editingRental.features?.includes('有管理員')} /> 有管理員</label>
                    <label className="checkbox-label-custom"><input type="checkbox" name="canPet" defaultChecked={editingRental.canPet} /> 可養寵物</label>
                    <label className="checkbox-label-custom"><input type="checkbox" name="canCook" defaultChecked={editingRental.canCook} /> 可開伙</label>
                    <label className="checkbox-label-custom"><input type="checkbox" name="trashService" defaultChecked={editingRental.trashService} /> 代收垃圾</label>
                    <label className="checkbox-label-custom"><input type="checkbox" name="hasBalcony" defaultChecked={editingRental.hasBalcony} /> 有陽台</label>
                    <label className="checkbox-label-custom"><input type="checkbox" name="canMoveHuji" defaultChecked={editingRental.canMoveHuji} /> 可入戶籍</label>
                    <label className="checkbox-label-custom"><input type="checkbox" name="canSubsidize" defaultChecked={editingRental.canSubsidize} /> 可申請租補</label>
                    <label className="checkbox-label-custom"><input type="checkbox" name="agencyFeeCharged" defaultChecked={editingRental.agencyFeeCharged} /> 需仲介費</label>
                  </div>
                  <label style={{marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem'}}>設備</label>
                  <div className="checkbox-grid" style={{marginBottom: '1rem'}}>
                    {['冷氣', '洗衣機', '冰箱', '熱水器', '天然瓦斯', '網路', '第四台', '雙人床', '單人床', '衣櫃', '沙發', '桌椅'].map(eq => (
                      <label key={eq} className="checkbox-label-custom">
                        <input type="checkbox" name="equipments" value={eq} defaultChecked={editingRental.equipment?.includes(eq)} /> {eq}
                      </label>
                    ))}
                  </div>
                  <label style={{marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem'}}>周邊交通</label>
                  <div className="checkbox-grid">
                    {['捷運', '公車', '火車', '高鐵', '鄰近停車場'].map(tr => (
                      <label key={tr} className="checkbox-label-custom">
                        <input type="checkbox" name="transports" value={tr} defaultChecked={editingRental.transportation?.includes(tr)} /> {tr}
                      </label>
                    ))}
                  </div>
                </div>

                {/* 區塊 5: 避雷與特殊 */}
                <div className="modal-section" style={{ borderLeft: '4px solid #ef4444', marginBottom: 0 }}>
                  <h3 style={{ color: '#ef4444' }}><XCircle style={{verticalAlign: 'sub', marginRight: '0.4rem'}} size={32} weight="regular" />避雷專區 (非必填)</h3>
                  <div className="form-grid">
                    <div className="form-group" style={{gridColumn: '1 / -1'}}>
                      <label className="checkbox-label-custom" style={{ color: '#ef4444', fontWeight: 'bold' }}>
                        <input type="checkbox" name="badLandlord" defaultChecked={editingRental.badLandlord} /> 標記為惡房東物件
                      </label>
                    </div>
                    <div className="form-group" style={{gridColumn: '1 / -1'}}>
                      <label>附件上傳 (判決書、政府公文、新聞等)</label>
                      <input type="url" name="evidenceLink" defaultValue={editingRental.evidenceLink} className="input-field" placeholder="請貼上網址連結" />
                    </div>
                    <div className="form-group" style={{gridColumn: '1 / -1'}}>
                      <label>租屋鬼故事</label>
                      <textarea name="ghostStory" defaultValue={editingRental.ghostStory} className="input-field" rows={3} />
                    </div>
                  </div>
                </div>

              </form>
            </div>
            
            <div className="edit-modal-footer">
              <button type="button" onClick={() => setEditingRental(null)} className="btn-secondary">取消</button>
              <button type="submit" form="edit-form" className="btn-primary">儲存變更</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
