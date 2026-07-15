'use client';

import { useState, useEffect, useRef } from 'react';
import DraggableMapWrapper from '@/components/map/DraggableMapWrapper';
import { Turnstile } from '@marsidev/react-turnstile';
import { MapPin, CheckCircle, XCircle } from '@phosphor-icons/react';

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
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          console.error("Missing Google Maps API Key");
          return [];
        }
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&key=${apiKey}`
        );
        if (!res.ok) {
          console.error("Geocoding API error:", res.status);
          return [];
        }
        try {
          const data = await res.json() as any;
          if (data.status !== "OK" || !data.results || data.results.length === 0) return [];
          
          const location = data.results[0].geometry.location;
          return [{ lat: location.lat, lon: location.lng }];
        } catch (e) {
          console.error("Geocoding parse error:", e);
          return [];
        }
      };

      try {
        let data = await fetchGeocode(query);
        
        // Fallback strategies for Taiwan addresses (Google Maps API is much better, less fallback needed, but we keep the logic without sleep)
        if (!data || data.length === 0) {
          const roadMatch = address.match(/(.+?(?:路|街|大道)(?:[一二三四五六七八九十0-9]+段)?)/);
          if (roadMatch) {
            // Try city + district + road
            const fallbackQuery1 = `${selectedCity}${district}${roadMatch[1]}`;
            if (fallbackQuery1 !== query) {
              data = await fetchGeocode(fallbackQuery1);
            }
            // Try city + road
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
    }, 1500);
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
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-md w-full text-center animate-fade-in">
          <div className="text-green-500 flex justify-center mb-4">
            <CheckCircle size={64} weight="fill" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">提交成功！</h2>
          <p className="text-gray-600 mb-8">您的租屋資訊已經送出，將由管理員審核後發布至平台。</p>
          <a href="/" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors block text-center">
            返回首頁
          </a>
        </div>
      </div>
    );
  }

  const inputClass = "w-full bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2.5 transition-shadow";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const sectionClass = "bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6";
  const sectionTitleClass = "text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">新增實價登錄</h1>
        <p className="text-gray-600">請填寫您實際租屋的價格與資訊，送出後將由管理員審核，共同建立透明的租屋市場。</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 基本資料 */}
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}><MapPin className="text-blue-500" />基本資料</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>縣市 <span className="text-red-500">*</span></label>
              <select 
                required 
                name="city" 
                className={inputClass} 
                value={selectedCity}
                onChange={(e) => { setSelectedCity(e.target.value); setDistrict(''); }}
              >
                <option value="">請選擇縣市</option>
                {Object.keys(taiwanCities).map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className={labelClass}>區域 <span className="text-red-500">*</span></label>
              <select
                required
                name="district"
                className={inputClass}
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

            <div className="md:col-span-2">
              <label className={labelClass}>詳細地址 <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                name="address"
                placeholder="忠孝東路四段..."
                className={inputClass}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              {/* Geocode status indicator */}
              <div className="mt-1 flex items-center text-sm min-h-[20px]">
                {geocodeStatus === 'loading' && <span className="text-gray-500 animate-pulse">自動定位中...</span>}
                {geocodeStatus === 'success' && <span className="text-green-600 flex items-center gap-1"><CheckCircle /> 自動定位成功 ({lat.toFixed(4)}, {lng.toFixed(4)})</span>}
                {geocodeStatus === 'error' && <span className="text-amber-500 flex items-center gap-1"><XCircle /> 無法自動定位，建議手動選點</span>}
              </div>
              
              <label className="flex items-center gap-2 mt-3 text-sm text-gray-700 cursor-pointer w-max">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={showMapPicker}
                  onChange={(e) => setShowMapPicker(e.target.checked)}
                />
                協助編輯座標（選填）— 拖曳圖釘微調精確位置
              </label>
              
              {showMapPicker && (
                <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-gray-50 px-3 py-2 text-xs text-gray-500 border-b border-gray-200">
                    點擊地圖或拖曳圖釘來設定座標：{lat.toFixed(5)}, {lng.toFixed(5)}
                  </div>
                  <div className="h-[300px] w-full relative z-0">
                    <DraggableMapWrapper lat={lat} lng={lng} onChange={(newLat, newLng) => { setLat(newLat); setLng(newLng); }} />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className={labelClass}>標題 <span className="text-red-500">*</span></label>
              <input required type="text" name="title" placeholder="例如：信義區電梯兩房" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>樓層 <span className="text-red-500">*</span></label>
              <input required type="text" name="floor" placeholder="例如：5/12" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>物件類型 <span className="text-red-500">*</span></label>
              <select name="propertyType" className={inputClass} defaultValue="公寓">
                <option value="公寓">公寓</option>
                <option value="電梯大樓">電梯大樓</option>
                <option value="透天厝">透天厝</option>
                <option value="其他">其他</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>房間類型 <span className="text-red-500">*</span></label>
              <select name="type" className={inputClass} defaultValue="整層住家">
                <option>整層住家</option>
                <option>獨立套房</option>
                <option>分租套房</option>
                <option>雅房</option>
                <option>其他</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>格局 <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <input required type="number" name="layout_rooms" defaultValue="0" min="0" className={`${inputClass} w-20 text-center`} /> <span className="text-gray-700">房</span>
                </div>
                <div className="flex items-center gap-2">
                  <input required type="number" name="layout_living" defaultValue="0" min="0" className={`${inputClass} w-20 text-center`} /> <span className="text-gray-700">廳</span>
                </div>
                <div className="flex items-center gap-2">
                  <input required type="number" name="layout_baths" defaultValue="0" min="0" className={`${inputClass} w-20 text-center`} /> <span className="text-gray-700">衛</span>
                </div>
                <div className="flex items-center gap-2">
                  <input required type="number" name="layout_kitchens" defaultValue="0" min="0" className={`${inputClass} w-20 text-center`} /> <span className="text-gray-700">廚</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 登錄者資訊 */}
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>登錄者資訊</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>登錄者身分</label>
              <select name="posterRole" className={inputClass} defaultValue="renter">
                <option value="renter">租客</option>
                <option value="landlord">房東</option>
                <option value="agent">房仲</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>聯絡信箱 (選填)</label>
              <input type="email" name="contactEmail" placeholder="僅供管理員聯絡用，不會對外公開" className={inputClass} />
            </div>
          </div>
        </div>

        {/* 租金與規格 */}
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>租金與規格</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>租金 (月) <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">NT$</span>
                </div>
                <input required type="number" name="price" placeholder="25000" className={`${inputClass} pl-10`} />
              </div>
            </div>

            <div>
              <label className={labelClass}>坪數 <span className="text-red-500">*</span></label>
              <input required type="number" step="0.1" name="area" placeholder="25.5" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>屋齡 (年)</label>
              <input type="number" name="buildingAge" placeholder="例如：10" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>性別限制 <span className="text-red-500">*</span></label>
              <select name="genderRestriction" className={inputClass} defaultValue="none">
                <option value="none">不限</option>
                <option value="female">限女</option>
                <option value="male">限男</option>
              </select>
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="agencyFeeCharged" className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="text-gray-700 font-medium">承租需中介費</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="canSubsidize" className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="text-gray-700 font-medium">可申請租補</span>
              </label>
            </div>
          </div>
        </div>

        {/* 水電收費標準 */}
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>水電收費標準</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-3">電費</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="electricityBillingType" value="included" checked={electricityBillingType === 'included'} onChange={(e) => setElectricityBillingType(e.target.value)} className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">包含在房租中</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="electricityBillingType" value="taipower" checked={electricityBillingType === 'taipower'} onChange={(e) => setElectricityBillingType(e.target.value)} className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">依照台電價格</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="electricityBillingType" value="custom" checked={electricityBillingType === 'custom'} onChange={(e) => setElectricityBillingType(e.target.value)} className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">其他標準</span>
                </label>
              </div>
              {electricityBillingType === 'custom' && (
                <div className="mt-4 space-y-3 bg-white p-3 rounded border border-blue-100">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">一般收費 (元/度)</label>
                    <input required type="number" step="0.1" min="0" name="electricityPricePerKwh" placeholder="例如：5" className="w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 p-2 border" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">夏季收費 (元/度)</label>
                    <input required type="number" step="0.1" min="0" name="electricitySummerPricePerKwh" placeholder="例如：6.5" className="w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 p-2 border" />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-cyan-50/50 p-4 rounded-lg border border-cyan-100">
              <h4 className="font-semibold text-cyan-800 mb-3">水費</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="waterBillingType" value="included" checked={waterBillingType === 'included'} onChange={(e) => setWaterBillingType(e.target.value)} className="w-4 h-4 text-cyan-600" />
                  <span className="text-gray-700">包含在房租中</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="waterBillingType" value="taiwater" checked={waterBillingType === 'taiwater'} onChange={(e) => setWaterBillingType(e.target.value)} className="w-4 h-4 text-cyan-600" />
                  <span className="text-gray-700">依照台水價格</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="waterBillingType" value="custom" checked={waterBillingType === 'custom'} onChange={(e) => setWaterBillingType(e.target.value)} className="w-4 h-4 text-cyan-600" />
                  <span className="text-gray-700">其他標準</span>
                </label>
              </div>
              {waterBillingType === 'custom' && (
                <div className="mt-4 space-y-3 bg-white p-3 rounded border border-cyan-100">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">一般收費 (元/度)</label>
                    <input required type="number" step="0.1" min="0" name="waterPricePerUnit" placeholder="例如：15" className="w-full text-sm border-gray-300 rounded focus:ring-cyan-500 focus:border-cyan-500 p-2 border" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">夏季收費 (元/度)</label>
                    <input required type="number" step="0.1" min="0" name="waterSummerPricePerUnit" placeholder="例如：18" className="w-full text-sm border-gray-300 rounded focus:ring-cyan-500 focus:border-cyan-500 p-2 border" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 房屋特色與條件 */}
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>房屋特色與條件</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
            {[
              { id: 'hasElevator', label: '有電梯' },
              { id: 'hasParking', label: '有車位' },
              { id: 'hasManager', label: '有管理員' },
              { id: 'canPet', label: '可養寵物' },
              { id: 'canCook', label: '可開伙' },
              { id: 'trashService', label: '代收垃圾' },
              { id: 'hasBalcony', label: '有陽台' },
              { id: 'canMoveHuji', label: '可入戶籍' },
            ].map(item => (
              <label key={item.id} className="flex items-center gap-2 cursor-pointer bg-gray-50 p-2 rounded border border-gray-100 hover:bg-gray-100 transition-colors">
                <input type="checkbox" name={item.id} className="w-4 h-4 text-blue-600 rounded" /> 
                <span className="text-gray-700 text-sm">{item.label}</span>
              </label>
            ))}
          </div>
          <div className="md:w-1/2">
            <label className={labelClass}>管理費 (元/月，若無則留空)</label>
            <input type="number" min="0" name="managementFee" placeholder="例如：500 或留空" className={inputClass} />
          </div>
        </div>

        {/* 提供設備與家具 */}
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>提供設備與家具</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {['冷氣', '洗衣機', '冰箱', '熱水器', '天然瓦斯', '網路', '第四台', '雙人床', '單人床', '衣櫃', '沙發', '桌椅'].map(eq => (
              <label key={eq} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="equipments" value={eq} className="w-4 h-4 text-blue-600 rounded" /> 
                <span className="text-gray-700 text-sm">{eq}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 交通條件 */}
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>周邊交通</h3>
          <div className="flex flex-wrap gap-4">
            {['捷運', '公車', '火車', '高鐵', '鄰近停車場'].map(tr => (
              <label key={tr} className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded border border-gray-100 hover:bg-gray-100 transition-colors">
                <input type="checkbox" name="transports" value={tr} className="w-4 h-4 text-blue-600 rounded" /> 
                <span className="text-gray-700 text-sm">{tr}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 租期與故事 */}
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>租期</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>起租日 <span className="text-red-500">*</span></label>
              <input required type="date" name="startDate" max="9999-12-31" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>租屋期限 <span className="text-red-500">*</span></label>
              <select required name="leaseTerm" className={inputClass} defaultValue="1">
                <option value="0.5">半年 (0.5年)</option>
                <option value="1">1年</option>
                <option value="2">2年</option>
                <option value="3">3年以上</option>
              </select>
            </div>
          </div>
        </div>

        {/* 附件上傳 */}
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>附件證明 (非必填)</h3>
          <div>
            <label className={labelClass}>租賃契約書 / 水電費帳單 / 其他證明</label>
            <input type="file" name="contractFile" accept=".pdf,image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors" />
            <p className="text-sm text-gray-500 mt-2">
              為保護您的隱私，上傳前請<strong className="text-gray-700">自行遮蔽身分證字號、真實姓名等敏感個資</strong>。附上證明會大幅增加資料可信度。
            </p>
          </div>
        </div>

        {/* 避雷專區 */}
        <div className="bg-red-50 p-6 rounded-xl border border-red-100 shadow-sm mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <h3 className="text-xl font-bold text-red-800 mb-4 pb-2 border-b border-red-200">避雷專區 (非必填)</h3>
          <div className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-medium text-red-800 mb-1">租屋鬼故事 / 避雷心得</label>
              <textarea 
                name="ghostStory" 
                className="w-full bg-white border border-red-200 text-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 p-3 transition-shadow" 
                placeholder="遇到什麼不合理的事情或是恐怖經歷嗎？分享一下吧！" 
                rows={4}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer text-red-800 font-bold bg-white/60 p-3 rounded-lg border border-red-200">
                <input type="checkbox" name="badLandlord" className="w-5 h-5 text-red-600 rounded focus:ring-red-500" /> 
                標記為惡房東
              </label>
              <p className="text-sm text-red-600 mt-1 pl-2">
                如果您確定這是惡房東，可以打勾標記，提醒其他租客避雷。
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-red-800 mb-1">證據連結 (如判決書、政府公文、新聞報導)</label>
              <input type="url" name="evidenceLink" className="w-full bg-white border border-red-200 text-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 p-3 transition-shadow" placeholder="https://..." />
              <p className="text-sm text-red-600 mt-1 pl-2">
                附上客觀證據連結能大幅增加可信度，保護自己也保護他人。
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-8">
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

        <div className="flex justify-center sticky bottom-6 z-20">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto min-w-[200px] bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                處理中...
              </span>
            ) : '確認送出'}
          </button>
        </div>
      </form>
    </div>
  );
}
