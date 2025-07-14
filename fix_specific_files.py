#!/usr/bin/env python3
"""Fix specific files that still have issues"""

import sys
import os
sys.path.append('/Users/jamiewatters/DevProjects/freecalchub')
from fix_gtm_csp import GTMCSPFixer

# Files we identified as still having issues
target_files = [
    "/Users/jamiewatters/DevProjects/freecalchub/finance/investment/compound-interest-calculator/index.html",
    "/Users/jamiewatters/DevProjects/freecalchub/conversions/length/length-unit-calculator/index.html",
    "/Users/jamiewatters/DevProjects/freecalchub/date-time/business-days/index.html"
]

# Check if we should run live
dry_run = '--live' not in sys.argv

fixer = GTMCSPFixer(dry_run=dry_run)
fixer.sitemap_path = "/Users/jamiewatters/DevProjects/freecalchub/sitemap.xml"

print(f"{'DRY RUN' if dry_run else 'LIVE FIXING'}: Processing {len(target_files)} specific files\n")

for file_path in target_files:
    if os.path.exists(file_path):
        fixer.fix_file(file_path)
    else:
        print(f"❌ File not found: {file_path}")

if not dry_run and fixer.fixes_applied:
    print(f"\n🎉 {len(fixer.fixes_applied)} files were fixed!")