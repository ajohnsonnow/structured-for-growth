#!/usr/bin/env python3
"""
Fix template literal escaping in templateData.js

This script properly fixes the escaping issues in the template data file.
The file structure is:
{
    code: `...JavaScript code with template literals...`,
    usage: `...HTML usage examples...`,
    notes: `...HTML notes...`
}

The problem is that inner backticks inside the code field aren't properly escaped.
"""

import re

def fix_template_escaping(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    fixed_lines = []
    in_code_block = False
    in_usage_block = False
    in_notes_block = False
    
    for i, line in enumerate(lines):
        # Track when we enter/exit the main template fields
        if re.match(r'\s*code:\s*`', line) and not line.rstrip().endswith('`,'):
            in_code_block = True
            in_usage_block = False
            in_notes_block = False
            fixed_lines.append(line)
            continue
            
        if re.match(r'\s*usage:\s*`', line):
            in_code_block = False
            in_usage_block = True
            in_notes_block = False
            fixed_lines.append(line)
            continue
            
        if re.match(r'\s*notes:\s*`', line):
            in_code_block = False
            in_usage_block = False
            in_notes_block = True
            fixed_lines.append(line)
            continue
        
        # Check for end of block (backtick followed by comma at end of line)
        stripped = line.rstrip()
        if stripped.endswith('`,') or stripped.endswith('`'):
            # Check if this is the closing of a code/usage/notes block
            # by looking at next line
            if i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                if (next_line.startswith('usage:') or 
                    next_line.startswith('notes:') or 
                    next_line.startswith('},') or
                    next_line.startswith('}')):
                    in_code_block = False
                    in_usage_block = False
                    in_notes_block = False
                    fixed_lines.append(line)
                    continue
        
        # Inside a code block, escape unescaped backticks
        if in_code_block:
            # Don't escape backticks that are already escaped
            # Find unescaped backticks (not preceded by backslash)
            # Pattern: backtick not preceded by odd number of backslashes
            
            new_line = ""
            j = 0
            while j < len(line):
                if line[j] == '`':
                    # Count preceding backslashes
                    num_backslashes = 0
                    k = j - 1
                    while k >= 0 and line[k] == '\\':
                        num_backslashes += 1
                        k -= 1
                    
                    # If even number of backslashes (or 0), this backtick is unescaped
                    if num_backslashes % 2 == 0:
                        new_line += '\\`'
                    else:
                        new_line += '`'
                else:
                    new_line += line[j]
                j += 1
            
            fixed_lines.append(new_line)
        else:
            fixed_lines.append(line)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(fixed_lines)
    
    print(f"Processed {len(lines)} lines")

if __name__ == '__main__':
    fix_template_escaping('client/js/templateData.js')


