import { MapPin, House, CurrencyDollar, CheckCircle, Warning, Drop, Ghost } from '@phosphor-icons/react';
import React, { Dispatch, SetStateAction } from 'react';

export interface FilterState {
  city: string;
  district: string;
  type: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  rooms: string;
  hasParking: boolean;
  needsSubsidize: boolean;
  needsHuji: boolean;
  electricityBillingType: string;
  waterBillingType: string;
  maxElectricityPriceSummer: string;
  maxElectricityPriceNonSummer: string;
  maxWaterPrice: string;
  transports: string[];
  equipment: string[];
  features: string[];
  genderRestriction: string;
  posterRoles: string[];
  verifiedOnly: boolean;
}

export const initialFilterState: FilterState = {
  city: '',
  district: '',
  type: '',
  propertyType: '',
  minPrice: '',
  maxPrice: '',
  minArea: '',
  maxArea: '',
  rooms: '',
  hasParking: false,
  needsSubsidize: false,
  needsHuji: false,
  electricityBillingType: 'all',
  waterBillingType: 'all',
  maxElectricityPriceSummer: '',
  maxElectricityPriceNonSummer: '',
  maxWaterPrice: '',
  transports: [],
  equipment: [],
  features: [],
  genderRestriction: '不限',
  posterRoles: ['renter', 'agent', 'landlord', 'government'],
  verifiedOnly: false
};

interface FilterPanelProps {
  filters: FilterState;
  setFilters: Dispatch<SetStateAction<FilterState>>;
  availableCities: string[];
  availableDistricts: string[];
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (show: boolean) => void;
  onFilterChange: (key: keyof FilterState, value: any) => void;
}

