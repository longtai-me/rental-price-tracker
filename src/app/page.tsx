"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { SpinnerGap } from '@phosphor-icons/react';
import { Turnstile } from '@marsidev/react-turnstile';
import MapWrapper from '@/components/map/MapWrapper';
import { PriceTrendChart, TypePieChart } from '@/components/rentals/Charts';
import FilterPanel, { FilterState, initialFilterState } from '@/components/rentals/FilterPanel';
import RentalCard from '@/components/rentals/RentalCard';
import RentalDetailModal from '@/components/rentals/RentalDetailModal';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useToast } from '@/components/ui/Toast';
import { Rental } from '@/types';
import { TAIWAN_DISTRICTS } from '@/data/taiwanDistricts';

// Map specific partial type
type MapRental = Pick<Rental, 'id' | 'lat' | 'lng' | 'price' | 'type' | 'propertyType' | 'posterRole' | 'verificationStatus' | 'agencyFeeCharged'>;

export default function HomePage() {
  // Data States
  const [listData, setListData] = useState<Rental[]>([]);
  const [mapData, setMapData] = useState<MapRental[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Rental | null>(null);
  
  // Filter States
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  
  // Map States
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [bounds, setBounds] = useState<{minLat: number, maxLat: number, minLng: number, maxLng: number} | null>(null);

  // Turnstile overlay state
  const [turnstileVerified, setTurnstileVerified] = useState(false);
  const [overlayDismissing, setOverlayDismissing] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  const { showToast } = useToast();
  
  const CITY_COORDINATES: Record<string, [number, number]> = {
    '台北市': [25.032969, 121.565418],
    '新北市': [25.011985, 121.464673],
    '基隆市': [25.129339, 121.740871],
    '桃園市': [24.993072, 121.301018],
    '新竹市': [24.813829, 120.967480],
    '新竹縣': [24.838323, 121.017725],
    '苗栗縣': [24.564964, 120.820756],
    '台中市': [24.147736, 120.673648],
    '彰化縣': [24.051801, 120.539268],
    '南投縣': [23.903175, 120.690184],
    '雲林縣': [23.709203, 120.431337],
    '嘉義市': [23.480075, 120.449111],
    '嘉義縣': [23.451843, 120.255461],
    '台南市': [22.999728, 120.227028],
    '高雄市': [22.627278, 120.301435],
    '屏東縣': [22.671049, 120.487222],
    '宜蘭縣': [24.731497, 121.758804],
    '花蓮縣': [23.987159, 121.601571],
    '台東縣': [22.758333, 121.144444],
    '澎湖縣': [23.571089, 119.579316],
    '金門縣': [24.432655, 118.322472],
    '連江縣': [26.150537, 119.936054],
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      if (key === 'city') {
        newFilters.district = '';
      }
      return newFilters;
    });
    if (key === 'city' && value && CITY_COORDINATES[value]) {
      setMapCenter(CITY_COORDINATES[value]);
    }
  };

  // Debounced fetch data
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    if (!turnstileVerified) return;
    setLoading(true);
    try {
      // Helper to build query params
      const buildQueryParams = (mode: 'full' | 'map') => {
        const params = new URLSearchParams();
        params.append('mode', mode);
        
        if (filters.city) params.append('city', filters.city);
        if (filters.district) params.append('district', filters.district);
        if (filters.type) params.append('type', filters.type);
        if (filters.propertyType) params.append('propertyType', filters.propertyType);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.minArea) params.append('minArea', filters.minArea);
        if (filters.maxArea) params.append('maxArea', filters.maxArea);
        if (filters.rooms) params.append('rooms', filters.rooms);
        if (filters.hasParking) params.append('hasParking', 'true');
        if (filters.needsSubsidize) params.append('needsSubsidize', 'true');
        if (filters.needsHuji) params.append('needsHuji', 'true');
        if (filters.electricityBillingType && filters.electricityBillingType !== 'all') params.append('electricityBillingType', filters.electricityBillingType);
        if (filters.waterBillingType && filters.waterBillingType !== 'all') params.append('waterBillingType', filters.waterBillingType);
        if (filters.maxElectricityPriceNonSummer) params.append('maxElectricityPriceNonSummer', filters.maxElectricityPriceNonSummer);
        if (filters.maxElectricityPriceSummer) params.append('maxElectricityPriceSummer', filters.maxElectricityPriceSummer);
        if (filters.maxWaterPrice) params.append('maxWaterPrice', filters.maxWaterPrice);
        if (filters.genderRestriction && filters.genderRestriction !== '不限') params.append('genderRestriction', filters.genderRestriction);
        if (filters.verifiedOnly) params.append('verifiedOnly', 'true');
        
        if (filters.transports.length > 0) params.append('transports', filters.transports.join(','));
        if (filters.equipment.length > 0) params.append('equipment', filters.equipment.join(','));
        if (filters.features.length > 0) params.append('features', filters.features.join(','));
        if (filters.posterRoles.length > 0) params.append('posterRoles', filters.posterRoles.join(','));

        // Apply bounds for BOTH map and list modes to prevent full table scan over the whole DB
        if (bounds) {
          params.append('minLat', bounds.minLat.toString());
          params.append('maxLat', bounds.maxLat.toString());
          params.append('minLng', bounds.minLng.toString());
          params.append('maxLng', bounds.maxLng.toString());
        }
        
        return params;
      };

      // Fetch both map pins and full list data in parallel
      const mapParams = buildQueryParams('map');
      const listParams = buildQueryParams('full');
      listParams.append('limit', '50'); // limit list to 50
      
      const [mapRes, listRes] = await Promise.all([
        fetch(`/api/rentals?${mapParams.toString()}`),
        fetch(`/api/rentals?${listParams.toString()}`)
      ]);
      
      if (mapRes.ok) {
        const mapData = await mapRes.json() as any;
        setMapData(mapData.data || []);
      }
      if (listRes.ok) {
        const listData = await listRes.json() as any;
        setListData(listData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('資料載入失敗，請稍後再試', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, bounds, showToast]);

  useEffect(() => {
    if (!turnstileVerified) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetchData();
    }, 500); // 500ms debounce
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [fetchData, turnstileVerified]);

  const handleTurnstileSuccess = () => {
    setTurnstileVerified(true);
    setOverlayDismissing(true);
    setTimeout(() => setShowOverlay(false), 700);
  };

  // Handle map marker click -> fetch full details and show modal
  const handleMarkerClick = async (item: any) => {
    try {
      const res = await fetch(`/api/rentals?id=${item.id}&mode=full`);
      if (res.ok) {
        const data = await res.json() as any;
        if (data.data && data.data.length > 0) {
          setSelectedItem(data.data[0]);
        }
      }
    } catch (error) {
      showToast('無法載入詳細資料', 'error');
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'renter': return '租客';
      case 'agent': return '房仲';
      case 'government': return '內政部';
      case 'landlord': return '房東';
      default: return '未知';
    }
  };

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <>
    {/* ── Turnstile Full-Screen Overlay ── */}
    {siteKey && showOverlay && (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          transition: 'opacity 0.7s ease, backdrop-filter 0.7s ease',
          opacity: overlayDismissing ? 0 : 1,
          pointerEvents: overlayDismissing ? 'none' : 'auto',
        }}
      >
        {/* Animated background blobs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', width: 500, height: 500,
            borderRadius: '50%', top: '-15%', left: '-10%',
            background: 'radial-gradient(circle, rgba(79,70,229,0.35) 0%, transparent 70%)',
            animation: 'pulse 6s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: 400, height: 400,
            borderRadius: '50%', bottom: '-10%', right: '-5%',
            background: 'radial-gradient(circle, rgba(239,68,68,0.25) 0%, transparent 70%)',
            animation: 'pulse 8s ease-in-out infinite 2s',
          }} />
          <div style={{
            position: 'absolute', width: 300, height: 300,
            borderRadius: '50%', top: '40%', right: '20%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
            animation: 'pulse 10s ease-in-out infinite 1s',
          }} />
        </div>

        {/* Card */}
        <div style={{
          position: 'relative',
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 24,
          padding: '48px 40px',
          maxWidth: 440,
          width: '90%',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          textAlign: 'center',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 28 }}>
            <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 32 L32 12 L32 52 H8 Z" fill="#4F46E5" />
              <path d="M38 24 H56 V38 L47 52 L38 38 V24 Z" fill="#EF4444" />
            </svg>
            <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
              <div style={{ fontWeight: 800, fontSize: 22, color: '#fff', letterSpacing: '-0.5px' }}>RentalPrice</div>
              <div style={{ fontWeight: 400, fontSize: 14, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, textTransform: 'uppercase' }}>Tracker</div>
            </div>
          </div>

          {/* Headline */}
          <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.3px' }}>
            歡迎使用租屋資料平台
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
            本平台為社群協作的租屋資料庫。<br />
            請先完成人機驗證以繼續瀏覽。
          </p>

          {/* Turnstile widget */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <Turnstile
              siteKey={siteKey}
              onSuccess={handleTurnstileSuccess}
              options={{ theme: 'dark' }}
            />
          </div>

          {/* Footnote */}
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
            驗證通過後資料將自動載入，無需重新整理
          </p>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.15); opacity: 1; }
          }
        `}</style>
      </div>
    )}

    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* LEFT COLUMN: Filters and Map */}
      <div className="flex-1 min-w-[50%] lg:max-w-[55%] flex flex-col gap-6">
        <FilterPanel 
          filters={filters}
          setFilters={setFilters}
          availableCities={Object.keys(TAIWAN_DISTRICTS)}
          availableDistricts={filters.city ? TAIWAN_DISTRICTS[filters.city] || [] : []}
          showAdvancedFilters={showAdvancedFilters}
          setShowAdvancedFilters={setShowAdvancedFilters}
          onFilterChange={handleFilterChange}
        />

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 relative h-[500px]">
          {loading && (
            <div className="absolute top-4 right-4 z-[999] bg-white px-3 py-1.5 rounded shadow-md flex items-center gap-2 text-sm font-medium text-blue-600 border border-blue-100">
              <SpinnerGap className="animate-spin" size={16} /> 更新地圖...
            </div>
          )}
          <MapWrapper 
            data={mapData as any[]} 
            externalCenter={mapCenter} 
            onBoundsChange={setBounds}
            onMarkerClick={handleMarkerClick}
          />
        </div>
        
        {/* Charts Section */}
        {listData.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 mt-4 overflow-hidden">
            <h3 className="font-bold text-lg text-gray-800 mb-4 border-b pb-2">當前畫面統計分析</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-64 min-w-0">
              <div className="min-w-0 h-full"><PriceTrendChart data={listData} /></div>
              <div className="min-w-0 h-full"><TypePieChart data={listData} /></div>
            </div>
          </div>
        )}

      </div>

      {/* RIGHT COLUMN: List */}
      <div className="flex-[0.8] lg:min-w-[40%] flex flex-col">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3">
            符合條件的房屋
          </h2>
          <div className="text-sm text-gray-500 font-medium">
            共找到 {listData.length} 筆資料 (最多顯示 50 筆)
          </div>
        </div>

        {loading && listData.length === 0 ? (
          <LoadingSkeleton />
        ) : listData.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 text-center text-gray-500">
            在目前的地圖範圍內找不到符合條件的租屋
            <br />
            請嘗試縮放地圖或放寬篩選條件
          </div>
        ) : (
          <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-10" style={{ maxHeight: 'calc(100vh - 120px)' }}>
            {listData.map((item) => (
              <RentalCard 
                key={item.id} 
                item={item} 
                onClick={setSelectedItem} 
                getRoleLabel={getRoleLabel} 
              />
            ))}
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedItem && (
        <RentalDetailModal 
          selectedItem={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          getRoleLabel={getRoleLabel} 
        />
      )}
      
    </div>
    </>
  );
}
