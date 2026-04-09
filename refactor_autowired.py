import os
import re

files_to_refactor = [
    "backend/src/main/java/com/example/terraspoter/service/PlantationShowcaseService.java",
    "backend/src/main/java/com/example/terraspoter/service/LandService.java",
    "backend/src/main/java/com/example/terraspoter/service/CloudinaryService.java",
    "backend/src/main/java/com/example/terraspoter/service/AuthService.java",
    "backend/src/main/java/com/example/terraspoter/service/LandVerificationService.java",
    "backend/src/main/java/com/example/terraspoter/service/GrowthUpdateService.java",
    "backend/src/main/java/com/example/terraspoter/service/CustomUserDetailsService.java",
    "backend/src/main/java/com/example/terraspoter/controller/PlantationController.java",
    "backend/src/main/java/com/example/terraspoter/controller/LandVerificationController.java",
    "backend/src/main/java/com/example/terraspoter/controller/LandController.java",
    "backend/src/main/java/com/example/terraspoter/controller/GrowthController.java",
    "backend/src/main/java/com/example/terraspoter/controller/UserController.java",
    "backend/src/main/java/com/example/terraspoter/controller/AuthController.java",
    "backend/src/main/java/com/example/terraspoter/controller/ForgotPasswordController.java"
]

project_root = r"d:\TerraSpotter-Mapping-the-Right-Place-to-Plant"

for rel_path in files_to_refactor:
    abs_path = os.path.join(project_root, rel_path)
    if not os.path.exists(abs_path):
        print(f"File not found: {abs_path}")
        continue
        
    with open(abs_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    original_content = content
    
    # Replace @Autowired\n\s*private to private final
    # and @Autowired private to private final
    content = re.sub(r'@Autowired\s+private\s+', 'private final ', content)
    
    if content != original_content:
        # Add import if not exists
        if "import lombok.RequiredArgsConstructor;" not in content:
            # find last import
            last_import = content.rfind("import ")
            if last_import != -1:
                end_of_line = content.find(";", last_import) + 1
                content = content[:end_of_line] + "\nimport lombok.RequiredArgsConstructor;" + content[end_of_line:]
            else:
                # no imports, put after package
                pkg_match = re.search(r'^package\s+[\w\.]+;', content, re.MULTILINE)
                if pkg_match:
                    content = content[:pkg_match.end()] + "\n\nimport lombok.RequiredArgsConstructor;" + content[pkg_match.end():]

        # Add @RequiredArgsConstructor to class
        if "@RequiredArgsConstructor" not in content:
            # find public class
            class_match = re.search(r'(@(RestController|Service|Component)\s*(?:\n\s*(@(?:RequestMapping|CrossOrigin)[^\n]*\s*)*))?(?=public class)', content)
            if class_match:
                content = content[:class_match.end()] + "@RequiredArgsConstructor\n" + content[class_match.end():]
                
        with open(abs_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Refactored: {rel_path}")
    else:
        print(f"No changes: {rel_path}")

