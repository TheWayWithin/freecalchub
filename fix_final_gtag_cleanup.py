#!/usr/bin/env python3
"""
Fix remaining legacy gtag.js references in the final 4 main category pages

Based on the analysis, these 4 pages still have legacy gtag.js:
- /finance/index.html (line 23)
- /health/index.html (line 23) 
- /conversions/index.html (line 22)
- /business/index.html (line 22)
"""

import os
import re
from datetime import datetime

def fix_gtag_in_file(file_path):
    """Fix gtag.js in a single file"""
    print(f"Processing: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Multiple patterns to catch different gtag.js variations
    patterns = [
        # Pattern 1: CSS link followed by gtag script on same line
        r'(<link href="/css/faq-styles-v2\.css" rel="stylesheet"/>) <script async="" src="https://www\.googletagmanager\.com/gtag/js\?id=G-R1QHNSSWTC"></script>',
        # Pattern 2: Standalone gtag script with async=""
        r'<script async="" src="https://www\.googletagmanager\.com/gtag/js\?id=G-R1QHNSSWTC"></script>\s*',
        # Pattern 3: Standalone gtag script with async (no quotes)
        r'<script async src="https://www\.googletagmanager\.com/gtag/js\?id=G-R1QHNSSWTC"></script>\s*',
        # Pattern 4: Any remaining gtag.js variations
        r'<script[^>]*src="[^"]*gtag\.js[^"]*"[^>]*></script>\s*'
    ]
    
    changes_made = False
    for i, pattern in enumerate(patterns, 1):
        if i == 1:
            # For pattern 1, keep the CSS link
            replacement = r'\1'
        else:
            # For other patterns, remove entirely
            replacement = ''
        
        new_content = re.sub(pattern, replacement, content)
        if new_content != content:
            content = new_content
            changes_made = True
            print(f"  ✅ Applied pattern {i} fix")
    
    if changes_made:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ File updated")
        return True
    else:
        print(f"  ℹ️  No legacy gtag.js found")
        return False

def update_sitemap(file_paths):
    """Update sitemap timestamps for fixed files"""
    sitemap_path = "/Users/jamiewatters/DevProjects/freecalchub/sitemap.xml"
    current_time = datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ')
    
    try:
        with open(sitemap_path, 'r', encoding='utf-8') as f:
            sitemap_content = f.read()
            
        for file_path in file_paths:
            # Convert file path to URL path
            url_path = file_path.replace('/Users/jamiewatters/DevProjects/freecalchub', '')
            if url_path.endswith('/index.html'):
                url_path = url_path.replace('/index.html', '/')
            
            # Update sitemap entry
            pattern = f'(<loc>https://[^>]*{re.escape(url_path)}</loc>\\s*<lastmod>)[^<]*(</lastmod>)'
            replacement = f'\\g<1>{current_time}\\g<2>'
            sitemap_content = re.sub(pattern, replacement, sitemap_content)
            
        with open(sitemap_path, 'w', encoding='utf-8') as f:
            f.write(sitemap_content)
            
        print(f"\n📝 Updated sitemap.xml timestamps for {len(file_paths)} pages")
        
    except Exception as e:
        print(f"\n⚠️  Warning: Could not update sitemap.xml: {e}")

def main():
    root_dir = "/Users/jamiewatters/DevProjects/freecalchub"
    
    # The 4 remaining pages with legacy gtag.js
    target_files = [
        f"{root_dir}/finance/index.html",
        f"{root_dir}/health/index.html", 
        f"{root_dir}/conversions/index.html",
        f"{root_dir}/business/index.html"
    ]
    
    print("Final cleanup: Removing legacy gtag.js from remaining main category pages\n")
    
    fixed_files = []
    for file_path in target_files:
        if os.path.exists(file_path):
            if fix_gtag_in_file(file_path):
                fixed_files.append(file_path)
        else:
            print(f"❌ File not found: {file_path}")
    
    if fixed_files:
        update_sitemap(fixed_files)
        print(f"\n🎉 {len(fixed_files)} files were fixed!")
        print("All main category pages now have clean GTM-only implementation.")
    else:
        print("\nℹ️  No files needed fixing.")

if __name__ == "__main__":
    main()