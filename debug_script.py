import re
import subprocess

file_path = 'src/app/page.tsx'
old_content = subprocess.check_output(['git', 'show', f'e249119:{file_path}']).decode('utf-8')
with open(file_path, 'r', encoding='utf-8') as f:
    new_content = f.read()

old_lines = old_content.split('\n')
new_lines = new_content.split('\n')

for i in range(min(len(old_lines), len(new_lines))):
    old_line = old_lines[i]
    new_line = new_lines[i]

    match = re.search(r'size=\{?([0-9]+)\}?', old_line)
    if match:
        original_size = match.group(1)
        if 'size={32}' in new_line or 'size=32' in new_line:
            print(f"Line {i}: Old: {original_size}, New: {new_line.strip()}")
        else:
            print(f"Line {i}: MISMATCH! Old had {original_size}, New has: {new_line.strip()}")
