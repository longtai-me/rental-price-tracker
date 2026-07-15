import os
import re

files_to_update = {
    'src/app/admin/page.tsx': {
        'import': "import { Check, X, PencilSimple, Trash, ArchiveBox, ArrowUUpLeft, MagnifyingGlass, MapPin, House, CurrencyDollar, CheckCircle, XCircle, FileText } from '@phosphor-icons/react';",
        'mapping': {
            'Check': 'Check',
            'X': 'X',
            'Edit': 'PencilSimple',
            'Trash2': 'Trash',
            'Archive': 'ArchiveBox',
            'ArchiveRestore': 'ArrowUUpLeft',
            'Search': 'MagnifyingGlass',
            'MapPin': 'MapPin',
            'Home': 'House',
            'DollarSign': 'CurrencyDollar',
            'CheckCircle2': 'CheckCircle',
            'XCircle': 'XCircle',
            'FileText': 'FileText'
        }
    },
    'src/app/page.tsx': {
        'import': "import { MapPin, House, CurrencyDollar, SpinnerGap, X, Car, Buildings, Ruler, CheckCircle, XCircle, Lightning, Warning, Drop } from '@phosphor-icons/react';",
        'mapping': {
            'MapPin': 'MapPin',
            'Home': 'House',
            'DollarSign': 'CurrencyDollar',
            'Loader2': 'SpinnerGap',
            'X': 'X',
            'Car': 'Car',
            'Building': 'Buildings',
            'Ruler': 'Ruler',
            'CheckCircle2': 'CheckCircle',
            'XCircle': 'XCircle',
            'Zap': 'Lightning',
            'AlertTriangle': 'Warning',
            'Droplets': 'Drop'
        }
    },
    'src/components/Navbar.tsx': {
        'import': "import { Buildings, List, X } from '@phosphor-icons/react';",
        'mapping': {
            'Building2': 'Buildings',
            'Menu': 'List',
            'X': 'X'
        }
    },
    'src/components/MapWrapper.tsx': {
        'import': "import { SpinnerGap } from '@phosphor-icons/react';",
        'mapping': {
            'Loader2': 'SpinnerGap'
        }
    },
    'src/components/DraggableMapWrapper.tsx': {
        'import': "import { SpinnerGap } from '@phosphor-icons/react';",
        'mapping': {
            'Loader2': 'SpinnerGap'
        }
    }
}

for file_path, data in files_to_update.items():
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace the lucide-react import
    content = re.sub(r"import\s+\{[^}]*\}\s+from\s+['\"]lucide-react['\"];", data['import'], content)

    # Apply tag replacements
    for old_icon, new_icon in data['mapping'].items():
        # Match the opening tag of the old icon, and capture all its attributes
        # e.g. <Zap className="info-icon" size={16} style={{...}} />
        # we want to remove existing size={...} and add size={32} weight="regular"
        pattern = rf"<{old_icon}([\s/>])"
        
        def replacer(match):
            # If the match was just `<Zap>`, remainder is `>`
            # We will process the whole tag until `>`
            return f"<{new_icon}{match.group(1)}"
            
        content = re.sub(pattern, replacer, content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

