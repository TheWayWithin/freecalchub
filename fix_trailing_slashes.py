
import os
import re

def fix_trailing_slashes(directory):
    # Walk through all directories and files
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html'):
                file_path = os.path.join(root, file)
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Fix href attributes that point to folders without trailing slash
                modified_content = re.sub(
                    r'href="(/[^"]*?)(?<!/)(?<!\.html|\.css|\.js|\.xml|\.txt|\.svg|\.jpg|\.png|\.gif)"',
                    r'href="\1/"',
                    content
                )

                if content != modified_content:
                    print(f"Fixing trailing slashes in: {file_path}")
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(modified_content)

# Run the script from the project root
fix_trailing_slashes('.')

print("Trailing slash fixing complete!")
