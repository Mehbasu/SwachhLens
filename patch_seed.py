import re
with open('d:/Technova/SwachhLens/backend/seed_data.py', 'r') as f:
    content = f.read()

# Add location fields to each complaint dictionary
modified_content = re.sub(
    r'(\'|\")ai_confidence(\'|\"):\s*([\d.]+)',
    r'\1ai_confidence\2: \3,\n    \1state\2: \1Bihar\2,\n    \1district\2: \1Patna\2,\n    \1city\2: \1Patna\2',
    content
)

with open('d:/Technova/SwachhLens/backend/seed_data.py', 'w') as f:
    f.write(modified_content)
