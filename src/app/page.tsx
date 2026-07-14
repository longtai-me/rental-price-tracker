"use client";

import { useState, useEffect } from 'react';
import { MapPin, Home, DollarSign, Loader2, X, Car, Building, Ruler, CheckCircle2, XCircle, Zap } from 'lucide-react';
import MapWrapper from '@/components/MapWrapper';
import { PriceTrendChart, TypePieChart } from '@/components/Charts';
import './page.css';

interface Rental {
  id: string;
  city: string;
  district: string;
  address: string;
  type: string;
  layout: string;
  area: number;
  floor: string;
  buildingAge: number;
  price: number;
  pricePerPing: number;
  hasElevator: boolean;
  hasManagement: boolean;
  parking: string;
  date: string;
  lat: number;
  lng: number;
  canMoveHuji: boolean;
  canSubsidize: boolean;
  utilityBilling: string;
  transportation?: string[];
  equipment?: string[];
  features?: string[];
  genderRestriction?: string;
  posterRole?: string;
  agencyFeeCharged?: boolean;
  contractFile?: string;
  startDate?: string;
  leaseTerm?: number;
  ghostStory?: string;
  badLandlord?: boolean;
  evidenceLink?: string;
}

export default function HomePage() {
  const [data, setData] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  
  // Filters
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');
  const [rooms, setRooms] = useState('');
  const [hasParking, setHasParking] = useState(false);
  const [needsSubsidize, setNeedsSubsidize] = useState(false);
  const [needsHuji, setNeedsHuji] = useState(false);
  const [utilityBillingType, setUtilityBillingType] = useState('all'); // 'all', 'official', 'non-official'
  const [maxElectricityPriceSummer, setMaxElectricityPriceSummer] = useState('');
  const [maxElectricityPriceNonSummer, setMaxElectricityPriceNonSummer] = useState('');
  const [maxWaterPrice, setMaxWaterPrice] = useState('');
  const [includesWater, setIncludesWater] = useState(false);
  const [includesElectricity, setIncludesElectricity] = useState(false);
  const [transports, setTransports] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [genderRestriction, setGenderRestriction] = useState('不限');
  
  // UI State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Interaction
  const [selectedItem, setSelectedItem] = useState<Rental | null>(null);

  const parseJsonSafely = async <T,>(res: Response): Promise<T | null> => {
    const text = await res.text();
    if (!text) return null;

    try {
      return JSON.parse(text) as T;
    } catch (error) {
      console.error('API returned non-JSON response', {
        status: res.status,
        url: res.url,
        body: text.slice(0, 200),
      });
      return null;
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'renter': return '租客登錄';
      case 'agent': return '房仲登錄';
      case 'landlord':
      default: return '房東登錄';
    }
  };

  const maskAddress = (address: string) => {
    if (!address) return '';
    const lastIndex = Math.max(
      address.lastIndexOf('路'),
      address.lastIndexOf('街'),
      address.lastIndexOf('道'),
      address.lastIndexOf('段'),
      address.lastIndexOf('巷'),
      address.lastIndexOf('弄')
    );
    if (lastIndex !== -1) {
      return address.substring(0, lastIndex + 1);
    }
    return address.replace(/\d+號.*/, '');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (type) params.append('type', type);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (minArea) params.append('minArea', minArea);
      if (maxArea) params.append('maxArea', maxArea);
      if (rooms) params.append('rooms', rooms);
      if (hasParking) params.append('hasParking', 'true');
      if (needsSubsidize) params.append('needsSubsidize', 'true');
      if (needsHuji) params.append('needsHuji', 'true');
      if (utilityBillingType !== 'all') params.append('utilityBillingType', utilityBillingType);
      if (maxElectricityPriceSummer && utilityBillingType === 'non-official') params.append('maxElectricityPriceSummer', maxElectricityPriceSummer);
      if (maxElectricityPriceNonSummer && utilityBillingType === 'non-official') params.append('maxElectricityPriceNonSummer', maxElectricityPriceNonSummer);
      if (maxWaterPrice && utilityBillingType === 'non-official') params.append('maxWaterPrice', maxWaterPrice);
      if (includesWater) params.append('includesWater', 'true');
      if (includesElectricity) params.append('includesElectricity', 'true');
      if (transports.length > 0) params.append('transports', transports.join(','));
      if (equipment.length > 0) params.append('equipment', equipment.join(','));
      if (features.length > 0) params.append('features', features.join(','));
      if (genderRestriction && genderRestriction !== '不限') params.append('genderRestriction', genderRestriction);

      const res = await fetch(`/api/rentals?${params.toString()}`);
      const result = await parseJsonSafely<{ success?: boolean; data?: Rental[]; error?: string }>(res);

      if (!res.ok || !result?.success) {
        console.error('Failed to fetch rentals', {
          status: res.status,
          error: result?.error,
        });
        setData([]);
        return;
      }

      setData(result.data || []);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch('/api/cities');
        const json = await parseJsonSafely<{ success?: boolean; cities?: string[]; error?: string }>(res);

        if (!res.ok || !json?.success) {
          console.error("Failed to fetch cities", {
            status: res.status,
            error: json?.error,
          });
          setAvailableCities([]);
          return;
        }

        setAvailableCities(json.cities || []);
      } catch (err) {
        console.error("Failed to fetch cities", err);
        setAvailableCities([]);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [city, type, minPrice, maxPrice, minArea, maxArea, rooms, hasParking, needsSubsidize, needsHuji, utilityBillingType, maxElectricityPriceSummer, maxElectricityPriceNonSummer, maxWaterPrice, includesWater, includesElectricity, transports, equipment, features, genderRestriction]);

  const avgPrice = data.length > 0 ? Math.round(data.reduce((acc, curr) => acc + curr.price, 0) / data.length) : 0;
  const avgPingPrice = data.length > 0 ? Math.round(data.reduce((acc, curr) => acc + curr.pricePerPing, 0) / data.length) : 0;

  return (
    <div className="split-view animate-fade-in">
      {/* 左側地圖區 */}
      <div className="map-panel">
        <MapWrapper data={data} onMarkerClick={setSelectedItem} />
      </div>

      {/* 右側資料區 */}
      <div className="data-panel">
        <header className="dashboard-header">
          <h1>地圖尋屋與行情分析</h1>
          <p>掌握最新租屋市場實價登錄資訊，透明化您的租屋選擇</p>
        </header>

        {/* 篩選器 */}
        <div className="filters-section glass-panel">
          <div className="filter-row">
            <div className="filter-group">
              <label><MapPin size={16}/> 縣市</label>
              <select className="input-field" value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">全部縣市</option>
                {availableCities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label><Home size={16}/> 物件類型</label>
              <select className="input-field" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">全部類型</option>
                <option value="整層住家">整層住家</option>
                <option value="獨立套房">獨立套房</option>
                <option value="分租套房">分租套房</option>
                <option value="分租雅房">分租雅房</option>
              </select>
            </div>
            <div className="filter-group" style={{ gridColumn: 'span 2' }}>
              <label><DollarSign size={16} /> 租金範圍</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="最低預算" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span style={{ color: 'var(--text-muted)' }}>-</span>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="最高預算" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label><Building size={16} /> 房數</label>
              <select className="input-field" value={rooms} onChange={(e) => setRooms(e.target.value)}>
                <option value="">不限房數</option>
                <option value="1">1房</option>
                <option value="2">2房</option>
                <option value="3">3房</option>
                <option value="4+">4房以上</option>
              </select>
            </div>
            <div className="filter-group">
              <label><Zap size={16}/> 水電費計費</label>
              <select className="input-field" value={utilityBillingType} onChange={(e) => setUtilityBillingType(e.target.value)}>
                <option value="all">全部方式</option>
                <option value="official">台水台電依帳單</option>
                <option value="non-official">非台水台電 (一度電X元等)</option>
              </select>
            </div>
          </div>

          {/* 非台水台電的進階輸入區塊 */}
          {utilityBillingType === 'non-official' && (
            <div className="filter-row animate-fade-in" style={{ 
              marginTop: '-0.5rem', 
              marginBottom: '1.5rem', 
              backgroundColor: '#f8f9fa', 
              padding: '1rem', 
              borderRadius: '8px', 
              border: '1px solid var(--card-border)' 
            }}>
              <div className="filter-group">
                <label><Zap size={16}/> 非夏季電費 (元/度)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="例如: 5"
                  step="0.1"
                  value={maxElectricityPriceNonSummer}
                  onChange={(e) => setMaxElectricityPriceNonSummer(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label><Zap size={16} /> 夏季電費 (元/度)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="例如: 6.5"
                  step="0.1"
                  value={maxElectricityPriceSummer}
                  onChange={(e) => setMaxElectricityPriceSummer(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label><Zap size={16} /> 最高水費 (元/度)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="例如: 15"
                  step="1"
                  value={maxWaterPrice}
                  onChange={(e) => setMaxWaterPrice(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="filter-row-secondary" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <label className="checkbox-label">
              <input type="checkbox" checked={hasParking} onChange={(e) => setHasParking(e.target.checked)} />
              <Car size={16} /> 包含車位
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={needsSubsidize} onChange={(e) => setNeedsSubsidize(e.target.checked)} />
              <CheckCircle2 size={16} className="text-emerald-500" /> 可申請租補
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={needsHuji} onChange={(e) => setNeedsHuji(e.target.checked)} />
              <CheckCircle2 size={16} className="text-blue-500" /> 可入戶籍
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={includesWater} onChange={(e) => setIncludesWater(e.target.checked)} />
              <Zap size={16} className="text-blue-400" /> 包含水費
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={includesElectricity} onChange={(e) => setIncludesElectricity(e.target.checked)} />
              <Zap size={16} className="text-orange-400" /> 包含電費
            </label>
          </div>

          <div className="filter-row-secondary" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', flexShrink: 0 }}>交通條件：</span>
            {['捷運', '公車', '火車', '高鐵', '鄰近停車場'].map(t => (
              <label key={t} className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={transports.includes(t)} 
                  onChange={(e) => {
                    if (e.target.checked) setTransports([...transports, t]);
                    else setTransports(transports.filter(tr => tr !== t));
                  }} 
                />
                {t}
              </label>
            ))}
          </div>
          
          {/* Advanced Filters Toggle */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button 
              style={{ 
                padding: '0.75rem 2.5rem', 
                fontSize: '1rem', 
                fontWeight: 600,
                backgroundColor: showAdvancedFilters ? 'var(--surface-color)' : 'var(--primary)', 
                color: showAdvancedFilters ? 'var(--foreground)' : 'white', 
                border: showAdvancedFilters ? '1px solid var(--border-color)' : 'none',
                borderRadius: '8px',
                boxShadow: showAdvancedFilters ? 'none' : '0 4px 14px rgba(59, 130, 246, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              onMouseEnter={(e) => {
                if(!showAdvancedFilters) e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                if(!showAdvancedFilters) e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {showAdvancedFilters ? '收合進階條件' : '展開進階條件'}
            </button>
          </div>
          
          {showAdvancedFilters && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="filter-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="filter-group">
                  <label><Ruler size={16} /> 坪數範圍 (坪)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="number" className="input-field" placeholder="最小" value={minArea} onChange={(e) => setMinArea(e.target.value)} />
                    <span style={{ color: 'var(--text-muted)' }}>-</span>
                    <input type="number" className="input-field" placeholder="最大" value={maxArea} onChange={(e) => setMaxArea(e.target.value)} />
                  </div>
                </div>
                <div className="filter-group">
                  <label>性別限制</label>
                  <select className="input-field" value={genderRestriction} onChange={(e) => setGenderRestriction(e.target.value)}>
                    <option value="不限">不限性別</option>
                    <option value="限女">限女</option>
                    <option value="限男">限男</option>
                  </select>
                </div>
              </div>
              
              <div className="filter-row-secondary" style={{ display: 'flex', gap: '1rem', flexWrap: 'nowrap' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', width: '100px', flexShrink: 0, marginTop: '4px' }}>提供設備：</span>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
                  {['冷氣', '洗衣機', '冰箱', '天然瓦斯', '網路/第四台'].map(t => (
                    <label key={t} className="checkbox-label">
                      <input type="checkbox" checked={equipment.includes(t)} onChange={(e) => {
                          if (e.target.checked) setEquipment([...equipment, t]);
                          else setEquipment(equipment.filter(eq => eq !== t));
                        }} 
                      /> {t}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="filter-row-secondary" style={{ display: 'flex', gap: '1rem', flexWrap: 'nowrap' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', width: '100px', flexShrink: 0, marginTop: '4px' }}>房屋特色：</span>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
                  {['可養寵物', '可開伙', '有陽台', '代收垃圾'].map(t => (
                    <label key={t} className="checkbox-label">
                      <input type="checkbox" checked={features.includes(t)} onChange={(e) => {
                          if (e.target.checked) setFeatures([...features, t]);
                          else setFeatures(features.filter(ft => ft !== t));
                        }} 
                      /> {t}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 統計圖表 */}
        <div className="stats-grid">
          <div className="stat-card glass-panel">
            <h3>平均月租金</h3>
            <p className="stat-value">NT$ {avgPrice.toLocaleString()}</p>
          </div>
          <div className="stat-card glass-panel">
            <h3>單坪均價</h3>
            <p className="stat-value">NT$ {avgPingPrice.toLocaleString()}</p>
          </div>
          <div className="stat-card glass-panel">
            <h3>搜尋結果</h3>
            <p className="stat-value">{data.length} 筆</p>
          </div>
        </div>

        <div className="charts-section">
          <div className="chart-box glass-panel">
            <h3>各區平均租金行情 (Top 5)</h3>
            <PriceTrendChart data={data} />
          </div>
          <div className="chart-box glass-panel">
            <h3>物件型態分佈</h3>
            <TypePieChart data={data} />
          </div>
        </div>

        {/* 列表 */}
        <div className="list-section glass-panel">
          <h2>實價登錄列表 ({data.length} 筆)</h2>
          {loading ? (
            <div className="loading-state">
              <Loader2 className="spinner" size={32} />
            </div>
          ) : data.length === 0 ? (
            <div className="empty-state">
              <p>無符合條件的租屋資料</p>
            </div>
          ) : (
            <div className="card-list">
              {data.map(item => (
                <div key={item.id} className="list-card" onClick={() => setSelectedItem(item)}>
                  <div className="card-header">
                    <span className="type-badge">{item.type}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span className="price">NT$ {item.price.toLocaleString()}</span>
                      {!!item.agencyFeeCharged && (
                        <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#dc2626', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                          需收仲介費
                        </span>
                      )}
                    </div>
                  </div>
                  <h4 className="address">{item.city}{item.district} {maskAddress(item.address)}</h4>
                  <div className="card-meta">
                    <span>{item.layout}</span>
                    <span>{item.area} 坪</span>
                    <span>{item.floor} 樓</span>
                  </div>
                  <div className="card-tags" style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                    {!!item.contractFile && (
                      <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#059669', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> 已認證契約
                      </span>
                    )}
                    {!!item.badLandlord && (
                      <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#dc2626', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <XCircle size={12} /> 惡房東避雷
                      </span>
                    )}
                    {!!item.canSubsidize && <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 8px', borderRadius: '4px' }}>可租補</span>}
                    {!!item.canMoveHuji && <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '2px 8px', borderRadius: '4px' }}>可入戶籍</span>}
                    <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#d97706', padding: '2px 8px', borderRadius: '4px' }}>
                      {getRoleLabel(item.posterRole)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 詳細資料 Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content glass-panel animate-fade-in" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedItem(null)}><X size={24} /></button>
            <div className="modal-header">
              <h2>{selectedItem.city}{selectedItem.district} {maskAddress(selectedItem.address)}</h2>
              <span className="modal-price">NT$ {selectedItem.price.toLocaleString()} / 月</span>
            </div>
            
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item">
                  <Home className="info-icon" />
                  <div>
                    <label>型態/格局</label>
                    <p>{selectedItem.type} | {selectedItem.layout}</p>
                  </div>
                </div>
                <div className="info-item">
                  <Ruler className="info-icon" />
                  <div>
                    <label>建坪/單價</label>
                    <p>{selectedItem.area} 坪 (NT$ {selectedItem.pricePerPing}/坪)</p>
                  </div>
                </div>
                <div className="info-item">
                  <Building className="info-icon" />
                  <div>
                    <label>樓層/屋齡</label>
                    <p>{selectedItem.floor} | {selectedItem.buildingAge} 年</p>
                  </div>
                </div>
                <div className="info-item">
                  <Car className="info-icon" />
                  <div>
                    <label>車位/管理/電梯</label>
                    <p>{selectedItem.parking} | {selectedItem.hasManagement ? '有管理' : '無管理'} | {selectedItem.hasElevator ? '有電梯' : '無電梯'}</p>
                  </div>
                </div>
                <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                  <Building className="info-icon" style={{ color: 'var(--primary)' }} />
                  <div>
                    <label>刊登者身分</label>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{getRoleLabel(selectedItem.posterRole)}</span>
                      {!!selectedItem.agencyFeeCharged && (
                        <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#dc2626', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                          需收取仲介費
                        </span>
                      )}
                      {!!selectedItem.contractFile && (
                        <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#059669', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={14} /> 經過房屋租賃契約書審核
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* 合約與費用資訊區塊 */}
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--card-border)' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--primary)' }}>合約與費用資訊</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <CheckCircle2 className="info-icon" style={{ color: 'var(--primary)' }} />
                    <div>
                      <label>租期資訊</label>
                      <p style={{ color: 'var(--foreground)' }}>
                        {selectedItem.startDate ? `${selectedItem.startDate} 起租` : '未提供'}
                        {selectedItem.leaseTerm ? ` (期限 ${selectedItem.leaseTerm} 年)` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="info-item">
                    <CheckCircle2 className="info-icon" style={{ color: selectedItem.canSubsidize ? 'var(--primary)' : 'var(--text-muted)' }} />
                    <div>
                      <label>租屋補助</label>
                      <p style={{ color: selectedItem.canSubsidize ? 'var(--primary)' : 'var(--text-muted)' }}>{selectedItem.canSubsidize ? '可申請租屋補助' : '不可申請租補'}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <CheckCircle2 className="info-icon" style={{ color: selectedItem.canMoveHuji ? 'var(--primary)' : 'var(--text-muted)' }} />
                    <div>
                      <label>入戶籍</label>
                      <p style={{ color: selectedItem.canMoveHuji ? 'var(--primary)' : 'var(--text-muted)' }}>{selectedItem.canMoveHuji ? '可遷入戶籍' : '不可遷入戶籍'}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <Zap className="info-icon" style={{ color: 'var(--warning)' }} />
                    <div>
                      <label>水電瓦斯費</label>
                      <p style={{ color: 'var(--foreground)', fontWeight: 600 }}>{selectedItem.utilityBilling}</p>
                    </div>
                  </div>
                  <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                    <Car className="info-icon" style={{ color: 'var(--text-muted)' }} />
                    <div>
                      <label>交通條件</label>
                      <p style={{ color: 'var(--foreground)' }}>
                        {selectedItem.transportation && selectedItem.transportation.length > 0 
                          ? selectedItem.transportation.join('、') 
                          : '無特別標註'}
                      </p>
                    </div>
                  </div>
                  <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                    <CheckCircle2 className="info-icon" style={{ color: 'var(--success)' }} />
                    <div>
                      <label>提供設備</label>
                      <p style={{ color: 'var(--foreground)' }}>
                        {selectedItem.equipment && selectedItem.equipment.length > 0 
                          ? selectedItem.equipment.join('、') 
                          : '無特別標註'}
                      </p>
                    </div>
                  </div>
                  <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                    <CheckCircle2 className="info-icon" style={{ color: 'var(--warning)' }} />
                    <div>
                      <label>房屋特色與規定</label>
                      <p style={{ color: 'var(--foreground)' }}>
                        {[
                          ...(selectedItem.features || []),
                          selectedItem.genderRestriction !== '不限' ? selectedItem.genderRestriction : null
                        ].filter(Boolean).join('、') || '無特別標註'}
                      </p>
                    </div>
                  </div>
                  {selectedItem.badLandlord && (
                    <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                      <XCircle className="info-icon" style={{ color: '#dc2626' }} />
                      <div>
                        <label style={{ color: '#dc2626' }}>🚨 惡房東避雷警告</label>
                        <p style={{ color: 'var(--foreground)', marginTop: '0.25rem', fontWeight: 600 }}>
                          此物件被標記為惡房東！
                        </p>
                        {selectedItem.evidenceLink && (
                          <a 
                            href={selectedItem.evidenceLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ display: 'inline-block', marginTop: '0.5rem', color: 'var(--primary)', textDecoration: 'underline' }}
                          >
                            🔗 點此查看客觀證據 (判決書/公文/新聞)
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  {selectedItem.ghostStory && (
                    <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                      <Zap className="info-icon" style={{ color: '#ef4444' }} />
                      <div>
                        <label style={{ color: '#ef4444' }}>👻 租屋鬼故事 / 恐怖經歷</label>
                        <p style={{ color: 'var(--foreground)', marginTop: '0.25rem', whiteSpace: 'pre-wrap', fontStyle: 'italic', lineHeight: '1.6' }}>
                          {selectedItem.ghostStory}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
