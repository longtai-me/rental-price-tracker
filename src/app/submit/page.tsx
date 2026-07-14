'use client';

import { useState } from 'react';
import './submit.css';

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
        <h1>刊登租屋資訊</h1>
        <p>請填寫完整的租屋資訊，送出後將由管理員審核。</p>
      </div>
      
      <div className="glass-panel submit-form">
        <form onSubmit={handleSubmit}>
          
          {/* 基本資料 */}
          <div className="form-section">
            <h3>基本資料</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>縣市</label>
                <input required type="text" name="city" placeholder="例如：台北市" className="input-field" />
              </div>
              
              <div className="form-group">
                <label>區域</label>
                <input required type="text" name="district" placeholder="例如：大安區" className="input-field" />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>詳細地址</label>
                <input required type="text" name="address" placeholder="忠孝東路四段..." className="input-field" />
              </div>

              <div className="form-group">
                <label>型態</label>
                <select name="type" className="input-field">
                  <option>整層住家</option>
                  <option>獨立套房</option>
                  <option>分租套房</option>
                  <option>雅房</option>
                </select>
              </div>

              <div className="form-group">
                <label>格局</label>
                <input required type="text" name="layout" placeholder="例如：2房1廳1衛" className="input-field" />
              </div>

              <div className="form-group">
                <label>樓層</label>
                <input required type="text" name="floor" placeholder="例如：5/12" className="input-field" />
              </div>
            </div>
          </div>

          {/* 租金與規格 */}
          <div className="form-section">
            <h3>租金與規格</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>租金 (月)</label>
                <input required type="number" name="price" placeholder="25000" className="input-field" />
              </div>

              <div className="form-group">
                <label>坪數</label>
                <input required type="number" step="0.1" name="area" placeholder="25.5" className="input-field" />
              </div>

              <div className="form-group">
                <label>屋齡 (年)</label>
                <input required type="number" name="buildingAge" placeholder="10" className="input-field" />
              </div>

              <div className="form-group">
                <label>性別限制</label>
                <select name="genderRestriction" className="input-field">
                  <option value="none">不限</option>
                  <option value="female">限女</option>
                  <option value="male">限男</option>
                </select>
              </div>
            </div>
          </div>

          {/* 設備與條件 checkboxes */}
          <div className="form-section">
            <h3>設備與條件</h3>
            <div className="checkbox-grid">
              <label className="checkbox-label-custom">
                <input type="checkbox" name="includesWater" /> 含水費
              </label>
              <label className="checkbox-label-custom">
                <input type="checkbox" name="includesElectricity" /> 含電費
              </label>
              <label className="checkbox-label-custom">
                <input type="checkbox" name="hasElevator" /> 有電梯
              </label>
              <label className="checkbox-label-custom">
                <input type="checkbox" name="hasParking" /> 有車位
              </label>
              <label className="checkbox-label-custom">
                <input type="checkbox" name="canPet" /> 可養寵物
              </label>
              <label className="checkbox-label-custom">
                <input type="checkbox" name="canCook" /> 可開伙
              </label>
              <label className="checkbox-label-custom">
                <input type="checkbox" name="trashService" /> 代收垃圾
              </label>
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
