const fs = require('fs');
const file = 'src/app/admin/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  `                      {rental.ghostStory && <span className="badge badge-ghost">👻 鬼故事</span>}`,
  `                      {rental.verificationStatus === 'verified' && <span className="badge" style={{background: '#d1fae5', color: '#059669'}}>✅ 已審核</span>}
                      {rental.verificationStatus === 'doubtful' && <span className="badge" style={{background: '#fee2e2', color: '#b91c1c'}}>❓ 存疑</span>}
                      {rental.ghostStory && <span className="badge badge-ghost">👻 鬼故事</span>}`
);

code = code.replace(
  `                  {rental.ghostStory && <span className="badge badge-ghost">👻 鬼故事</span>}`,
  `                  {rental.verificationStatus === 'verified' && <span className="badge" style={{background: '#d1fae5', color: '#059669'}}>✅ 已審核</span>}
                  {rental.verificationStatus === 'doubtful' && <span className="badge" style={{background: '#fee2e2', color: '#b91c1c'}}>❓ 存疑</span>}
                  {rental.ghostStory && <span className="badge badge-ghost">👻 鬼故事</span>}`
);

fs.writeFileSync(file, code);
