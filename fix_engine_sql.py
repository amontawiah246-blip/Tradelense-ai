import re

with open('engine.py', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    # Skip comments
    if line.strip().startswith('#'):
        new_lines.append(line)
        continue
    
    # Skip urls
    if 'http' in line or 'deriv.com' in line:
        new_lines.append(line)
        continue
        
    # specific skip for that f-string
    if "days_away" in line or "close" in line and '"?"' in line:
        new_lines.append(line)
        continue

    # if line has a SQL '?'
    if '?' in line:
        line = line.replace('?', '%s')
    
    new_lines.append(line)

with open('engine.py', 'w') as f:
    f.writelines(new_lines)
