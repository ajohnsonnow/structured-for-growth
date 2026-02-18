# Shell & PowerShell Scripting Standards (P5.6.5)

> Standards for Bash/POSIX shell and PowerShell scripts in the project.

---

## Bash / POSIX Shell

### File Header

```bash
#!/usr/bin/env bash
# Script: name.sh
# Purpose: Brief description
# Usage: ./name.sh [options]
set -euo pipefail
IFS=$'\n\t'
```

- `set -e` — exit on error
- `set -u` — error on undefined variables
- `set -o pipefail` — catch pipe failures

### Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Files | kebab-case | `fix-escaping.sh` |
| Variables | UPPER_SNAKE_CASE | `DB_PATH="/data/db"` |
| Functions | snake_case | `check_prerequisites()` |
| Local vars | lowercase snake_case with `local` | `local file_count=0` |

### Best Practices

```bash
# ✅ Good — quote variables to prevent word splitting
cp "${SOURCE_DIR}/file.txt" "${DEST_DIR}/"

# ❌ Bad — unquoted variable
cp $SOURCE_DIR/file.txt $DEST_DIR/

# ✅ Good — use [[ ]] for conditionals
if [[ -f "${config_file}" ]]; then ...

# ✅ Good — use arrays for lists
files=("one.txt" "two.txt" "three.txt")
for f in "${files[@]}"; do ...

# ✅ Good — error handling function
die() { echo "ERROR: $*" >&2; exit 1; }
```

### ShellCheck

All shell scripts must pass ShellCheck (SC level: error + warning).

```bash
# Run ShellCheck
shellcheck scripts/*.sh
```

---

## PowerShell

### File Header

```powershell
<#
.SYNOPSIS
    Brief description.
.DESCRIPTION
    Detailed description of what the script does.
.PARAMETER Name
    Description of parameter.
.EXAMPLE
    .\script.ps1 -Name "value"
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$Name
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
```

### Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Files | PascalCase or kebab-case | `Setup.ps1`, `fix-escaping.ps1` |
| Functions | Verb-Noun (approved verbs) | `Get-UserConfig`, `Set-Permission` |
| Variables | PascalCase | `$DatabasePath` |
| Parameters | PascalCase | `-OutputPath` |

### Best Practices

```powershell
# ✅ Good — use cmdlets, not aliases
Get-ChildItem -Path $Path -Recurse
ForEach-Object { $_.Name }

# ❌ Bad — aliases (not portable)
ls $Path -r
% { $_.Name }

# ✅ Good — error handling
try {
    $result = Invoke-RestMethod -Uri $Uri
} catch {
    Write-Error "API call failed: $_"
    exit 1
}

# ✅ Good — use splatting for long commands
$params = @{
    Path        = $OutputDir
    ItemType    = 'Directory'
    Force       = $true
}
New-Item @params
```

### PSScriptAnalyzer

```powershell
# Run PSScriptAnalyzer
Invoke-ScriptAnalyzer -Path scripts/*.ps1 -Severity Warning
```
