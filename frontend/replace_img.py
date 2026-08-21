import os
import re

def get_relative_import(filepath):
    depth = filepath.count('/') - 1
    if depth <= 0:
        return "./components/ui/Image"
    return "../" * depth + "components/ui/Image"

src_dir = "src"
for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith(".tsx") and file != "Image.tsx":
            filepath = os.path.join(root, file)
            with open(filepath, "r") as f:
                content = f.read()

            if "<img" in content:
                # Replace <img with <Image
                content = content.replace("<img", "<Image")
                content = content.replace("</img>", "</Image>")
                
                # Add import if not present
                if "import Image from" not in content:
                    rel_path = get_relative_import(filepath.replace("src/", ""))
                    import_statement = f"import Image from \"{rel_path}\"\n"
                    
                    # Insert after the last import statement or at top
                    lines = content.split('\n')
                    last_import_idx = -1
                    for i, line in enumerate(lines):
                        if line.startswith("import "):
                            last_import_idx = i
                    
                    if last_import_idx != -1:
                        lines.insert(last_import_idx + 1, import_statement.strip())
                    else:
                        lines.insert(0, import_statement.strip())
                        
                    content = '\n'.join(lines)
                
                with open(filepath, "w") as f:
                    f.write(content)
                print(f"Updated {filepath}")
