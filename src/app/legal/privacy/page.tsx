export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 px-8 py-10 text-white">
          <h1 className="text-3xl font-bold mb-2">隱私權政策</h1>
          <p className="text-blue-100">最後更新日期：2026年7月</p>
        </div>

        <div className="px-8 py-10 space-y-8 text-gray-700">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">1. 隱私權保護政策的適用範圍</h2>
            <p className="leading-relaxed">
              隱私權保護政策內容，包括本網站（以下簡稱「本平台」，為一開源專案 Open Source Project）如何處理在您使用網站服務時收集到的個人識別資料。隱私權保護政策不適用於本平台以外的相關連結網站，也不適用於非本平台所委託或參與管理的人員。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">2. 個人資料的蒐集、處理及利用方式</h2>
            <p className="leading-relaxed mb-4">
              當您造訪本平台或使用本平台所提供之功能服務時，我們將視該服務功能性質，請您提供必要的資料，並在該特定目的範圍內處理及利用您的資料；非經您書面同意，本平台不會將您的資料用於其他用途。
            </p>
            <ul className="list-disc pl-6 space-y-3">
              <li><strong className="text-gray-900">租屋資料提交</strong>：當您提交租屋實價資訊時，本平台會蒐集您填寫的地址、租金、格局、水電費及選填的聯絡信箱 (Email) 等資訊。</li>
              <li><strong className="text-gray-900">合約檔案上傳</strong>：若您選擇上傳租約或相關證明文件作為佐證，檔案將會被加密存儲於雲端，僅供平台管理員進行資料真實性審核之用。</li>
              <li><strong className="text-gray-900">自動蒐集資訊 (連線與 IP 紀錄)</strong>：於一般瀏覽時，伺服器會自行記錄相關行徑，包括您使用連線設備的 IP 位址、使用時間、使用的瀏覽器、瀏覽及點選資料記錄等。特別是針對本平台之管理後台 (Admin) 或是特定提交端點，系統會強制紀錄存取之 IP 位址，此為防範惡意攻擊、機器人濫用，以作為增進網站服務及安全防護的參考依據，此記錄為內部應用，決不對外公開。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">3. 地圖座標與定位資訊</h2>
            <p className="leading-relaxed">
              當您提交地址後，系統會將該地址轉換為經緯度座標並公開展示於地圖上，以利其他使用者透過地圖尋找租屋資訊。為確保您的居住安全，我們建議您在提供證據或聯絡方式時自行留意個人隱私保護。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">4. 資料之保護與儲存</h2>
            <p className="leading-relaxed">
              本平台的主機均設有各項資訊安全設備及必要的安全防護措施，保護您的資料。包含租屋資料與合約檔案，皆儲存於國際級雲端服務 (Cloudflare D1 與 R2) 之中。針對遭惡意破壞或意圖偽造的資料，平台管理員具備審核與管理權限。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">5. 與第三人共用個人資料之政策</h2>
            <p className="leading-relaxed">
              本平台絕不會提供、交換、出租或出售任何您的私密資料（如：包含個人識別身分的合約明細）給其他個人、團體、私人企業或公務機關。已去識別化並通過審核的租屋客觀數據（如：某區某房型之租金），則作為群眾外包資料於本平台公開展示。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">6. 隱私權保護政策之修正</h2>
            <p className="leading-relaxed">
              本平台隱私權保護政策將因應需求隨時進行修正，修正後的條款將刊登於網站上。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
