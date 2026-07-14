'use client';

import { useState } from 'react';

export default function SubmitPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Process booleans and numbers
    const processedData = {
      ...data,
      area: parseFloat(data.area as string),
      price: parseInt(data.price as string),
      buildingAge: parseInt(data.buildingAge as string),
      includesWater: data.includesWater === 'on',
      includesElectricity: data.includesElectricity === 'on',
      hasParking: data.hasParking === 'on',
      hasElevator: data.hasElevator === 'on',
      canCook: data.canCook === 'on',
      hasBalcony: data.hasBalcony === 'on',
      canMoveHuji: data.canMoveHuji === 'on',
      canPet: data.canPet === 'on',
      trashService: data.trashService === 'on',
    };

    try {
      const res = await fetch('/api/rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData)
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">提交成功！</h2>
          <p className="text-gray-600 mb-6">您的租屋資訊已經送出，將由管理員審核後發布至平台。</p>
          <a href="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            返回首頁
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h1 className="text-2xl font-bold text-gray-900">刊登租屋資訊</h1>
          <p className="text-sm text-gray-500 mt-1">請填寫完整的租屋資訊，送出後將由管理員審核。</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 基本資料 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">基本資料</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">縣市</label>
                <input required type="text" name="city" placeholder="例如：台北市" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">區域</label>
                <input required type="text" name="district" placeholder="例如：大安區" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">詳細地址</label>
                <input required type="text" name="address" placeholder="忠孝東路四段..." className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">型態</label>
                <select name="type" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white">
                  <option>整層住家</option>
                  <option>獨立套房</option>
                  <option>分租套房</option>
                  <option>雅房</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">格局</label>
                <input required type="text" name="layout" placeholder="例如：2房1廳1衛" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">樓層</label>
                <input required type="text" name="floor" placeholder="例如：5/12" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
              </div>
            </div>

            {/* 租金與規格 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">租金與規格</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700">租金 (月)</label>
                <input required type="number" name="price" placeholder="25000" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">坪數</label>
                <input required type="number" step="0.1" name="area" placeholder="25.5" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">屋齡 (年)</label>
                <input required type="number" name="buildingAge" placeholder="10" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">性別限制</label>
                <select name="genderRestriction" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white">
                  <option value="none">不限</option>
                  <option value="female">限女</option>
                  <option value="male">限男</option>
                </select>
              </div>
            </div>
          </div>

          {/* 設備與條件 checkboxes */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">設備與條件</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="includesWater" className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                <span className="text-sm text-gray-700">含水費</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="includesElectricity" className="rounded border-gray-300 text-blue-600 shadow-sm" />
                <span className="text-sm text-gray-700">含電費</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="hasElevator" className="rounded border-gray-300 text-blue-600 shadow-sm" />
                <span className="text-sm text-gray-700">有電梯</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="hasParking" className="rounded border-gray-300 text-blue-600 shadow-sm" />
                <span className="text-sm text-gray-700">有車位</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="canPet" className="rounded border-gray-300 text-blue-600 shadow-sm" />
                <span className="text-sm text-gray-700">可養寵物</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="canCook" className="rounded border-gray-300 text-blue-600 shadow-sm" />
                <span className="text-sm text-gray-700">可開伙</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="trashService" className="rounded border-gray-300 text-blue-600 shadow-sm" />
                <span className="text-sm text-gray-700">代收垃圾</span>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 flex justify-end space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? '提交中...' : '確認送出'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
