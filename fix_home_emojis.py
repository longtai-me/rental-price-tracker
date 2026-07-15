import re

with open('src/app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports if missing
if 'Link' not in content:
    content = content.replace("import { Funnel, MapPin, Download, Export, X, User, ArrowSquareOut, CheckCircle, ChatCircleText, Bed, FileText } from '@phosphor-icons/react';", "import { Funnel, MapPin, Download, Export, X, User, ArrowSquareOut, CheckCircle, ChatCircleText, Bed, FileText, Link, Ghost } from '@phosphor-icons/react';")

content = content.replace('🔗 點此查看客觀證據 (判決書/公文/新聞)', '<span style={{display: "inline-flex", alignItems: "center", gap: "4px"}}><Link size={16} weight="regular" /> 點此查看客觀證據 (判決書/公文/新聞)</span>')
content = content.replace('<label style={{ color: \'#ef4444\' }}>👻 租屋鬼故事 / 恐怖經歷</label>', '<label style={{ color: \'#ef4444\', display: "inline-flex", alignItems: "center", gap: "4px" }}><Ghost size={16} weight="regular" /> 租屋鬼故事 / 恐怖經歷</label>')

with open('src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

