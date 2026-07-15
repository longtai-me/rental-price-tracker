import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Replace all size={32} with size={16}
content = content.replace('size={32}', 'size={16}')

# Fix exceptions
content = content.replace('<SpinnerGap className="spinner"  size={16}', '<SpinnerGap className="spinner"  size={32}')
content = content.replace('<X  size={16}', '<X  size={24}')

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

