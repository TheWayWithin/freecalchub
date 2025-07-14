#!/usr/bin/env python3
"""
FreecalcHub GTM and CSP Compliance Fixer

This script systematically fixes GTM implementation and CSP headers
to match the master template standards across all HTML pages.

Based on:
- calculator-template.html
- category-template.html  
- docs/SOP-CalcDev.md

Author: Claude Code
Version: 1.0
"""

import os
import re
import sys
from pathlib import Path

# Template-compliant patterns from calculator-template.html and category-template.html
CORRECT_GTM_HEAD = '''<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KNHC9TZ5');</script>'''

CORRECT_GTM_BODY = '''<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KNHC9TZ5"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->'''

CORRECT_CSP = '''<meta charset="utf-8"/><meta content="default-src 'self'; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://cdn-cookieyes.com; font-src 'self' https://cdnjs.cloudflare.com; img-src 'self' data: https://www.googletagmanager.com https://cdn-cookieyes.com; connect-src 'self' https://open.er-api.com https://www.google-analytics.com https://log.cookieyes.com https://cdn-cookieyes.com" http-equiv="Content-Security-Policy"/>'''

class GTMCSPFixer:
    def __init__(self, dry_run=True):
        self.dry_run = dry_run
        self.fixes_applied = []
        
    def analyze_file(self, file_path):
        """Analyze a single HTML file for GTM/CSP issues"""
        issues = []
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Check for legacy gtag.js
        if 'gtag.js' in content or 'gtag(' in content:
            issues.append("HAS_LEGACY_GTAG")
            
        # Check for correct GTM head script
        if 'GTM-KNHC9TZ5' not in content:
            issues.append("MISSING_GTM")
        elif not re.search(r'<script>\(function\(w,d,s,l,i\)', content):
            issues.append("INCORRECT_GTM_FORMAT")
            
        # Check for GTM noscript in body
        if 'GTM-KNHC9TZ5' in content and 'noscript' not in content:
            issues.append("MISSING_GTM_NOSCRIPT")
            
        # Check CSP headers
        if 'Content-Security-Policy' not in content:
            issues.append("MISSING_CSP")
        elif 'cdn-cookieyes.com' not in content:
            issues.append("MISSING_COOKIEYES_CSP")
        elif 'consentcdn.cookieyes.com' in content:
            issues.append("INCORRECT_COOKIEYES_DOMAINS")
            
        return issues
        
    def fix_file(self, file_path):
        """Fix GTM and CSP issues in a single file"""
        print(f"{'[DRY RUN] ' if self.dry_run else ''}Processing: {file_path}")
        
        issues = self.analyze_file(file_path)
        if not issues:
            print(f"  ✅ No issues found")
            return False
            
        print(f"  🔍 Issues found: {', '.join(issues)}")
        
        if self.dry_run:
            return True
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        fixes = []
        
        # Fix 1: Remove legacy gtag.js
        if "HAS_LEGACY_GTAG" in issues:
            # Remove gtag script tag (handles both async and async="")
            content = re.sub(r'<script[^>]*gtag\.js[^>]*></script>\s*', '', content)
            # Remove gtag script block
            content = re.sub(r'<script>\s*window\.dataLayer[^<]*</script>\s*', '', content, flags=re.DOTALL)
            fixes.append("Removed legacy gtag.js")
            
        # Fix 2: Ensure correct GTM head implementation
        if "MISSING_GTM" in issues or "INCORRECT_GTM_FORMAT" in issues:
            # Insert GTM script right after <head>
            content = re.sub(r'(<head>\s*)', rf'\1{CORRECT_GTM_HEAD}\n', content)
            fixes.append("Added correct GTM head script")
            
        # Fix 3: Ensure GTM noscript in body  
        if "MISSING_GTM_NOSCRIPT" in issues:
            # Insert noscript after <body>
            content = re.sub(r'(<body[^>]*>\s*)', rf'\1{CORRECT_GTM_BODY}\n', content)
            fixes.append("Added GTM noscript tag")
            
        # Fix 4: Correct CSP headers
        if any(issue in issues for issue in ["MISSING_CSP", "MISSING_COOKIEYES_CSP", "INCORRECT_COOKIEYES_DOMAINS"]):
            # Replace existing CSP or charset meta
            content = re.sub(r'<meta charset="utf-8"/><meta content="[^"]*" http-equiv="Content-Security-Policy"/>', 
                           CORRECT_CSP, content)
            # If no existing CSP, add after charset
            if 'Content-Security-Policy' not in content:
                content = re.sub(r'(<meta charset="utf-8"/>)', rf'{CORRECT_CSP}', content)
            fixes.append("Updated CSP headers")
            
        # Write fixed content
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            self.fixes_applied.append({
                'file': file_path,
                'fixes': fixes,
                'issues': issues
            })
            print(f"  ✅ Fixed: {', '.join(fixes)}")
            return True
        else:
            print(f"  ⚠️  No changes made")
            return False
            
    def process_files(self, file_paths):
        """Process multiple files"""
        total_files = len(file_paths)
        files_with_issues = 0
        files_fixed = 0
        
        print(f"{'='*60}")
        print(f"FreecalcHub GTM/CSP Compliance Fixer")
        print(f"Mode: {'DRY RUN' if self.dry_run else 'LIVE FIXING'}")
        print(f"Files to process: {total_files}")
        print(f"{'='*60}")
        
        for file_path in file_paths:
            try:
                issues = self.analyze_file(file_path)
                if issues:
                    files_with_issues += 1
                    if self.fix_file(file_path):
                        files_fixed += 1
                        
            except Exception as e:
                print(f"  ❌ Error processing {file_path}: {e}")
                
        print(f"\n{'='*60}")
        print(f"SUMMARY:")
        print(f"Files processed: {total_files}")
        print(f"Files with issues: {files_with_issues}")
        print(f"Files fixed: {files_fixed}")
        print(f"{'='*60}")
        
        return self.fixes_applied

