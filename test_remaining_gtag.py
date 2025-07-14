#!/usr/bin/env python3
"""Test script to check specific files for remaining gtag.js issues"""

import sys
import os
sys.path.append('/Users/jamiewatters/DevProjects/freecalchub')
from fix_gtm_csp import GTMCSPFixer

# Files we identified as still having legacy gtag.js
test_files = [
    "/Users/jamiewatters/DevProjects/freecalchub/finance/investment/compound-interest-calculator/index.html",
    "/Users/jamiewatters/DevProjects/freecalchub/date-time/index.html", 
    "/Users/jamiewatters/DevProjects/freecalchub/conversions/length/length-unit-calculator/index.html",
    "/Users/jamiewatters/DevProjects/freecalchub/date-time/business-days/index.html"
]

fixer = GTMCSPFixer(dry_run=True)

print("Checking files for remaining legacy gtag.js issues:\n")

for file_path in test_files:
    if os.path.exists(file_path):
        print(f"Analyzing: {file_path}")
        issues = fixer.analyze_file(file_path)
        if issues:
            print(f"  Issues found: {', '.join(issues)}")
        else:
            print(f"  ✅ No issues found")
        print()
    else:
        print(f"  ❌ File not found: {file_path}")