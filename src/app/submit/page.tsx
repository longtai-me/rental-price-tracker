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

          {/* 刊登者資訊 */}
          <div className="form-section">
            <h3>刊登者資訊</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>刊登者身分</label>
                <select name="posterRole" className="input-field">
                  <option value="landlord">房東</option>
                  <option value="renter">租客 (轉租/找室友)</option>
                  <option value="agent">房仲</option>
                </select>
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
                <label className="checkbox-label-custom" style={{ margin: 0 }}>
                  <input type="checkbox" name="agencyFeeCharged" /> 承租需收取仲介費
                </label>
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

          {/* 房屋特色與條件 */}
          <div className="form-section">
            <h3>房屋特色與條件</h3>
            <div className="checkbox-grid">
              <label className="checkbox-label-custom"><input type="checkbox" name="includesWater" /> 含水費</label>
              <label className="checkbox-label-custom"><input type="checkbox" name="includesElectricity" /> 含電費</label>
              <label className="checkbox-label-custom"><input type="checkbox" name="hasElevator" /> 有電梯</label>
              <label className="checkbox-label-custom"><input type="checkbox" name="hasParking" /> 有車位</label>
              <label className="checkbox-label-custom"><input type="checkbox" name="canPet" /> 可養寵物</label>
              <label className="checkbox-label-custom"><input type="checkbox" name="canCook" /> 可開伙</label>
              <label className="checkbox-label-custom"><input type="checkbox" name="trashService" /> 代收垃圾</label>
              <label className="checkbox-label-custom"><input type="checkbox" name="hasBalcony" /> 有陽台</label>
              <label className="checkbox-label-custom"><input type="checkbox" name="canMoveHuji" /> 可入戶籍</label>
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
