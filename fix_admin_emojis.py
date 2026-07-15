import re

with open('src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports if missing
if 'CheckCircle' not in content:
    content = content.replace("import { Funnel, MapPin, Download, Trash, Export, List, MagnifyingGlass } from '@phosphor-icons/react';", "import { Funnel, MapPin, Download, Trash, Export, List, MagnifyingGlass, CheckCircle, Question, Ghost, Warning, Link, FileText } from '@phosphor-icons/react';")

# Fix duplicate "已審核" and "存疑" on lines 304-307
# Original:
#                      {rental.verificationStatus === 'verified' && <span className="badge" style={{background: '#d1fae5', color: '#059669'}}>✅ 已審核</span>}
#                      {rental.verificationStatus === 'doubtful' && <span className="badge" style={{background: '#fee2e2', color: '#b91c1c'}}>❓ 存疑</span>}
#                      {rental.verificationStatus === 'verified' && <span className="badge" style={{background: '#d1fae5', color: '#059669'}}>✅ 已審核</span>}
#                  {rental.verificationStatus === 'doubtful' && <span className="badge" style={{background: '#fee2e2', color: '#b91c1c'}}>❓ 存疑</span>}

old_badges_1 = """                      {rental.verificationStatus === 'verified' && <span className="badge" style={{background: '#d1fae5', color: '#059669'}}>✅ 已審核</span>}
                      {rental.verificationStatus === 'doubtful' && <span className="badge" style={{background: '#fee2e2', color: '#b91c1c'}}>❓ 存疑</span>}
                      {rental.verificationStatus === 'verified' && <span className="badge" style={{background: '#d1fae5', color: '#059669'}}>✅ 已審核</span>}
                  {rental.verificationStatus === 'doubtful' && <span className="badge" style={{background: '#fee2e2', color: '#b91c1c'}}>❓ 存疑</span>}"""
new_badges_1 = """                      {rental.verificationStatus === 'verified' && <span className="badge" style={{background: '#d1fae5', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px'}}><CheckCircle size={16} weight="regular" /> 已審核</span>}
                      {rental.verificationStatus === 'doubtful' && <span className="badge" style={{background: '#fee2e2', color: '#b91c1c', display: 'inline-flex', alignItems: 'center', gap: '4px'}}><Question size={16} weight="regular" /> 存疑</span>}"""
content = content.replace(old_badges_1, new_badges_1)

# Fix remaining emojis
content = content.replace('<span className="badge badge-ghost">👻 鬼故事</span>', '<span className="badge badge-ghost" style={{display: "inline-flex", alignItems: "center", gap: "4px"}}><Ghost size={16} weight="regular" /> 鬼故事</span>')
content = content.replace('<span className="badge badge-bad-landlord">⚠️ 惡房東</span>', '<span className="badge badge-bad-landlord" style={{display: "inline-flex", alignItems: "center", gap: "4px"}}><Warning size={16} weight="regular" /> 惡房東</span>')
content = content.replace('className="badge badge-evidence">🔗 證據</a>', 'className="badge badge-evidence" style={{display: "inline-flex", alignItems: "center", gap: "4px"}}><Link size={16} weight="regular" /> 證據</a>')
content = content.replace('className="badge badge-contract">📄 契約</a>', 'className="badge badge-contract" style={{display: "inline-flex", alignItems: "center", gap: "4px"}}><FileText size={16} weight="regular" /> 契約</a>')

# Fix select options
content = content.replace('<option value="verified">✅ 已審核</option>', '<option value="verified">已審核</option>')
content = content.replace('<option value="doubtful">❓ 存疑</option>', '<option value="doubtful">存疑</option>')

with open('src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

