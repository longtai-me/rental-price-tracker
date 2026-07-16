import { Rental } from '@/types';
import { X, CheckCircle, XCircle, Lightning, Ghost, Link as LinkIcon, Buildings, Ruler, Car, CurrencyDollar, MapPin, Drop } from '@phosphor-icons/react';

interface RentalDetailModalProps {
  selectedItem: Rental;
  onClose: () => void;
  getRoleLabel: (role?: string) => string;
}

export default function RentalDetailModal({ selectedItem, onClose, getRoleLabel }: RentalDetailModalProps) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl relative z-10 flex flex-col overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 line-clamp-1">{selectedItem.type}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X size={24} weight="bold" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {/* Top basic info */}
          <div className="bg-gray-50 rounded-lg p-5 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div className="text-3xl font-bold text-blue-700">
                NT$ {selectedItem.price?.toLocaleString()} 
                <span className="text-lg text-gray-500 font-normal"> /月</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-medium">
                  {getRoleLabel(selectedItem.posterRole)}
                </span>
                {(selectedItem.verificationStatus === 'verified' || selectedItem.posterRole === 'government' || selectedItem.contractFile) && (
                  <span className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded text-sm font-medium">
                    <CheckCircle size={16} /> 已驗證
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
              <div className="flex items-center gap-2">
                <MapPin size={20} className="text-blue-500 shrink-0" />
                <span>{selectedItem.city}{selectedItem.district} {selectedItem.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Buildings size={20} className="text-blue-500 shrink-0" />
                <span>{selectedItem.layout} • {selectedItem.floor} {selectedItem.totalFloors ? `/ ${selectedItem.totalFloors}` : ''} 樓</span>
              </div>
              <div className="flex items-center gap-2">
                <Ruler size={20} className="text-blue-500 shrink-0" />
                <span>{selectedItem.area} 坪 (約 {Math.round(selectedItem.pricePerPing)} 元/坪)</span>
              </div>
              <div className="flex items-center gap-2">
                <Buildings size={20} className="text-blue-500 shrink-0" />
                <span>{selectedItem.propertyType} • {selectedItem.buildingAge} 年</span>
              </div>
            </div>
          </div>
          
          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4">
              {/* Cost Details */}
              <div className="flex gap-3">
                <CurrencyDollar size={24} className="text-gray-400 shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">費用說明</h4>
                  <ul className="text-gray-800 space-y-1">
                    <li>管理費：{(selectedItem.managementFee || selectedItem.managementFee === 0) ? `${selectedItem.managementFee} 元/月` : (selectedItem.hasManager ? '有管理員 (費用含在租金或未標示)' : '無管理費')}</li>
                    <li>仲介費：{selectedItem.agencyFeeCharged ? '需收取仲介費' : '免仲介費'}</li>
                  </ul>
                </div>
              </div>
              
              {/* Utilities */}
              <div className="flex gap-3">
                <Drop size={24} className="text-blue-400 shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">水電費計算</h4>
                  <p className="text-gray-800">{selectedItem.utilityBilling}</p>
                </div>
              </div>

              {/* Traffic */}
              <div className="flex gap-3">
                <Car size={24} className="text-gray-400 shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">交通與周邊</h4>
                  <p className="text-gray-800">
                    {selectedItem.transportation && selectedItem.transportation.length > 0 
                      ? selectedItem.transportation.join('、') 
                      : '無特別標註'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Equipment */}
              <div className="flex gap-3">
                <CheckCircle size={24} className="text-green-500 shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">提供設備</h4>
                  <p className="text-gray-800">
                    {selectedItem.equipment && selectedItem.equipment.length > 0 
                      ? selectedItem.equipment.join('、') 
                      : '無特別標註'}
                  </p>
                </div>
              </div>
              
              {/* Rules & Features */}
              <div className="flex gap-3">
                <CheckCircle size={24} className="text-amber-500 shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">房屋特色與規定</h4>
                  <p className="text-gray-800">
                    {[
                      ...(selectedItem.features?.filter(f => f !== '有管理員' && !f.startsWith('管理費:')) || []),
                      selectedItem.hasElevator ? '有電梯' : null,
                      selectedItem.hasBalcony ? '有陽台' : null,
                      selectedItem.hasParking ? '有車位' : null,
                      selectedItem.canCook ? '可開伙' : null,
                      selectedItem.canPet ? '可養寵物' : null,
                      selectedItem.trashService ? '子母車' : null,
                      selectedItem.canMoveHuji ? '可入籍' : null,
                      selectedItem.canSubsidize ? '可租補' : null,
                      selectedItem.genderRestriction !== '不限' ? selectedItem.genderRestriction : null
                    ].filter(Boolean).join('、') || '無特別標註'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Warnings */}
            {(selectedItem.badLandlord || selectedItem.ghostStory) && (
              <div className="md:col-span-2 space-y-4 mt-2">
                {selectedItem.badLandlord && (
                  <div className="flex gap-3 bg-red-50 p-4 rounded-lg border border-red-200">
                    <XCircle size={24} className="text-red-600 shrink-0 mt-1" />
                    <div>
                      <h4 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-1">惡房東</h4>
                      <p className="text-gray-800 font-semibold">此物件被標記為惡房東！</p>
                      {selectedItem.evidenceLink && (
                        <a 
                          href={selectedItem.evidenceLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline mt-2 text-sm"
                        >
                          <LinkIcon size={16} /> 點此查看證據 (判決書/公文/新聞)
                        </a>
                      )}
                    </div>
                  </div>
                )}
                
                {selectedItem.ghostStory && (
                  <div className="flex gap-3 bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <Lightning size={24} className="text-purple-600 shrink-0 mt-1" />
                    <div>
                      <h4 className="text-sm font-bold text-purple-600 flex items-center gap-1 uppercase tracking-wider mb-1">
                        <Ghost size={18} /> 租屋鬼故事 / 恐怖經歷
                      </h4>
                      <p className="text-gray-800 italic whitespace-pre-wrap leading-relaxed">
                        {selectedItem.ghostStory}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
