import re

with open('src/app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update list view address
list_address_old = '<h4 className="address">{item.city}{item.district} {maskAddress(item.address)}</h4>'
list_address_new = '''<h4 className="address" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.city}{item.district} {maskAddress(item.address)}
                    {item.verificationStatus === 'verified' && (
                      <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#059669', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'normal' }}>
                        <CheckCircle size={20} weight="regular" /> 已審核
                      </span>
                    )}
                    {item.verificationStatus === 'doubtful' && (
                      <span style={{ background: 'rgba(220, 38, 38, 0.2)', color: '#dc2626', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'normal' }}>
                        <Warning size={20} weight="regular" /> 資訊存疑
                      </span>
                    )}
                  </h4>'''
content = content.replace(list_address_old, list_address_new)

# 2. Update modal view address
modal_address_old = '<h2>{selectedItem.city}{selectedItem.district} {maskAddress(selectedItem.address)}</h2>'
modal_address_new = '''<h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {selectedItem.city}{selectedItem.district} {maskAddress(selectedItem.address)}
              {selectedItem.verificationStatus === 'verified' && (
                <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#059669', padding: '4px 10px', borderRadius: '4px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'normal' }}>
                  <CheckCircle size={24} weight="regular" /> 已審核
                </span>
              )}
              {selectedItem.verificationStatus === 'doubtful' && (
                <span style={{ background: 'rgba(220, 38, 38, 0.2)', color: '#dc2626', padding: '4px 10px', borderRadius: '4px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'normal' }}>
                  <Warning size={24} weight="regular" /> 資訊存疑
                </span>
              )}
            </h2>'''
content = content.replace(modal_address_old, modal_address_new)

# 3. Remove old verification badges in modal
# We will use regex to find and remove them.
pattern_to_remove = r"\{selectedItem\.verificationStatus === 'verified' && \(\s*<span style=\{\{ background: 'rgba\(16, 185, 129, 0\.2\)', color: '#059669', padding: '2px 8px', borderRadius: '4px', fontSize: '0\.8rem', display: 'flex', alignItems: 'center', gap: '4px' \}\}>\s*<CheckCircle\s*size=\{16\}\s*weight=\"regular\" /> 已審核\s*</span>\s*\)\}\s*\{selectedItem\.verificationStatus === 'doubtful' && \(\s*<span style=\{\{ background: 'rgba\(220, 38, 38, 0\.2\)', color: '#dc2626', padding: '2px 8px', borderRadius: '4px', fontSize: '0\.8rem', display: 'flex', alignItems: 'center', gap: '4px' \}\}>\s*<Warning\s*size=\{16\}\s*weight=\"regular\" /> 資訊存疑\s*</span>\s*\)\}"
content = re.sub(pattern_to_remove, "", content)

# 4. Change all size={16} to size={24} inside the <div className="info-item"> block for the modal icons
# Wait, let's just make all size={16} into size={20} except for the info-icons which we make 24.
# Wait, we changed size={32} to size={16} in the previous step. So currently, everything is size={16}.
# Let's change info-icon specifically:
content = re.sub(r'className="info-icon"(.*?)size=\{16\}', r'className="info-icon"\1size={24}', content)

# For filter labels on the left, change size={16} to size={20}
content = content.replace('size={16}', 'size={20}')

with open('src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("page.tsx updated.")
