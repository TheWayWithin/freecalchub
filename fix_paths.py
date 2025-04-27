
import os
import re

def fix_paths(directory):
    # Walk through all directories and files
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html'):
                file_path = os.path.join(root, file)
                relative_dir = os.path.relpath(root, '.')

                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Fix CSS link paths
                modified_content = re.sub(
                    r'href="(?:\.\./)*css/([^"]+)"',
                    r'href="/css/\1"',
                    content
                )

                # Fix JavaScript script paths
                modified_content = re.sub(
                    r'src="(?:\.\./)*js/([^"]+)"',
                    r'src="/js/\1"',
                    modified_content
                )

                # Fix specific mortgage calculator paths
                if 'mortgage-calculator' in relative_dir:
                    modified_content = re.sub(
                        r'href="css/([^"]+)"',
                        rf'href="/{relative_dir}/css/\1"',
                        modified_content
                    )
                    modified_content = re.sub(
                        r'src="js/([^"]+)"',
                        rf'src="/{relative_dir}/js/\1"',
                        modified_content
                    )

                if content != modified_content:
                    print(f"Fixing paths in: {file_path}")
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(modified_content)

# Run the script from the project root
fix_paths('.')

print("Path fixing complete!")
