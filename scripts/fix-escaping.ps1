$c = Get-Content "client\js\templateData.js" -Raw
# DO NOT fix triple-escaped backticks - they need proper escaping for nested templates
# $c = $c -replace '\\\\\\`', '\`'
# DO NOT fix triple-escaped dollar signs - they need to stay as \$ to prevent interpolation
# $c = $c -replace '\\\\\\\$', '\$'
# Fix ALL escaped backticks that start code/usage/notes fields
$c = $c -replace 'code:\s*\\`', 'code: `'
$c = $c -replace 'usage:\s*\\`', 'usage: `'
$c = $c -replace 'notes:\s*\\`', 'notes: `'
# Fix escaped closing backticks ONLY when followed by newline + spaces + usage/notes/},/]
# These are field-level closings, not inner template closings
$c = $c -replace '\\`(,\r?\n\s+usage:)', '`$1'
$c = $c -replace '\\`(,\r?\n\s+notes:)', '`$1'
$c = $c -replace '\\`(\r?\n\s+},)', '`$1'
$c = $c -replace '\\`(\r?\n\];)', '`$1'
$c | Set-Content "client\js\templateData.js" -NoNewline
Write-Host "Fix complete"
