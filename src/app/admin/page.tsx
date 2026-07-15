'use client';

import { useState, useEffect } from 'react';
import { 
  Check, X, PencilSimple, Trash, Archive, ArrowUUpLeft, 
  MagnifyingGlass, MapPin, House, CurrencyDollar, CheckCircle, 
  XCircle, FileText, Ghost, Warning, Link as LinkIcon 
} from '@phosphor-icons/react';
import DraggableMapWrapper from '@/components/map/DraggableMapWrapper';

const ITEMS_PER_PAGE = 20;

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rentals, setRentals] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'archived'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
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

  useEffect(() => {
    if (isAuthenticated && !isHoneypot) {
      fetchRentals(password, currentPage, activeTab, searchQuery);
    }
  }, [currentPage, activeTab, isAuthenticated, isHoneypot]);

  useEffect(() => {
    // Reset to page 1 when search query changes
    if (isAuthenticated && !isHoneypot) {
      const delayDebounceFn = setTimeout(() => {
        setCurrentPage(1);
        fetchRentals(password, 1, activeTab, searchQuery);
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery]);

  const getStatusNumber = (tab: string) => {
    if (tab === 'pending') return 0;
    if (tab === 'published') return 1;
    if (tab === 'archived') return -1;
    return 0;
  };

  const fetchRentals = async (token = password, page = currentPage, tab = activeTab, search = searchQuery) => {
    setLoading(true);
    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const statusNum = getStatusNumber(tab);
      const params = new URLSearchParams({
        limit: ITEMS_PER_PAGE.toString(),
        offset: offset.toString(),
        status: statusNum.toString(),
      });
      if (search) {
        params.append('search', search);
      }

      const res = await fetch(`/api/admin/rentals?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json() as any;
      if (res.ok) {
        setRentals(data.data || []);
        setTotalCount(data.total || 0);
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
    fetchRentals(password, 1, activeTab, searchQuery);
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
      fetchRentals(password, currentPage, activeTab, searchQuery);
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
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error("Missing Google Maps API Key");
        return [];
      }
      const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&key=${apiKey}`);
      const data = await res.json() as any;
      if (data.status === "OK" && data.results && data.results.length > 0) {
        return [{ lat: data.results[0].geometry.location.lat, lon: data.results[0].geometry.location.lng }];
      }
      return [];
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
    
    formData.set('hasManager', formData.get('hasManager') === 'on' ? 'true' : 'false');
    
    formData.set('id', editingRental.id);
    formData.set('action', 'edit');
    formData.set('latitude', String(editLat));
    formData.set('longitude', String(editLng));
    
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
      fetchRentals(password, currentPage, activeTab, searchQuery);
    } else {
      const errorData = await res.json() as any;
      alert(`錯誤: ${errorData.error || '編輯失敗'}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">後台管理登入</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                required
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3"
                placeholder="請輸入管理員密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-admin-password="v4513226cdae34746b4dedf0b4dfa099e1781791509496"
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
              登入
            </button>
          </form>
        </div>
      </div>
    );
  }

  const renderRentals = (list: any[]) => {
    if (loading) return <p className="text-center text-gray-500 py-10 animate-pulse">載入中...</p>;
    if (list.length === 0) return (
      <div className="bg-gray-50 p-10 rounded-xl text-center text-gray-500 border border-gray-200">
        目前沒有符合條件的物件。
      </div>
    );

    return (
      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200 animate-fade-in">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">地點</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">詳細地址</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">型態/格局</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">租金/坪數</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態標籤</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">提交時間</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {list.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{r.city}</div>
                  <div className="text-sm text-gray-500">{r.district}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[200px] truncate" title={r.address}>
                  {r.address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{r.type}</div>
                  <div className="text-sm text-gray-500">{r.layout}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-blue-600">NT$ {r.price}</div>
                  <div className="text-sm text-gray-500">{r.area} 坪</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1 max-w-[150px]">
                    {r.posterRole === 'agent' && <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">房仲</span>}
                    {r.posterRole === 'renter' && <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">租客</span>}
                    {r.posterRole === 'landlord' && <span className="px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800">房東</span>}
                    {r.contractFile && <span className="px-2 py-1 text-xs font-semibold rounded bg-teal-100 text-teal-800">有契約</span>}
                    {r.badLandlord && <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">惡房東</span>}
                    {r.ghostStory && <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800">事故屋</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-wrap gap-2">
                    {r.approved === 0 && (
                      <button onClick={() => { handleAction(r.id, 'approve'); handleHoneypotInteraction(); }} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors" title="核准">
                        <Check weight="bold" />
                      </button>
                    )}
                    {r.approved === 0 && (
                      <button onClick={() => { handleAction(r.id, 'reject'); handleHoneypotInteraction(); }} className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors" title="拒絕">
                        <X weight="bold" />
                      </button>
                    )}
                    {r.approved === 1 && (
                      <button onClick={() => { handleAction(r.id, 'remove'); handleHoneypotInteraction(); }} className="p-1.5 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors" title="封存">
                        <Archive weight="bold" />
                      </button>
                    )}
                    {r.approved === -1 && (
                      <button onClick={() => { handleAction(r.id, 'unarchive'); handleHoneypotInteraction(); }} className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors" title="解除封存">
                        <ArrowUUpLeft weight="bold" />
                      </button>
                    )}
                    <button onClick={() => { setEditingRental(r); handleHoneypotInteraction(); }} className="p-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors" title="編輯">
                      <PencilSimple weight="bold" />
                    </button>
                    <button onClick={() => { handleAction(r.id, 'delete', 'DELETE'); handleHoneypotInteraction(); }} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors" title="永久刪除">
                      <Trash weight="bold" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">資料審核與管理</h1>
        <div className="relative w-full md:w-64">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="搜尋地址、標題或 ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          />
        </div>
      </div>
      
      <div className="flex border-b border-gray-200 mb-6 space-x-8">
        {[
          { id: 'pending', label: '待審核' },
          { id: 'published', label: '已發布' },
          { id: 'archived', label: '已封存' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`pb-4 text-lg font-medium transition-colors relative ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setActiveTab(tab.id as any); setCurrentPage(1); handleHoneypotInteraction(); }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-md"></span>
            )}
          </button>
        ))}
      </div>

      {renderRentals(rentals)}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一頁
          </button>
          <span className="text-sm text-gray-700">
            第 {currentPage} 頁 / 共 {totalPages} 頁
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一頁
          </button>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col my-8">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">編輯物件: {editingRental.id}</h2>
              <button onClick={() => setEditingRental(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} weight="bold" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="edit-form" onSubmit={handleEditSubmit} className="space-y-6">
                {/* Form fields identical to submit form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">刊登者身分</label>
                    <select name="posterRole" defaultValue={editingRental.posterRole || 'renter'} className="w-full bg-gray-50 border border-gray-300 rounded p-2">
                      <option value="renter">承租人 (我要轉租/退租)</option>
                      <option value="landlord">屋主自租</option>
                      <option value="agency">仲介/代管</option>
                      <option value="other">其他</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
                    <div className="flex gap-2">
                      <input type="text" name="city" defaultValue={editingRental.city} className="w-24 bg-gray-50 border border-gray-300 rounded p-2" placeholder="縣市" required />
                      <input type="text" name="district" defaultValue={editingRental.district} className="w-24 bg-gray-50 border border-gray-300 rounded p-2" placeholder="區域" required />
                      <input type="text" name="address" defaultValue={editingRental.address} className="flex-1 bg-gray-50 border border-gray-300 rounded p-2" placeholder="詳細地址" required />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">樓層</label>
                    <div className="flex gap-2 items-center">
                      <input required type="text" name="floor" defaultValue={editingRental.floor} className="w-full bg-gray-50 border border-gray-300 rounded p-2" />
                      <span>/</span>
                      <input type="number" name="totalFloors" defaultValue={editingRental.totalFloors || ''} className="w-full bg-gray-50 border border-gray-300 rounded p-2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">物件類型 & 房間類型</label>
                    <div className="flex gap-2">
                      <select name="propertyType" defaultValue={editingRental.propertyType || "公寓"} className="w-1/2 bg-gray-50 border border-gray-300 rounded p-2">
                        <option value="公寓">公寓</option>
                        <option value="電梯大樓">電梯大樓</option>
                        <option value="透天厝">透天厝</option>
                        <option value="其他">其他</option>
                      </select>
                      <select name="type" defaultValue={editingRental.type || "整層住家"} className="w-1/2 bg-gray-50 border border-gray-300 rounded p-2">
                        <option>整層住家</option>
                        <option>獨立套房</option>
                        <option>分租套房</option>
                        <option>雅房</option>
                        <option>其他</option>
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">格局</label>
                    <div className="flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2">
                        <input required type="number" name="rooms" defaultValue={editingRental.rooms || 0} min="0" className="w-20 text-center bg-white border border-gray-300 rounded p-1" /> <span>房</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input required type="number" name="livingRooms" defaultValue={editingRental.livingRooms || 0} min="0" className="w-20 text-center bg-white border border-gray-300 rounded p-1" /> <span>廳</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input required type="number" name="bathrooms" defaultValue={editingRental.bathrooms || 0} min="0" className="w-20 text-center bg-white border border-gray-300 rounded p-1" /> <span>衛</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">租金 (元/月)</label>
                    <input type="number" name="price" defaultValue={editingRental.price} className="w-full bg-gray-50 border border-gray-300 rounded p-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">坪數</label>
                    <input type="number" step="0.1" name="area" defaultValue={editingRental.area} className="w-full bg-gray-50 border border-gray-300 rounded p-2" required />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">屋齡 (年)</label>
                    <input type="number" name="buildingAge" defaultValue={editingRental.buildingAge || ''} className="w-full bg-gray-50 border border-gray-300 rounded p-2" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">性別限制</label>
                    <select name="genderRestriction" defaultValue={editingRental.genderRestriction === 'female' ? 'female' : editingRental.genderRestriction === 'male' ? 'male' : 'none'} className="w-full bg-gray-50 border border-gray-300 rounded p-2">
                      <option value="none">不限</option>
                      <option value="female">限女</option>
                      <option value="male">限男</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">水電收費標準</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">電費</label>
                      <select value={editElectricityType} onChange={e => setEditElectricityType(e.target.value)} name="electricityBillingType" className="w-full bg-white border border-gray-300 rounded p-2 mb-2">
                        <option value="taipower">依照台電</option>
                        <option value="included">含在房租</option>
                        <option value="custom">其他標準</option>
                      </select>
                      {editElectricityType === 'custom' && (
                        <div className="flex gap-2">
                          <input type="number" step="0.1" name="electricityPricePerKwh" defaultValue={editingRental.electricityPricePerKwh || ''} placeholder="一般" className="w-1/2 p-2 border rounded" />
                          <input type="number" step="0.1" name="electricitySummerPricePerKwh" defaultValue={editingRental.electricitySummerPricePerKwh || ''} placeholder="夏季" className="w-1/2 p-2 border rounded" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">水費</label>
                      <select value={editWaterType} onChange={e => setEditWaterType(e.target.value)} name="waterBillingType" className="w-full bg-white border border-gray-300 rounded p-2 mb-2">
                        <option value="taiwater">依照台水</option>
                        <option value="included">含在房租</option>
                        <option value="custom">其他標準</option>
                      </select>
                      {editWaterType === 'custom' && (
                        <div className="flex gap-2">
                          <input type="number" step="0.1" name="waterPricePerUnit" defaultValue={editingRental.waterPricePerUnit || ''} placeholder="一般" className="w-1/2 p-2 border rounded" />
                          <input type="number" step="0.1" name="waterSummerPricePerUnit" defaultValue={editingRental.waterSummerPricePerUnit || ''} placeholder="夏季" className="w-1/2 p-2 border rounded" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">房屋特色與條件</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                    {[
                      { id: 'hasElevator', label: '有電梯' },
                      { id: 'hasParking', label: '有車位' },
                      { id: 'hasManager', label: '有管理員' },
                      { id: 'canPet', label: '可養寵物' },
                      { id: 'canCook', label: '可開伙' },
                      { id: 'trashService', label: '代收垃圾' },
                      { id: 'hasBalcony', label: '有陽台' },
                      { id: 'canMoveHuji', label: '可入戶籍' },
                      { id: 'canSubsidize', label: '可申請租補' },
                      { id: 'agencyFeeCharged', label: '需中介費' }
                    ].map(item => (
                      <label key={item.id} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name={item.id} defaultChecked={editingRental[item.id]} className="w-4 h-4 text-blue-600 rounded" /> 
                        <span className="text-gray-700 text-sm">{item.label}</span>
                      </label>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">管理費 (元/月)</label>
                    <input type="number" min="0" name="managementFee" defaultValue={editingRental.managementFee || ''} className="w-full bg-white border border-gray-300 rounded p-2" />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">設備、交通與其他特徵</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">提供設備 (用逗號分隔)</label>
                      <input type="text" name="equipments" defaultValue={(editingRental.equipment || []).join(',')} className="w-full bg-white border border-gray-300 rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">周邊交通 (用逗號分隔)</label>
                      <input type="text" name="transports" defaultValue={(editingRental.transportation || []).join(',')} className="w-full bg-white border border-gray-300 rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">房屋特色字串 (用逗號分隔，舊版相容用)</label>
                      <input type="text" name="features" defaultValue={(editingRental.features || []).join(',')} className="w-full bg-white border border-gray-300 rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">起租日</label>
                      <input type="date" name="startDate" defaultValue={editingRental.startDate || ''} className="w-full bg-white border border-gray-300 rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">租期 (年)</label>
                      <input type="number" step="0.5" name="leaseTerm" defaultValue={editingRental.leaseTerm || ''} className="w-full bg-white border border-gray-300 rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">聯絡信箱 (不公開)</label>
                      <input type="email" name="contactEmail" defaultValue={editingRental.contactEmail || ''} className="w-full bg-white border border-gray-300 rounded p-2" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-red-100">
                  <h4 className="font-semibold text-red-700 mb-3">風險警告與合約檔案</h4>
                  <div className="space-y-4">
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="ghostStory" defaultChecked={editingRental.ghostStory} className="w-5 h-5 text-red-600 rounded focus:ring-red-500" />
                        <span className="text-red-700 text-sm font-medium">曾有非自然身故 (凶宅)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="badLandlord" defaultChecked={editingRental.badLandlord} className="w-5 h-5 text-red-600 rounded focus:ring-red-500" />
                        <span className="text-red-700 text-sm font-medium">惡房東/有糾紛紀錄</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">佐證資料連結</label>
                      <input type="url" name="evidenceLink" defaultValue={editingRental.evidenceLink || ''} className="w-full bg-white border border-red-200 rounded p-2" placeholder="https://..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">合約檔案 (重新上傳會覆蓋舊檔)</label>
                      <input type="file" name="contractFile" accept=".pdf,image/*" className="w-full bg-white border border-gray-300 rounded p-2" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <button type="button" onClick={() => setEditingRental(null)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                    取消
                  </button>
                  <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm">
                    儲存變更
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
