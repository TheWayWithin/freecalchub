#!/usr/bin/env python3
"""
Fix remaining legacy gtag.js references in main category pages

This script specifically targets the inline gtag.js scripts that 
are on the same line as CSS links in the four main category pages.
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
    
    # Look for the specific pattern: CSS link followed by gtag script on same line
    pattern = r'(<link href="/css/faq-styles-v2\.css" rel="stylesheet"/>) <script async="" src="https://www\.googletagmanager\.com/gtag/js\?id=G-R1QHNSSWTC"></script>'
    replacement = r'\1'
    
    content = re.sub(pattern, replacement, content)
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ Removed legacy gtag.js")
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
    
    # The four main category pages  
    target_files = [
        f"{root_dir}/math/index.html",
        f"{root_dir}/health/index.html", 
        f"{root_dir}/date-time/index.html",
        f"{root_dir}/lifestyle/index.html"
    ]
    
    print("Fixing remaining legacy gtag.js in main category pages\n")
    
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
    else:
        print("\nℹ️  No files needed fixing.")

if __name__ == "__main__":
    main()