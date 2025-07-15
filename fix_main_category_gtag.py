#!/usr/bin/env python3
"""
Fix legacy gtag.js on main category pages

This script removes legacy gtag.js from the four main category pages
that were missed in the previous site-wide GTM compliance fix.
"""

import sys
import os
sys.path.append('/Users/jamiewatters/DevProjects/freecalchub')
from fix_gtm_csp import GTMCSPFixer

# The four main category pages that still have legacy gtag.js
main_category_pages = [
    "/Users/jamiewatters/DevProjects/freecalchub/math/index.html",
    "/Users/jamiewatters/DevProjects/freecalchub/health/index.html", 
    "/Users/jamiewatters/DevProjects/freecalchub/date-time/index.html",
    "/Users/jamiewatters/DevProjects/freecalchub/lifestyle/index.html"
]

# Check if we should run live
dry_run = '--live' not in sys.argv

fixer = GTMCSPFixer(dry_run=dry_run)
fixer.sitemap_path = "/Users/jamiewatters/DevProjects/freecalchub/sitemap.xml"

print(f"{'DRY RUN' if dry_run else 'LIVE FIXING'}: Removing legacy gtag.js from {len(main_category_pages)} main category pages\n")

for file_path in main_category_pages:
    if os.path.exists(file_path):
        fixer.fix_file(file_path)
    else:
        print(f"❌ File not found: {file_path}")

if not dry_run and fixer.fixes_applied:
    print(f"\n🎉 {len(fixer.fixes_applied)} main category pages were fixed!")
    print("Legacy gtag.js removed from all main category pages.")