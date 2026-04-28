import os
import re

frontend_dir = r"c:\Users\sunny\Desktop\HireFlip-Ai\frontend"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Match 'http://localhost:8000/something'
    # We want to replace it with `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/something`
    # The regex needs to handle single quotes around the original string.
    
    new_content = re.sub(
        r"'http://localhost:8000([^']*)'",
        r"`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}\1`",
        content
    )

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk(frontend_dir):
    if 'node_modules' in dirs:
        dirs.remove('node_modules')
    if '.next' in dirs:
        dirs.remove('.next')
        
    for file in files:
        if file.endswith('.js') or file.endswith('.jsx'):
            process_file(os.path.join(root, file))

print("Done replacing frontend URLs.")
