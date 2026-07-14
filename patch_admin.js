const fs = require('fs');
const file = 'src/app/admin/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Update executeAction
code = code.replace(
  `  const executeAction = async (method: string, body: any, token: string) => {
    return fetch('/api/admin/rentals', {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\`
      },
      body: JSON.stringify(body)
    });
  };`,
  `  const executeAction = async (method: string, body: any, token: string) => {
    const isFormData = body instanceof FormData;
    const headers: Record<string, string> = {
      'Authorization': \`Bearer \${token}\`
    };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    return fetch('/api/admin/rentals', {
      method,
      headers,
      body: isFormData ? body : JSON.stringify(body)
    });
  };`
);

// Update handleEditSubmit to use FormData instead of building JSON payload
code = code.replace(
  `    const payload = { action: 'edit', id: editingRental.id, ...data };
    let currentToken = password;
    let res = await executeAction('PUT', payload, currentToken);`,
  `    
    formData.set('id', editingRental.id);
    formData.set('action', 'edit');
    formData.set('latitude', String(editLat));
    formData.set('longitude', String(editLng));
    // Re-append parsed features to override original input values
    formData.delete('features');
    featuresArr.forEach(f => formData.append('features', f));
    
    let currentToken = password;
    let res = await executeAction('PUT', formData, currentToken);`
);

// Add verificationStatus select and contractFile upload to the modal
code = code.replace(
  `                    <label>包含水費</label>
                  </div>
                </div>`,
  `                    <label>包含水費</label>
                  </div>
                </div>

                <div className="modal-section" style={{marginTop: '2rem'}}>
                  <h3><FileText size={18} style={{verticalAlign: 'sub', marginRight: '0.4rem'}}/>認證與合約狀態</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>租賃契約書 (上傳會覆蓋原檔)</label>
                      <input type="file" name="contractFile" accept=".pdf,image/*" className="input-field" style={{ padding: '0.5rem' }} />
                    </div>
                    <div className="form-group">
                      <label>認證狀態</label>
                      <select name="verificationStatus" defaultValue={editingRental.verificationStatus || 'unverified'} className="input-field">
                        <option value="unverified">未審核</option>
                        <option value="verified">已審核</option>
                        <option value="doubtful">存疑</option>
                      </select>
                    </div>
                  </div>
                </div>`
);

fs.writeFileSync(file, code);
