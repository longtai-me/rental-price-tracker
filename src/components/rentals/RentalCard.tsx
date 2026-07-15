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
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{item.type}</h3>
        <div className="text-right whitespace-nowrap">
          <span className="font-bold text-blue-700 text-lg">NT$ {item.price?.toLocaleString()}</span>
          <span className="text-sm text-gray-500"> /月</span>
          {item.agencyFeeCharged && (
            <div className="text-xs text-amber-600 font-medium">需仲介費</div>
          )}
        </div>
      </div>
      
      <div className="flex items-center text-gray-600 text-sm mb-2 gap-1 line-clamp-1">
        <MapPin size={16} className="text-blue-600 shrink-0" />
        <span>{item.city}{item.district} {item.address}</span>
      </div>
      
      <div className="flex items-center text-gray-600 text-sm mb-3 gap-1">
        <House size={16} className="text-blue-600 shrink-0" />
        <span>{item.layout} • {item.area} 坪 • {item.floor} 樓</span>
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
