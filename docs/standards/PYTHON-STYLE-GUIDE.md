# Python Style Guide (P5.6.2)

> Standards for all Python code in Structured for Growth (scripts, data processing, analysis tools). Based on PEP 8, PEP 484, and Google Python Style Guide.

---

## Formatting

- **Formatter:** Black (line length 88)
- **Linter:** Ruff (replaces flake8, isort, pydocstyle)
- **Type checker:** mypy (strict mode)

```toml
# pyproject.toml
[tool.black]
line-length = 88
target-version = ['py312']

[tool.ruff]
line-length = 88
select = ["E", "F", "I", "N", "W", "UP", "S", "B", "A", "C4", "DTZ", "T20", "ICN"]

[tool.mypy]
python_version = "3.12"
strict = true
warn_return_any = true
warn_unused_configs = true
```

---

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Variables, functions | snake_case | `user_name`, `get_score()` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES = 3` |
| Classes | PascalCase | `class ComplianceEngine:` |
| Modules | snake_case | `compliance_utils.py` |
| Private | leading underscore | `_internal_helper()` |
| Type variables | PascalCase | `T = TypeVar('T')` |

---

## Type Hints

- **All** function signatures must have type hints (PEP 484).
- Use `from __future__ import annotations` for modern syntax.
- Prefer built-in generics: `list[str]` over `List[str]`.

```python
from __future__ import annotations

def calculate_sprs_score(
    controls: list[dict[str, str]],
    weights: dict[str, int] | None = None,
) -> int:
    """Calculate SPRS score from control assessments."""
    ...
```

---

## Docstrings

- Use Google-style docstrings (PEP 257).
- All public functions, classes, and modules must have docstrings.

```python
def generate_report(framework: str, format: str = "json") -> dict:
    """Generate a compliance report for the given framework.

    Args:
        framework: The compliance framework identifier (e.g., 'nist-800-171').
        format: Output format — 'json' or 'csv'.

    Returns:
        A dictionary containing the report data.

    Raises:
        ValueError: If the framework is not recognized.
    """
    ...
```

---

## Imports

Order imports as:

1. Standard library
2. Third-party packages
3. Local modules

```python
import os
import sys
from pathlib import Path

import requests
from pydantic import BaseModel

from scripts.utils import format_date
```

---

## Error Handling

- Use specific exceptions, not bare `except:`.
- Always log or re-raise — never swallow silently.

```python
# ✅ Good
try:
    data = load_config(path)
except FileNotFoundError:
    logger.error("Config file not found: %s", path)
    raise
except json.JSONDecodeError as e:
    logger.error("Invalid JSON in config: %s", e)
    raise ValueError(f"Malformed config: {e}") from e

# ❌ Bad
try:
    data = load_config(path)
except:
    pass
```

---

## Security (OWASP)

- Never use `eval()`, `exec()`, or `__import__()` with user input.
- Use parameterized queries for any SQL.
- Validate all external input with Pydantic or similar.
- Never log secrets, tokens, or passwords.