def find_html_files(root_dir, include_patterns=None, exclude_patterns=None):
    """Find HTML files matching criteria"""
    html_files = []
    root_path = Path(root_dir)
    
    for html_file in root_path.rglob("*.html"):
        # Skip backup files
        if html_file.name.endswith('.bak'):
            continue
            
        # Apply include patterns
        if include_patterns:
            if not any(pattern in str(html_file) for pattern in include_patterns):
                continue
                
        # Apply exclude patterns  
        if exclude_patterns:
            if any(pattern in str(html_file) for pattern in exclude_patterns):
                continue
                
        html_files.append(str(html_file))
        
    return sorted(html_files)

def main():
    # Parse command line arguments
    dry_run = '--live' not in sys.argv
    test_mode = '--test' in sys.argv
    
    root_dir = "/Users/jamiewatters/DevProjects/freecalchub"
    
    if test_mode:
        # Test mode: process specific test files
        test_files = [
            f"{root_dir}/health/bmi/bmi-calculator/index.html",  # Calculator page (should be compliant)
            f"{root_dir}/business/break-even/index.html",  # Category page (has issues)
        ]
        files_to_process = [f for f in test_files if os.path.exists(f)]
        print(f"TEST MODE: Processing {len(files_to_process)} test files")
        for f in test_files:
            print(f"  {'✅' if os.path.exists(f) else '❌'} {f}")
    else:
        # Find all HTML files except templates and docs
        files_to_process = find_html_files(
            root_dir,
            exclude_patterns=['template', 'docs/', 'sitemap']
        )
        
    if not files_to_process:
        print("No files found to process!")
        return
        
    # Create fixer and process files
    fixer = GTMCSPFixer(dry_run=dry_run)
    fixes = fixer.process_files(files_to_process)
    
    if not dry_run and fixes:
        print(f"\n🎉 {len(fixes)} files were successfully fixed!")
        print("Remember to commit and push the changes.")

if __name__ == "__main__":
    main()