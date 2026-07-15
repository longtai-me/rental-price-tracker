import re

files_to_update = [
    'src/app/admin/page.tsx',
    'src/app/page.tsx',
    'src/components/Navbar.tsx',
    'src/components/MapWrapper.tsx',
    'src/components/DraggableMapWrapper.tsx'
]

phosphor_icons = [
    'Check', 'X', 'PencilSimple', 'Trash', 'ArchiveBox', 'ArrowUUpLeft', 'MagnifyingGlass', 
    'MapPin', 'House', 'CurrencyDollar', 'CheckCircle', 'XCircle', 'FileText',
    'SpinnerGap', 'Car', 'Buildings', 'Ruler', 'Lightning', 'Warning', 'Drop', 'List'
]

for file_path in files_to_update:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    for icon in phosphor_icons:
        # Match <Icon ... /> or <Icon>...</Icon>
        # We need to find the opening tag <Icon ... > or <Icon ... />
        # and inject size={32} weight="regular", and remove any existing size={...}
        
        pattern = rf"<{icon}([\s>/>])"
        
        # We need a regex that matches the entire opening tag to do replacements safely
        # let's match `<IconName ` up to the next `>`
        # This regex: <IconName(?:\s+[^>]*?)?>
        
        tag_pattern = rf"<{icon}(?:\s+[^>]*?)?>"
        
        def replacer(match):
            tag = match.group(0)
            # Remove existing size prop
            tag = re.sub(r'\s+size=\{?[0-9]+\}?', '', tag)
            tag = re.sub(r'\s+size="[0-9]+"', '', tag)
            
            # Remove existing weight prop if any
            tag = re.sub(r'\s+weight="[^"]+"', '', tag)
            
            # Inject size={32} weight="regular" before the closing bracket
            if tag.endswith('/>'):
                return tag[:-2] + ' size={32} weight="regular" />'
            elif tag.endswith('>'):
                return tag[:-1] + ' size={32} weight="regular" >'
            return tag
            
        content = re.sub(tag_pattern, replacer, content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