export default function FilterPanel({ 
  filters, 
  availableCities, 
  availableDistricts,
  showAdvancedFilters, 
  setShowAdvancedFilters, 
  onFilterChange 
}: FilterPanelProps) {
  
  const handleCheckboxArray = (key: 'transports' | 'equipment' | 'features' | 'posterRoles', value: string) => {
    const currentArray = filters[key];
    if (currentArray.includes(value)) {
      onFilterChange(key, currentArray.filter(v => v !== value));
    } else {
      onFilterChange(key, [...currentArray, value]);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 mb-6">
      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">縣市</label>
          <select 
            value={filters.city} 
            onChange={(e) => onFilterChange('city', e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
          >
            <option value="">全部縣市</option>
            {availableCities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">行政區</label>
          <select 
            value={filters.district} 
            onChange={(e) => onFilterChange('district', e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            disabled={!filters.city}
          >
            <option value="">全部行政區</option>
            {availableDistricts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">類型</label>
          <select 
            value={filters.type} 
            onChange={(e) => onFilterChange('type', e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
          >
            <option value="">全部</option>
            <option value="整層住家">整層住家</option>
            <option value="獨立套房">獨立套房</option>
            <option value="分租套房">分租套房</option>
            <option value="雅房">雅房</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">最低租金</label>
          <input 
            type="number" 
            placeholder="Min" 
            value={filters.minPrice} 
            onChange={(e) => onFilterChange('minPrice', e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">最高租金</label>
          <input 
            type="number" 
            placeholder="Max" 
            value={filters.maxPrice} 
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <button 
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center transition-colors"
        >
          {showAdvancedFilters ? '隱藏進階篩選 ▲' : '顯示進階篩選 ▼'}
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 animate-fade-in space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Grid 1: Basic attributes */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 border-b pb-2">基本屬性</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">最小坪數</label>
                  <input type="number" placeholder="Min" value={filters.minArea} onChange={(e) => onFilterChange('minArea', e.target.value)} className="w-full text-sm bg-gray-50 border border-gray-300 rounded p-2" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">最大坪數</label>
                  <input type="number" placeholder="Max" value={filters.maxArea} onChange={(e) => onFilterChange('maxArea', e.target.value)} className="w-full text-sm bg-gray-50 border border-gray-300 rounded p-2" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">房間數</label>
                <select value={filters.rooms} onChange={(e) => onFilterChange('rooms', e.target.value)} className="w-full text-sm bg-gray-50 border border-gray-300 rounded p-2">
                  <option value="">不限</option>
                  <option value="1">1房</option>
                  <option value="2">2房</option>
                  <option value="3">3房</option>
                  <option value="4+">4房以上</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">物件型態</label>
                <select value={filters.propertyType} onChange={(e) => onFilterChange('propertyType', e.target.value)} className="w-full text-sm bg-gray-50 border border-gray-300 rounded p-2">
                  <option value="">全部</option>
                  <option value="公寓">公寓</option>
                  <option value="電梯大樓">電梯大樓</option>
                  <option value="透天厝">透天厝</option>
                  <option value="別墅">別墅</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">性別限制</label>
                <select value={filters.genderRestriction} onChange={(e) => onFilterChange('genderRestriction', e.target.value)} className="w-full text-sm bg-gray-50 border border-gray-300 rounded p-2">
                  <option value="不限">不限</option>
                  <option value="限女">限女</option>
                  <option value="限男">限男</option>
                </select>
              </div>
            </div>

            {/* Grid 2: Utilities */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 border-b pb-2">水電與費用</h4>
              
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="block text-xs font-medium text-gray-500">電費計費方式</label>
                  <select value={filters.electricityBillingType} onChange={(e) => onFilterChange('electricityBillingType', e.target.value)} className="w-full text-sm bg-gray-50 border border-gray-300 rounded p-2">
                    <option value="all">不限</option>
                    <option value="official">台電</option>
                    <option value="non-official">自訂費率 (一度電)</option>
                    <option value="included">租金包電</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="block text-xs font-medium text-gray-500">水費計費方式</label>
                  <select value={filters.waterBillingType} onChange={(e) => onFilterChange('waterBillingType', e.target.value)} className="w-full text-sm bg-gray-50 border border-gray-300 rounded p-2">
                    <option value="all">不限</option>
                    <option value="official">台水</option>
                    <option value="non-official">自訂費率</option>
                    <option value="included">租金包水</option>
                  </select>
                </div>
              </div>
              
              {filters.electricityBillingType === 'non-official' && (
                <div className="space-y-2 p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="text-xs font-medium text-gray-700 mb-2">最高接受電費費率</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" placeholder="非夏月電費/度" value={filters.maxElectricityPriceNonSummer} onChange={(e) => onFilterChange('maxElectricityPriceNonSummer', e.target.value)} className="w-full text-xs bg-white border border-gray-300 rounded p-1.5" />
                    <input type="number" placeholder="夏月電費/度" value={filters.maxElectricityPriceSummer} onChange={(e) => onFilterChange('maxElectricityPriceSummer', e.target.value)} className="w-full text-xs bg-white border border-gray-300 rounded p-1.5" />
                  </div>
                </div>
              )}

              {filters.waterBillingType === 'non-official' && (
                <div className="space-y-2 p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="text-xs font-medium text-gray-700 mb-2">最高接受水費費率</div>
                  <input type="number" placeholder="水費/人 或 水費/度" value={filters.maxWaterPrice} onChange={(e) => onFilterChange('maxWaterPrice', e.target.value)} className="w-full text-xs bg-white border border-gray-300 rounded p-1.5" />
                </div>
              )}
              
            </div>

            {/* Grid 3: Checkboxes */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 border-b pb-2">其他條件</h4>
              
              <div className="flex flex-col gap-3 mt-4">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={filters.verifiedOnly} onChange={(e) => onFilterChange('verifiedOnly', e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                  <span>只顯示已驗證資訊</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={filters.needsSubsidize} onChange={(e) => onFilterChange('needsSubsidize', e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                  <span>必須可申請租金補貼</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={filters.needsHuji} onChange={(e) => onFilterChange('needsHuji', e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                  <span>必須可入戶籍</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={filters.hasParking} onChange={(e) => onFilterChange('hasParking', e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                  <span>必須有車位</span>
                </label>
              </div>

              <h4 className="font-semibold text-gray-800 border-b pb-2 mt-4">來源過濾</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'renter', label: '租客登錄' },
                  { id: 'agent', label: '房仲登錄' },
                  { id: 'landlord', label: '房東登錄' },
                  { id: 'government', label: '內政部資料' }
                ].map(role => (
                  <label key={role.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={filters.posterRoles.includes(role.id)} 
                      onChange={() => handleCheckboxArray('posterRoles', role.id)} 
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                    />
                    <span>{role.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
