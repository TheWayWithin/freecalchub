#!/bin/bash

# Script to update Google Analytics ID across all HTML files
# From: G-V8PR7EB78N
# To: G-R1QHNSSWTC

# Find all HTML files and update the Google Analytics ID
find . -name "*.html" -type f -exec sed -i 's/G-V8PR7EB78N/G-R1QHNSSWTC/g' {} \;

echo "Google Analytics ID updated in all HTML files"
