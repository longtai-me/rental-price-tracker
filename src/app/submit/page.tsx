'use client';

import { useState, useEffect, useRef } from 'react';
import DraggableMapWrapper from '@/components/DraggableMapWrapper';
import { Turnstile } from '@marsidev/react-turnstile';
import './submit.css';

const taiwanCities: Record<string, string[]> = {
  '台北市': ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'],
  '新北市': ['萬里區', '金山區', '板橋區', '汐止區', '深坑區', '石碇區', '瑞芳區', '平溪區', '雙溪區', '貢寮區', '新店區', '坪林區', '烏來區', '永和區', '中和區', '土城區', '三峽區', '樹林區', '鶯歌區', '三重區', '新莊區', '泰山區', '林口區', '蘆洲區', '五股區', '八里區', '淡水區', '三芝區', '石門區'],
  '基隆市': ['仁愛區', '信義區', '中正區', '中山區', '安樂區', '暖暖區', '七堵區'],
  '桃園市': ['中壢區', '平鎮區', '龍潭區', '楊梅區', '新屋區', '觀音區', '桃園區', '龜山區', '八德區', '大溪區', '復興區', '大園區', '蘆竹區'],
  '新竹縣': ['竹北市', '湖口鄉', '新豐鄉', '新埔鎮', '關西鎮', '芎林鄉', '寶山鄉', '竹東鎮', '五峰鄉', '橫山鄉', '尖石鄉', '北埔鄉', '峨眉鄉'],
  '新竹市': ['東區', '北區', '香山區'],
  '苗栗縣': ['竹南鎮', '頭份市', '三灣鄉', '南庄鄉', '獅潭鄉', '後龍鎮', '通霄鎮', '苑裡鎮', '苗栗市', '造橋鄉', '頭屋鄉', '公館鄉', '大湖鄉', '泰安鄉', '銅鑼鄉', '三義鄉', '西湖鄉', '卓蘭鎮'],
  '台中市': ['中區', '東區', '南區', '西區', '北區', '北屯區', '西屯區', '南屯區', '太平區', '大里區', '霧峰區', '烏日區', '豐原區', '后里區', '石岡區', '東勢區', '和平區', '新社區', '潭子區', '大雅區', '神岡區', '大肚區', '沙鹿區', '龍井區', '梧棲區', '清水區', '大甲區', '外埔區', '大安區'],
  '南投縣': ['南投市', '中寮鄉', '草屯鎮', '國姓鄉', '埔里鎮', '仁愛鄉', '名間鄉', '集集鎮', '水里鄉', '魚池鄉', '信義鄉', '竹山鎮', '鹿谷鄉'],
  '彰化縣': ['彰化市', '芬園鄉', '花壇鄉', '秀水鄉', '鹿港鎮', '福興鄉', '線西鄉', '和美鎮', '伸港鄉', '員林市', '社頭鄉', '永靖鄉', '埔心鄉', '溪湖鎮', '大村鄉', '埔鹽鄉', '田中鎮', '北斗鎮', '田尾鄉', '埤頭鄉', '溪州鄉', '竹塘鄉', '二林鎮', '大城鄉', '芳苑鄉', '二水鄉'],
  '雲林縣': ['斗南鎮', '大埤鄉', '虎尾鎮', '土庫鎮', '褒忠鄉', '東勢鄉', '臺西鄉', '崙背鄉', '麥寮鄉', '斗六市', '林內鄉', '古坑鄉', '莿桐鄉', '西螺鎮', '二崙鄉', '北港鎮', '水林鄉', '口湖鄉', '四湖鄉', '元長鄉'],
  '嘉義縣': ['番路鄉', '梅山鄉', '竹崎鄉', '阿里山鄉', '中埔鄉', '大埔鄉', '水上鄉', '鹿草鄉', '太保市', '朴子市', '東石鄉', '六腳鄉', '新港鄉', '民雄鄉', '大林鎮', '溪口鄉', '義竹鄉', '布袋鎮'],
  '嘉義市': ['東區', '西區'],
  '台南市': ['中西區', '東區', '南區', '北區', '安平區', '安南區', '永康區', '歸仁區', '新化區', '左鎮區', '玉井區', '楠西區', '南化區', '仁德區', '關廟區', '龍崎區', '官田區', '麻豆區', '佳里區', '西港區', '七股區', '將軍區', '學甲區', '北門區', '新營區', '後壁區', '白河區', '東山區', '六甲區', '下營區', '柳營區', '鹽水區', '善化區', '大內區', '山上區', '新市區', '安定區'],
  '高雄市': ['楠梓區', '左營區', '鼓山區', '三民區', '鹽埕區', '前金區', '新興區', '苓雅區', '前鎮區', '旗津區', '小港區', '鳳山區', '林園區', '大寮區', '大樹區', '大社區', '仁武區', '鳥松區', '岡山區', '橋頭區', '燕巢區', '田寮區', '阿蓮區', '路竹區', '湖內區', '茄萣區', '永安區', '彌陀區', '梓官區', '旗山區', '美濃區', '六龜區', '甲仙區', '杉林區', '內門區', '茂林區', '桃源區', '那瑪夏區'],
  '屏東縣': ['屏東市', '三地門鄉', '霧臺鄉', '瑪家鄉', '九如鄉', '里港鄉', '高樹鄉', '鹽埔鄉', '長治鄉', '麟洛鄉', '竹田鄉', '內埔鄉', '萬丹鄉', '潮州鎮', '泰武鄉', '來義鄉', '萬巒鄉', '崁頂鄉', '新埤鄉', '南州鄉', '林邊鄉', '東港鎮', '琉球鄉', '佳冬鄉', '新園鄉', '枋寮鄉', '枋山鄉', '春日鄉', '獅子鄉', '車城鄉', '牡丹鄉', '恆春鎮', '滿州鄉'],
  '宜蘭縣': ['宜蘭市', '頭城鎮', '礁溪鄉', '壯圍鄉', '員山鄉', '羅東鎮', '三星鄉', '大同鄉', '五結鄉', '冬山鄉', '蘇澳鎮', '南澳鄉'],
  '花蓮縣': ['花蓮市', '新城鄉', '秀林鄉', '吉安鄉', '壽豐鄉', '鳳林鎮', '光復鄉', '豐濱鄉', '瑞穗鄉', '萬榮鄉', '玉里鎮', '卓溪鄉', '富里鄉'],
  '台東縣': ['臺東市', '綠島鄉', '蘭嶼鄉', '延平鄉', '卑南鄉', '鹿野鄉', '關山鎮', '海端鄉', '池上鄉', '東河鄉', '成功鎮', '長濱鄉', '太麻里鄉', '金峰鄉', '大武鄉', '達仁鄉'],
  '澎湖縣': ['馬公市', '西嶼鄉', '望安鄉', '七美鄉', '白沙鄉', '湖西鄉'],
  '金門縣': ['金沙鎮', '金湖鎮', '金寧鄉', '金城鎮', '烈嶼鄉', '烏坵鄉'],
  '連江縣': ['南竿鄉', '北竿鄉', '莒光鄉', '東引鄉'],
  '其他': ['其他']
};

