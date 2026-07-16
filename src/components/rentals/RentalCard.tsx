import { MapPin, House, CurrencyDollar, CheckCircle, Warning, Drop, Ghost } from '@phosphor-icons/react';
import { Rental } from '@/types';

interface RentalCardProps {
  item: Rental;
  onClick: (item: Rental) => void;
  getRoleLabel: (role?: string) => string;
}

export default function RentalCard({ item, onClick, getRoleLabel }: RentalCardProps) {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4 relative"
      onClick={() => onClick(item)}
    >
      {/* Price + badges — absolutely positioned top-right, doesn't affect left content height */}
      <div className="absolute top-4 right-4 flex flex-col items-end whitespace-nowrap">
        <div>
          <span className="font-bold text-blue-700 text-lg">NT$ {item.price?.toLocaleString()}</span>
          <span className="text-sm text-gray-500"> /月</span>
        </div>
        <div className="flex flex-col items-end gap-0.5 mt-0.5">
          {item.agencyFeeCharged && (
            <span className="text-xs text-amber-600 font-medium bg-amber-50 px-1.5 rounded">需仲介費</span>
          )}
          {(item.managementFee || item.managementFee === 0) ? (
            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-1.5 rounded">管理費 {item.managementFee}元/月</span>
          ) : item.hasManager ? (
            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-1.5 rounded">有管理員</span>
          ) : null}
        </div>
      </div>

      {/* Left content flows naturally */}
      <h3 className="font-bold text-lg text-gray-800 line-clamp-1 pr-36 mb-1">{item.type}</h3>

      <div className="flex items-center text-gray-600 text-sm mb-1 gap-1 line-clamp-1">
        <MapPin size={14} className="text-blue-600 shrink-0" />
        <span>{item.city}{item.district} {item.address}</span>
      </div>
      
      <div className="flex items-center text-gray-600 text-sm mb-2 gap-1">
        <House size={14} className="text-blue-600 shrink-0" />
        <span>{item.layout} • {item.area} 坪 • {item.floor} {item.totalFloors ? `/ ${item.totalFloors}` : ''} 樓</span>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-auto">
        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
          {getRoleLabel(item.posterRole)}
        </span>
        
        {(item.verificationStatus === 'verified' || item.posterRole === 'government' || item.contractFile) && (
          <span className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded text-xs font-medium">
            <CheckCircle size={14} /> 已驗證
          </span>
        )}
        
        {item.badLandlord && (
          <span className="flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded text-xs font-medium">
            <Warning size={14} /> 惡房東
          </span>
        )}
        
        {item.ghostStory && (
          <span className="flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded text-xs font-medium">
            <Ghost size={14} /> 事故屋/鬼故事
          </span>
        )}
        
        {item.genderRestriction && item.genderRestriction !== '不限' && (
          <span className="bg-pink-50 text-pink-700 border border-pink-200 px-2 py-1 rounded text-xs">
            {item.genderRestriction}
          </span>
        )}
        
        {item.canSubsidize && (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded text-xs">
            可租補
          </span>
        )}
        {item.canMoveHuji && (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded text-xs">
            可入籍
          </span>
        )}
      </div>
    </div>
  );
}
