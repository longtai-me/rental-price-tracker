import re
import subprocess
import os

files_to_update = [
    'src/app/admin/page.tsx',
    'src/app/page.tsx',
    'src/components/Navbar.tsx',
    'src/components/MapWrapper.tsx',
    'src/components/DraggableMapWrapper.tsx'
]

def get_original_commit(filepath):
    try:
        return subprocess.check_output(['git', 'show', f'42529a5:{filepath}']).decode('utf-8')
    except:
        return ""

for file_path in files_to_update:
    old_content = get_original_commit(file_path)
    if not old_content:
        continue
        
    with open(file_path, 'r', encoding='utf-8') as f:
        new_content = f.read()

    # We cannot do line-by-line because lines might have shifted slightly.
    # But wait, did they shift? I only did inline replacements! So they DID NOT shift!
    old_lines = old_content.split('\n')
    new_lines = new_content.split('\n')

    for i in range(min(len(old_lines), len(new_lines))):
        old_line = old_lines[i]
        new_line = new_lines[i]

        match = re.search(r'size=\{?([0-9]+)\}?', old_line)
        if match:
            original_size = match.group(1)
            # Find and replace ANY size={...} or size=... with the original size
            if 'size={32}' in new_line or 'size=32' in new_line:
                new_line = re.sub(r'size=\{?32\}?', f'size={{{original_size}}}', new_line)
                new_lines[i] = new_line

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))
        
print("Done!")
