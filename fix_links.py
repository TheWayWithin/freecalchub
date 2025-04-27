import os
import re

def fix_links(directory):
    # Walk through all directories and files
    for root, dirs, files in os.walk(directory):
        for file in files:
            # Only process HTML files
            if file.endswith('.html'):
                file_path = os.path.join(root, file)

                # Read the file content
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Replace links with index.html
                modified_content = re.sub(r'href="([^"]*)/index\.html"', r'href="\1/"', content)

                # Replace links ending with .html
                modified_content = re.sub(r'href="([^"]*)\.html"', r'href="\1"', modified_content)

                # Only write back if changes were made
                if content != modified_content:
                    print(f"Fixing links in: {file_path}")
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(modified_content)

# Run the script from the project root
fix_links('.')

print("Link fixing complete!")
