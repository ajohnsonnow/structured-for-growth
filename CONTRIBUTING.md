# Contributing to Structured For Growth

Thank you for considering contributing to this project! This document provides guidelines and information to make the contribution process smooth.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Security](#security)

## Code of Conduct

Be respectful, constructive, and professional. We are committed to providing a welcoming and inclusive environment for everyone.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a feature branch from `main`

## Development Setup

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/structured-for-growth.git
cd structured-for-growth

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Production | Secret key for JWT signing (required in production) |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Environment: development, test, production |
| `ADMIN_USERNAME` | No | Initial admin username |
| `ADMIN_EMAIL` | No | Initial admin email |
| `ADMIN_PASSWORD` | No | Initial admin password |

## Development Workflow

### Branch Naming

- `feature/description` — New features
- `fix/description` — Bug fixes
- `docs/description` — Documentation updates
- `refactor/description` — Code refactoring
- `test/description` — Test additions/fixes

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`

Examples:
```
feat(auth): add TOTP multi-factor authentication
fix(portal): correct payment display formatting
docs(api): update OpenAPI spec for campaigns endpoint
test(clients): add edge case tests for search filtering
```

### Pre-commit Hooks

This project uses Husky and lint-staged to enforce code quality before commits:

- **ESLint** runs on all staged `.js` files
- **Prettier** formats all staged `.js`, `.json`, `.css`, and `.md` files

If your commit is blocked by linting errors, fix them before committing.

## Code Standards

### JavaScript

- ES Modules (`import`/`export`) — no CommonJS
- Use `const` by default, `let` when reassignment is needed, never `var`
- Strict equality (`===`) always
- Avoid `eval()` and `implied eval`
- Use async/await over raw Promise chains
- Provide JSDoc comments for exported functions

### CSS

- Use CSS custom properties (defined in `main.css`)
- Follow the existing naming conventions (BEM-adjacent)
- Ensure color contrast ratio >= 4.5:1 (WCAG AA)

### HTML

- Semantic HTML5 elements (`<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`)
- ARIA landmarks and labels where appropriate
- All images must have `alt` attributes
- All form inputs must have associated `<label>` elements
- Decorative icons should have `aria-hidden="true"`

### Security

- Never commit secrets, API keys, or credentials
- Use `getJwtSecret()` from `server/middleware/auth.js` — never inline secrets
- Validate all user input server-side with `express-validator`
- Sanitize output to prevent XSS
- Follow the principle of least privilege for access control

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run a specific test file
npx vitest tests/routes/auth.test.js
```

### Writing Tests

- Place tests in `tests/` mirroring the source folder structure
- Name test files with `.test.js` suffix
- Use the test helpers from `tests/helpers.js`:
  - `createTestApp()` — creates an Express app with mocked database
  - `generateTestToken()` — creates a JWT for authenticated requests
  - `adminToken()` / `userToken()` — convenience helpers
  - `authHeader()` — returns `{ Authorization: 'Bearer <token>' }`

### Test Coverage

Minimum coverage thresholds (enforced in CI):
- Lines: 60%
- Functions: 60%
- Branches: 60%
- Statements: 60%

## Pull Request Process

1. **Create your branch** from `main`
2. **Make your changes** following the code standards above
3. **Write or update tests** for your changes
4. **Run the CI pipeline locally**: `npm run ci`
5. **Update documentation** if your changes affect APIs or behavior
6. **Submit a pull request** with a clear title and description

### PR Checklist

- [ ] Code follows the project style guidelines
- [ ] Tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Coverage thresholds are maintained
- [ ] Documentation is updated (if applicable)
- [ ] CHANGELOG.md is updated (for features and fixes)
- [ ] No hardcoded secrets or credentials

## Security

If you discover a security vulnerability, **do NOT open a public issue**. Instead, please email [contact@structuredforgrowth.com](mailto:contact@structuredforgrowth.com) with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide a timeline for resolution.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
