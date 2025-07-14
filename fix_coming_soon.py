#!/usr/bin/env python3
"""
FreecalcHub Coming Soon Format Standardizer

This script standardizes "Coming Soon" formatting across all pages
to match the business page format (without parentheses).

Correct format: <span class="coming-soon-tag">Coming Soon</span>
Incorrect format: <span class="coming-soon-tag">(Coming Soon)</span>

Author: Claude Code
Version: 1.0
"""

import os
import re
import sys
from pathlib import Path
from datetime import datetime

class ComingSoonFixer:
    def __init__(self, dry_run=True):
        self.dry_run = dry_run
        self.fixes_applied = []
        self.sitemap_path = None
        
    def analyze_file(self, file_path):
        """Analyze a single HTML file for coming soon format issues"""
        issues = []
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Check for incorrect coming soon format with parentheses
        if '<span class="coming-soon-tag">(Coming Soon)</span>' in content:
            issues.append("INCORRECT_COMING_SOON_PARENTHESES")
            
        # Check for other incorrect variations
        if re.search(r'<span class="coming-soon-tag">\s*\(Coming Soon\)\s*</span>', content):
            issues.append("INCORRECT_COMING_SOON_SPACING")
            
        # Check for inline (Coming Soon) without proper span
        if re.search(r'<h3[^>]*>[^<]*\(Coming Soon\)[^<]*</h3>', content):
            issues.append("INLINE_COMING_SOON_IN_H3")
            
        return issues
        
    def fix_file(self, file_path):
        """Fix coming soon format issues in a single file"""
        print(f"{'[DRY RUN] ' if self.dry_run else ''}Processing: {file_path}")
        
        issues = self.analyze_file(file_path)
        if not issues:
            print(f"  ✅ No coming soon format issues found")
            return False
            
        print(f"  🔍 Issues found: {', '.join(issues)}")
        
        if self.dry_run:
            return True
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        fixes = []
        
        # Fix 1: Remove parentheses from coming soon tags
        if "INCORRECT_COMING_SOON_PARENTHESES" in issues:
            content = content.replace(
                '<span class="coming-soon-tag">(Coming Soon)</span>',
                '<span class="coming-soon-tag">Coming Soon</span>'
            )
            fixes.append("Removed parentheses from coming soon tags")
            
        # Fix 2: Fix spacing issues around coming soon
        if "INCORRECT_COMING_SOON_SPACING" in issues:
            content = re.sub(
                r'<span class="coming-soon-tag">\s*\(Coming Soon\)\s*</span>',
                '<span class="coming-soon-tag">Coming Soon</span>',
                content
            )
            fixes.append("Fixed spacing in coming soon tags")
            
        # Fix 3: Move inline (Coming Soon) from h3 to proper span
        if "INLINE_COMING_SOON_IN_H3" in issues:
            # This is more complex and might need manual review
            # For now, we'll just log it
            fixes.append("Detected inline coming soon in h3 (manual review needed)")
            
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
        print(f"FreecalcHub Coming Soon Format Standardizer")
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
        
        # Update sitemap for all fixed files
        if not self.dry_run and self.fixes_applied:
            self.update_sitemap()
            
        return self.fixes_applied
        
    def update_sitemap(self):
        """Update sitemap.xml with current timestamp for all fixed files"""
        if not self.sitemap_path:
            return
            
        try:
            current_time = datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ')
            
            with open(self.sitemap_path, 'r', encoding='utf-8') as f:
                sitemap_content = f.read()
                
            # Update lastmod for each fixed file
            for fix_info in self.fixes_applied:
                file_path = fix_info['file']
                # Convert file path to URL path
                url_path = file_path.replace('/Users/jamiewatters/DevProjects/freecalchub', '')
                if url_path.endswith('/index.html'):
                    url_path = url_path.replace('/index.html', '/')
                
                # Update sitemap entry
                pattern = f'(<loc>https://[^>]*{re.escape(url_path)}</loc>\\s*<lastmod>)[^<]*(</lastmod>)'
                replacement = f'\\g<1>{current_time}\\g<2>'
                sitemap_content = re.sub(pattern, replacement, sitemap_content)
                
            with open(self.sitemap_path, 'w', encoding='utf-8') as f:
                f.write(sitemap_content)
                
            print(f"\\n📝 Updated sitemap.xml timestamps for {len(self.fixes_applied)} pages")
            
        except Exception as e:
            print(f"\\n⚠️  Warning: Could not update sitemap.xml: {e}")

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
        # Test mode: process specific test files with known issues
        test_files = [
            f"{root_dir}/date-time/business-days/index.html",  # Has correct format
            f"{root_dir}/math/algebra/index.html",  # Has incorrect format with parentheses
            f"{root_dir}/lifestyle/travel/index.html",  # Has incorrect format with parentheses
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
    fixer = ComingSoonFixer(dry_run=dry_run)
    fixer.sitemap_path = f"{root_dir}/sitemap.xml"
    fixes = fixer.process_files(files_to_process)
    
    if not dry_run and fixes:
        print(f"\n🎉 {len(fixes)} files were successfully fixed!")
        print("Remember to commit and push the changes.")

if __name__ == "__main__":
    main()