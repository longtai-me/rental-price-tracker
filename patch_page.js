const fs = require('fs');
const file = 'src/app/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  `                      {!!selectedItem.contractFile && (
                        <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#059669', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={14} /> 已審核
                        </span>
                      )}`,
  `                      {selectedItem.verificationStatus === 'verified' && (
                        <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#059669', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={14} /> 已審核
                        </span>
                      )}
                      {selectedItem.verificationStatus === 'doubtful' && (
                        <span style={{ background: 'rgba(220, 38, 38, 0.2)', color: '#dc2626', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={14} /> 資訊存疑
                        </span>
                      )}`
);

fs.writeFileSync(file, code);