export default function SubmitPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [electricityBillingType, setElectricityBillingType] = useState('taipower');
  const [waterBillingType, setWaterBillingType] = useState('taiwater');

  // Coordinate state
  const [lat, setLat] = useState(25.0330);
  const [lng, setLng] = useState(121.5654);
  const [geocodeStatus, setGeocodeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const geocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Turnstile state
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  // Address fields for geocoding
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');

  // Auto-geocode when city/district/address changes (debounced 600ms)
  useEffect(() => {
    if (!selectedCity && !district && !address) return;
    if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
    geocodeTimerRef.current = setTimeout(async () => {
      const query = `${selectedCity}${district}${address}`.trim();
      if (!query) return;
      setGeocodeStatus('loading');

      const fetchGeocode = async (q: string) => {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=tw`,
          { headers: { 'User-Agent': 'rental-price-tracker/1.0' } }
        );
        const results = await res.json() as any[];
        
        if (district && results.length > 0) {
          const matched = results.find(r => r.display_name && r.display_name.includes(district));
          if (matched) return [matched];
          return [];
        }
        
        return results.length > 0 ? [results[0]] : [];
      };

      try {
                let data = await fetchGeocode(query);
        
        // Fallback strategies for Taiwan addresses
        if (!data || data.length === 0) {
          const roadMatch = address.match(/(.+?[路街大道段])/);
          if (roadMatch) {
            // Try city + district + road
            const fallbackQuery1 = `${selectedCity}${district}${roadMatch[1]}`;
            if (fallbackQuery1 !== query) {
              data = await fetchGeocode(fallbackQuery1);
            }
            // Try city + road (Nominatim sometimes fails with district)
            if (!data || data.length === 0) {
              const fallbackQuery2 = `${selectedCity}${roadMatch[1]}`;
              if (fallbackQuery2 !== fallbackQuery1 && fallbackQuery2 !== query) {
                data = await fetchGeocode(fallbackQuery2);
              }
            }
          }
          // If still fails, try just city + district
          if (!data || data.length === 0) {
            const fallbackQuery3 = `${selectedCity}${district}`;
            if (fallbackQuery3 !== query) {
              data = await fetchGeocode(fallbackQuery3);
            }
          }
        }

        if (data && data.length > 0) {
          const newLat = parseFloat(data[0].lat);
          const newLng = parseFloat(data[0].lon);
          setLat(newLat);
          setLng(newLng);
          setGeocodeStatus('success');
        } else {
          setGeocodeStatus('error');
        }
      } catch {
        setGeocodeStatus('error');
      }
    }, 600);
    return () => { if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current); };
  }, [selectedCity, district, address]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!turnstileToken) {
      alert('請先完成機器人驗證。');
      return;
    }
    
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // Construct layout string
    const rooms = formData.get('layout_rooms') || '0';
    const living = formData.get('layout_living') || '0';
    const baths = formData.get('layout_baths') || '0';
    const kitchens = formData.get('layout_kitchens') || '0';
    const layout = `${rooms}房${living}廳${baths}衛${kitchens}廚`;
    formData.set('layout', layout);
    formData.delete('layout_rooms');
    formData.delete('layout_living');
    formData.delete('layout_baths');
    formData.delete('layout_kitchens');

    // Inject coordinates and turnstile
    formData.set('latitude', String(lat));
    formData.set('longitude', String(lng));
    formData.set('cf-turnstile-response', turnstileToken);

    try {
      const res = await fetch('/api/rentals', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        setSuccess(true);
      } else {
        alert('提交失敗，請稍後再試。');
      }
    } catch (err) {
      console.error(err);
      alert('發生錯誤。');
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="submit-container">
        <div className="glass-panel success-message animate-fade-in">
          <h2>提交成功！</h2>
          <p>您的租屋資訊已經送出，將由管理員審核後發布至平台。</p>
          <a href="/" className="btn-primary">
            返回首頁
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="submit-container animate-fade-in">
      <div className="submit-header">
        <h1>新增實價登錄</h1>
        <p>請填寫您實際租屋的價格與資訊，送出後將由管理員審核，共同建立透明的租屋市場。</p>
      </div>
      
      <div className="glass-panel submit-form">
        <form onSubmit={handleSubmit}>
          
          {/* 基本資料 */}
          <div className="form-section">
            <h3>基本資料</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>縣市 <span style={{color: '#ef4444'}}>*</span></label>
                <select 
                  required 
                  name="city" 
                  className="input-field" 
                  value={selectedCity}
                  onChange={(e) => { setSelectedCity(e.target.value); setDistrict(''); }}
                >
                  <option value="">請選擇縣市</option>
                  {Object.keys(taiwanCities).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>區域 <span style={{color: '#ef4444'}}>*</span></label>
                <select
                  required
                  name="district"
                  className="input-field"
                  disabled={!selectedCity}
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                >
                  <option value="">請選擇區域</option>
                  {selectedCity && taiwanCities[selectedCity]?.map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>詳細地址 <span style={{color: '#ef4444'}}>*</span></label>
                <input
                  required
                  type="text"
                  name="address"
                  placeholder="忠孝東路四段..."
                  className="input-field"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                {/* Geocode status indicator */}
                <div style={{ fontSize: '0.82rem', marginTop: '0.25rem', minHeight: '1.2em' }}>
                  {geocodeStatus === 'loading' && <span style={{ color: 'var(--text-muted)' }}>自動定位中...</span>}
                  {geocodeStatus === 'success' && <span style={{ color: '#10b981' }}>自動定位成功 ({lat.toFixed(4)}, {lng.toFixed(4)})</span>}
                  {geocodeStatus === 'error' && <span style={{ color: '#f59e0b' }}>無法自動定位，建議手動選點</span>}
                </div>
                {/* Optional manual coordinate picker */}
                <label className="checkbox-label-custom" style={{ marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={showMapPicker}
                    onChange={(e) => setShowMapPicker(e.target.checked)}
                  />
                  協助編輯座標（選填）— 拖曳圖釘微調精確位置
                </label>
                {showMapPicker && (
                  <div style={{ marginTop: '0.75rem', border: '1px solid var(--card-border)', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ padding: '0.5rem 0.75rem', background: 'var(--card-bg)', fontSize: '0.82rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--card-border)' }}>
                      點擊地圖或拖曳圖釘來設定座標：{lat.toFixed(5)}, {lng.toFixed(5)}
                    </div>
                    <DraggableMapWrapper lat={lat} lng={lng} onChange={(newLat, newLng) => { setLat(newLat); setLng(newLng); }} />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>型態 <span style={{color: '#ef4444'}}>*</span></label>
                <select name="type" className="input-field">
                  <option>整層住家</option>
                  <option>獨立套房</option>
                  <option>分租套房</option>
                  <option>雅房</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>格局 <span style={{color: '#ef4444'}}>*</span></label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input required type="number" name="layout_rooms" defaultValue="0" min="0" className="input-field" style={{ width: '80px' }} /> 房
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input required type="number" name="layout_living" defaultValue="0" min="0" className="input-field" style={{ width: '80px' }} /> 廳
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input required type="number" name="layout_baths" defaultValue="0" min="0" className="input-field" style={{ width: '80px' }} /> 衛
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input required type="number" name="layout_kitchens" defaultValue="0" min="0" className="input-field" style={{ width: '80px' }} /> 廚
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>樓層 <span style={{color: '#ef4444'}}>*</span></label>
                <input required type="text" name="floor" placeholder="例如：5/12" className="input-field" />
              </div>
            </div>
          </div>

          {/* 登錄者資訊 */}
          <div className="form-section">
            <h3>登錄者資訊</h3>
            <div className="form-grid">
              <div className="form-group" style={{gridColumn: '1 / -1'}}>
                <label>登錄者身分</label>
                <select name="posterRole" className="input-field" defaultValue="renter">
                  <option value="renter">租客</option>
                  <option value="landlord">房東</option>
                  <option value="agent">房仲</option>
                </select>
              </div>
              <div className="form-group" style={{gridColumn: '1 / -1'}}>
                <label>聯絡信箱 (選填)</label>
                <input type="email" name="contactEmail" placeholder="僅供管理員聯絡用，不會對外公開" className="input-field" />
              </div>
            </div>
          </div>

          {/* 租金與規格 */}
          <div className="form-section">
            <h3>租金與規格</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>租金 (月) <span style={{color: '#ef4444'}}>*</span></label>
                <input required type="number" name="price" placeholder="25000" className="input-field" />
              </div>

              <div className="form-group">
                <label>坪數 <span style={{color: '#ef4444'}}>*</span></label>
                <input required type="number" step="0.1" name="area" placeholder="25.5" className="input-field" />
              </div>

              <div className="form-group">
                <label>屋齡 (年)</label>
                <input type="number" name="buildingAge" placeholder="例如：10" className="input-field" />
              </div>

              <div className="form-group">
                <label>性別限制 <span style={{color: '#ef4444'}}>*</span></label>
                <select name="genderRestriction" className="input-field">
                  <option value="none">不限</option>
                  <option value="female">限女</option>
                  <option value="male">限男</option>
                </select>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
                <label className="checkbox-label-custom" style={{ margin: 0 }}>
                  <input type="checkbox" name="agencyFeeCharged" /> 承租需中介費
                </label>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
                <label className="checkbox-label-custom" style={{ margin: 0 }}>
                  <input type="checkbox" name="canSubsidize" /> 可申請租補
                </label>
              </div>
            </div>
          </div>

          {/* 水電收費標準 */}
          <div className="form-section">
            <h3>水電收費標準</h3>
            <div className="utility-grid">
              <fieldset className="utility-card">
                <legend>電費</legend>
                <label className="checkbox-label-custom">
                  <input
                    type="radio"
                    name="electricityBillingType"
                    value="included"
                    checked={electricityBillingType === 'included'}
                    onChange={(e) => setElectricityBillingType(e.target.value)}
                  />
                  包含在房租中
                </label>
                <label className="checkbox-label-custom">
                  <input
                    type="radio"
                    name="electricityBillingType"
                    value="taipower"
                    checked={electricityBillingType === 'taipower'}
                    onChange={(e) => setElectricityBillingType(e.target.value)}
                  />
                  依照台電價格
                </label>
                <label className="checkbox-label-custom">
                  <input
                    type="radio"
                    name="electricityBillingType"
                    value="custom"
                    checked={electricityBillingType === 'custom'}
                    onChange={(e) => setElectricityBillingType(e.target.value)}
                  />
                  其他標準
                </label>
                {electricityBillingType === 'custom' && (
                  <div className="utility-custom-fields animate-fade-in">
                    <div className="form-group">
                      <label>一般收費標準 (元/度)</label>
                      <input required type="number" step="0.1" min="0" name="electricityPricePerKwh" placeholder="例如：5" className="input-field" />
                    </div>
                    <div className="form-group">
                      <label>夏季收費標準 (元/度)</label>
                      <input required type="number" step="0.1" min="0" name="electricitySummerPricePerKwh" placeholder="例如：6.5" className="input-field" />
                    </div>
                  </div>
                )}
              </fieldset>

              <fieldset className="utility-card">
                <legend>水費</legend>
                <label className="checkbox-label-custom">
                  <input
                    type="radio"
                    name="waterBillingType"
                    value="included"
                    checked={waterBillingType === 'included'}
                    onChange={(e) => setWaterBillingType(e.target.value)}
                  />
                  包含在房租中
                </label>
                <label className="checkbox-label-custom">
                  <input
                    type="radio"
                    name="waterBillingType"
                    value="taiwater"
                    checked={waterBillingType === 'taiwater'}
                    onChange={(e) => setWaterBillingType(e.target.value)}
                  />
                  依照台水價格
                </label>
                <label className="checkbox-label-custom">
                  <input
                    type="radio"
                    name="waterBillingType"
                    value="custom"
                    checked={waterBillingType === 'custom'}
                    onChange={(e) => setWaterBillingType(e.target.value)}
                  />
                  其他標準
                </label>
                {waterBillingType === 'custom' && (
                  <div className="utility-custom-fields animate-fade-in">
                    <div className="form-group">
                      <label>一般收費標準 (元/度)</label>
                      <input required type="number" step="0.1" min="0" name="waterPricePerUnit" placeholder="例如：15" className="input-field" />
                    </div>
                    <div className="form-group">
                      <label>夏季收費標準 (元/度)</label>
                      <input required type="number" step="0.1" min="0" name="waterSummerPricePerUnit" placeholder="例如：18" className="input-field" />
                    </div>
                  </div>
                )}
              </fieldset>
            </div>
          </div>

          {/* 房屋特色與條件 */}
          <div className="form-section">
            <h3>房屋特色與條件</h3>
            <div className="checkbox-grid" style={{ marginBottom: '1rem' }}>
              <label className="checkbox-label-custom"><input type="checkbox" name="hasElevator" /> 有電梯</label>
              <label className="checkbox-label-custom"><input type="checkbox" name="hasParking" /> 有車位</label>
              <label className="checkbox-label-custom"><input type="checkbox" name="hasManager" /> 有管理員</label>
              <label className="checkbox-label-custom"><input type="checkbox" name="canPet" /> 可養寵物</label>
              <label className="checkbox-label-custom"><input type="checkbox" name="canCook" /> 可開伙</label>
              <label className="checkbox-label-custom"><input type="checkbox" name="trashService" /> 代收垃圾</label>
              <label className="checkbox-label-custom"><input type="checkbox" name="hasBalcony" /> 有陽台</label>
              <label className="checkbox-label-custom"><input type="checkbox" name="canMoveHuji" /> 可入戶籍</label>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>管理費 (元/月，若無則留空)</label>
                <input type="number" min="0" name="managementFee" placeholder="例如：500 或留空表示無/內含" className="input-field" />
              </div>
            </div>
          </div>

          {/* 提供設備與家具 */}
          <div className="form-section">
            <h3>提供設備與家具</h3>
            <div className="checkbox-grid">
              {['冷氣', '洗衣機', '冰箱', '熱水器', '天然瓦斯', '網路', '第四台', '雙人床', '單人床', '衣櫃', '沙發', '桌椅'].map(eq => (
                <label key={eq} className="checkbox-label-custom">
                  <input type="checkbox" name="equipments" value={eq} /> {eq}
                </label>
              ))}
            </div>
          </div>

          {/* 交通條件 */}
          <div className="form-section">
            <h3>周邊交通</h3>
            <div className="checkbox-grid">
              {['捷運', '公車', '火車', '高鐵', '鄰近停車場'].map(tr => (
                <label key={tr} className="checkbox-label-custom">
                  <input type="checkbox" name="transports" value={tr} /> {tr}
                </label>
              ))}
            </div>
          </div>

          {/* 租期與故事 */}
          <div className="form-section">
            <h3>租期與故事</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>起租日 <span style={{color: '#ef4444'}}>*</span></label>
                <input required type="date" name="startDate" className="input-field" />
              </div>
              <div className="form-group">
                <label>租屋期限 <span style={{color: '#ef4444'}}>*</span></label>
                <select required name="leaseTerm" className="input-field" defaultValue="1">
                  <option value="0.5">半年 (0.5年)</option>
                  <option value="1">1年</option>
                  <option value="2">2年</option>
                  <option value="3">3年以上</option>
                </select>
              </div>
            </div>
          </div>

          {/* 附件上傳 */}
          <div className="form-section">
            <h3>附件上傳 (非必填)</h3>
            <div className="form-group">
              <label>租賃契約書</label>
              <input type="file" name="contractFile" accept=".pdf,image/*" className="input-field" style={{ padding: '0.5rem' }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                為保護您的隱私，上傳前請自行遮蔽身分證字號等敏感個資。此欄位為非必填。
              </p>
            </div>
          </div>

          {/* 惡房東避雷 */}
          <div className="form-section">
            <h3>避雷專區 (非必填)</h3>
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>租屋鬼故事</label>
                <textarea 
                  name="ghostStory" 
                  className="input-field" 
                  placeholder="遇到什麼不合理的事情或是恐怖經歷嗎？分享一下吧！" 
                  rows={4}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="checkbox-label-custom">
                  <input type="checkbox" name="badLandlord" /> <strong>標記為惡房東</strong>
                </label>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  如果您確定這是惡房東，可以打勾標記，提醒其他租客避雷。
                </p>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>證據連結 (如判決書、政府公文、新聞報導)</label>
                <input type="url" name="evidenceLink" className="input-field" placeholder="https://..." />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  附上客觀證據連結能大幅增加可信度，保護自己也保護他人。
                </p>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group" style={{ display: 'flex', justifyContent: 'center' }}>
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                onSuccess={(token) => setTurnstileToken(token)}
                onError={() => {
                  setTurnstileToken('');
                  alert('機器人驗證失敗，請重新整理頁面。');
                }}
                onExpire={() => setTurnstileToken('')}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? '提交中...' : '確認送出'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
