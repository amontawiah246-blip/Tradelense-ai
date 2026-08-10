with open('engine.py', 'r') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if "rows = c.execute(query, params).fetchall()" in line:
        indent = line[:len(line) - len(line.lstrip())]
        new_lines.append(indent + "c.execute(query, params)\n")
        new_lines.append(indent + "rows = c.fetchall()\n")
    else:
        new_lines.append(line)

with open('engine.py', 'w') as f:
    f.writelines(new_lines)
