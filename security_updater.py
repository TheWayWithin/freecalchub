#!/usr/bin/env python3
"""
FreecalcHub Security Updater
Implements security enhancements across HTML files:
- Adds Content Security Policy (CSP) meta tags
- Upgrades Font Awesome to stable version with SRI
- Adds Subresource Integrity (SRI) hashes
- Creates backups and validation
"""

import os
import sys
import shutil
import argparse
from pathlib import Path
from datetime import datetime
import re
from bs4 import BeautifulSoup, Comment

class SecurityUpdater:
    def __init__(self, dry_run=False, backup=True):
        self.dry_run = dry_run
        self.backup = backup
        self.changes_made = []
        self.errors = []
        
        # Security configurations - Updated based on template standards
        self.csp_policy = (
            "default-src 'self'; "
            "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; "
            "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://cdn-cookieyes.com; "
            "font-src 'self' https://cdnjs.cloudflare.com; "
            "img-src 'self' data: https://www.googletagmanager.com https://cdn-cookieyes.com; "
            "connect-src 'self' https://open.er-api.com https://www.google-analytics.com https://log.cookieyes.com https://cdn-cookieyes.com"
        )
        
        # Font Awesome upgrade details
        self.font_awesome_old = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        self.font_awesome_new = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        self.font_awesome_integrity = "sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
        
    def create_backup(self, file_path):
        """Create a backup of the file before modification"""
        if not self.backup:
            return True
            
        backup_path = f"{file_path}.bak"
        try:
            shutil.copy2(file_path, backup_path)
            return True
        except Exception as e:
            self.errors.append(f"Failed to create backup for {file_path}: {e}")
            return False
    
    def restore_backup(self, file_path):
        """Restore file from backup"""
        backup_path = f"{file_path}.bak"
        if os.path.exists(backup_path):
            try:
                shutil.copy2(backup_path, file_path)
                return True
            except Exception as e:
                self.errors.append(f"Failed to restore backup for {file_path}: {e}")
                return False
        return False
    
    def has_csp_policy(self, soup):
        """Check if CSP policy already exists"""
        csp_tags = soup.find_all('meta', {'http-equiv': 'Content-Security-Policy'})
        return len(csp_tags) > 0
    
    def add_csp_policy(self, soup):
        """Add CSP meta tag to the head section"""
        if self.has_csp_policy(soup):
            return False, "CSP policy already exists"
        
        head = soup.find('head')
        if not head:
            return False, "No head tag found"
        
        # Create CSP meta tag
        csp_tag = soup.new_tag('meta')
        csp_tag['http-equiv'] = 'Content-Security-Policy'
        csp_tag['content'] = self.csp_policy
        
        # Insert after charset meta tag if it exists, otherwise at beginning
        charset_tag = head.find('meta', {'charset': True})
        if charset_tag:
            charset_tag.insert_after(csp_tag)
        else:
            head.insert(0, csp_tag)
        
        return True, "CSP policy added"
    
    def upgrade_font_awesome(self, soup):
        """Upgrade Font Awesome to stable version with SRI"""
        changes = []
        
        # Find Font Awesome link tags
        fa_links = soup.find_all('link', {'href': re.compile(r'font-awesome.*css')})
        
        for link in fa_links:
            href = link.get('href', '')
            if '6.0.0-beta3' in href or href == self.font_awesome_old:
                # Update href
                link['href'] = self.font_awesome_new
                
                # Add integrity and crossorigin
                link['integrity'] = self.font_awesome_integrity
                link['crossorigin'] = 'anonymous'
                link['referrerpolicy'] = 'no-referrer'
                
                changes.append(f"Upgraded Font Awesome: {href} -> {self.font_awesome_new}")
        
        return len(changes) > 0, "; ".join(changes) if changes else "No Font Awesome links found"
    
    def process_file(self, file_path):
        """Process a single HTML file"""
        if not os.path.exists(file_path):
            self.errors.append(f"File not found: {file_path}")
            return False
        
        # Create backup if not in dry-run mode
        if not self.dry_run and not self.create_backup(file_path):
            return False
        
        try:
            # Read and parse the file
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            soup = BeautifulSoup(content, 'html.parser')
            changes = []
            
            # Add CSP policy
            csp_added, csp_msg = self.add_csp_policy(soup)
            if csp_added:
                changes.append(f"CSP: {csp_msg}")
            
            # Upgrade Font Awesome
            fa_upgraded, fa_msg = self.upgrade_font_awesome(soup)
            if fa_upgraded:
                changes.append(f"Font Awesome: {fa_msg}")
            
            if changes:
                if not self.dry_run:
                    # Write the modified content
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(str(soup))
                
                change_summary = f"{file_path}: {'; '.join(changes)}"
                self.changes_made.append(change_summary)
                return True
            else:
                self.changes_made.append(f"{file_path}: No changes needed")
                return True
                
        except Exception as e:
            self.errors.append(f"Error processing {file_path}: {e}")
            # Restore backup if we created one
            if not self.dry_run and self.backup:
                self.restore_backup(file_path)
            return False
    
    def validate_file(self, file_path):
        """Validate that security features were properly implemented"""
        if not os.path.exists(file_path):
            return False, "File not found"
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            soup = BeautifulSoup(content, 'html.parser')
            issues = []
            
            # Check CSP
            if not self.has_csp_policy(soup):
                issues.append("Missing CSP policy")
            
            # Check Font Awesome
            fa_links = soup.find_all('link', {'href': re.compile(r'font-awesome.*css')})
            for link in fa_links:
                href = link.get('href', '')
                if '6.0.0-beta3' in href:
                    issues.append("Still using beta Font Awesome")
                elif href == self.font_awesome_new:
                    if not link.get('integrity'):
                        issues.append("Font Awesome missing integrity hash")
                    if not link.get('crossorigin'):
                        issues.append("Font Awesome missing crossorigin")
            
            return len(issues) == 0, "; ".join(issues) if issues else "All validations passed"
            
        except Exception as e:
            return False, f"Validation error: {e}"
    
    def process_templates(self):
        """
        Process master template files first to ensure consistency across site.
        
        This follows the template-first approach where master templates are updated
        before individual pages to maintain site-wide CSP and infrastructure consistency.
        Based on lessons learned from CookieYes CSP integration testing.
        """
        template_files = [
            'calculator-template.html',
            'category-template.html',
            'index.html'
        ]
        
        results = []
        for template in template_files:
            if os.path.exists(template):
                success = self.process_file(template)
                results.append((template, success))
            else:
                self.errors.append(f"Template not found: {template}")
                results.append((template, False))
        
        return results
    
    def process_specific_files(self, file_list):
        """Process a specific list of files"""
        results = []
        for file_path in file_list:
            success = self.process_file(file_path)
            results.append((file_path, success))
        
        return results
    
    def find_all_html_files(self):
        """Find all HTML files in the project"""
        import glob
        html_files = []
        
        # Get all HTML files recursively
        for pattern in ['**/*.html', '*/*.html', '*/*/*.html', '*/*/*/*.html']:
            html_files.extend(glob.glob(pattern, recursive=True))
        
        # Filter out backup files and specific excludes
        excludes = ['.bak', 'node_modules', '.git', 'test-calculator']
        filtered_files = []
        
        for file_path in html_files:
            if not any(exclude in file_path for exclude in excludes):
                filtered_files.append(file_path)
        
        return sorted(list(set(filtered_files)))
    
    def process_all_files(self, batch_size=10):
        """Process all HTML files in the project"""
        all_files = self.find_all_html_files()
        
        print(f"Found {len(all_files)} HTML files to process")
        print("Files to be processed:")
        for i, file_path in enumerate(all_files, 1):
            print(f"  {i:3d}. {file_path}")
        
        if not self.dry_run and not getattr(self, 'force', False):
            # Confirm before processing
            try:
                response = input(f"\nProceed with updating {len(all_files)} files? (y/N): ")
                if response.lower() != 'y':
                    print("Operation cancelled.")
                    return []
            except EOFError:
                print("\nNo input available, use --force flag for automated processing")
                return []
        
        results = []
        total = len(all_files)
        
        for i, file_path in enumerate(all_files, 1):
            print(f"Processing {i}/{total}: {file_path}")
            success = self.process_file(file_path)
            results.append((file_path, success))
            
            # Batch status update
            if i % batch_size == 0 or i == total:
                successful = sum(1 for _, success in results if success)
                print(f"  Progress: {i}/{total} files processed, {successful} successful")
        
        return results
    
    def generate_report(self):
        """Generate a summary report of changes and errors"""
        report = []
        report.append("=" * 60)
        report.append("SECURITY UPDATER REPORT")
        report.append("=" * 60)
        report.append(f"Mode: {'DRY RUN' if self.dry_run else 'LIVE UPDATE'}")
        report.append(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        
        if self.changes_made:
            report.append("CHANGES MADE:")
            report.append("-" * 40)
            for change in self.changes_made:
                report.append(f"  {change}")
            report.append("")
        
        if self.errors:
            report.append("ERRORS:")
            report.append("-" * 40)
            for error in self.errors:
                report.append(f"  ERROR: {error}")
            report.append("")
        
        report.append(f"Summary: {len(self.changes_made)} files processed, {len(self.errors)} errors")
        report.append("=" * 60)
        
        return "\n".join(report)

def main():
    parser = argparse.ArgumentParser(description='FreecalcHub Security Updater')
    parser.add_argument('--dry-run', action='store_true', 
                       help='Preview changes without applying them')
    parser.add_argument('--no-backup', action='store_true',
                       help='Skip creating backup files')
    parser.add_argument('--target', choices=['templates', 'test', 'all'],
                       default='templates', help='Target files to process')
    parser.add_argument('--file', action='append',
                       help='Process specific file(s)')
    parser.add_argument('--validate', action='store_true',
                       help='Validate security implementations')
    parser.add_argument('--force', action='store_true',
                       help='Skip confirmation prompts for bulk operations')
    
    args = parser.parse_args()
    
    # Initialize updater
    updater = SecurityUpdater(
        dry_run=args.dry_run,
        backup=not args.no_backup
    )
    updater.force = args.force
    
    if args.validate:
        # Validation mode
        test_files = [
            'calculator-template.html',
            'category-template.html', 
            'index.html',
            'finance/index.html',
            'finance/mortgage/mortgage-calculator/index.html'
        ]
        
        print("Validating security implementations...")
        for file_path in test_files:
            if os.path.exists(file_path):
                valid, message = updater.validate_file(file_path)
                status = "✅ PASS" if valid else "❌ FAIL"
                print(f"{status} {file_path}: {message}")
        return
    
    # Processing mode
    if args.file:
        # Process specific files
        results = updater.process_specific_files(args.file)
        
    elif args.target == 'templates':
        # Process templates
        print("Processing master templates...")
        results = updater.process_templates()
        
    elif args.target == 'test':
        # Process test files
        test_files = [
            'finance/index.html',
            'finance/mortgage/mortgage-calculator/index.html'
        ]
        print("Processing test files...")
        results = updater.process_specific_files(test_files)
        
    elif args.target == 'all':
        # Process all HTML files
        print("Processing all HTML files in the project...")
        results = updater.process_all_files()
    
    # Print report
    print(updater.generate_report())
    
    # Summary
    successful = sum(1 for _, success in results if success)
    total = len(results)
    print(f"\nProcessed {successful}/{total} files successfully")
    
    if updater.errors:
        print(f"❌ {len(updater.errors)} errors occurred")
        sys.exit(1)
    else:
        print("✅ All files processed successfully")

if __name__ == '__main__':
    main()