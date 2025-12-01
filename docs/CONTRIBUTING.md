# Contributing to CloudCore

Thank you for your interest in contributing to CloudCore! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect differing viewpoints and experiences

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- AWS Account (for testing S3 features)
- Basic knowledge of React, Vite, and AWS S3

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/cloudcore.git
   cd cloudcore
   ```

2. **Install Dependencies**
   ```bash
   # Frontend
   npm install

   # Backend
   cd backend
   npm install
   cd ..
   ```

3. **Environment Configuration**
   ```bash
   # Frontend
   cp .env.example .env.local
   # Edit .env.local with your settings

   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your settings
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1 - Frontend
   npm run dev

   # Terminal 2 - Backend
   cd backend
   npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

## Coding Standards

### File Naming Conventions

- **Components**: PascalCase (e.g., `FileExplorer.jsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.js`)
- **Utils**: camelCase (e.g., `validationUtils.js`)
- **Services**: camelCase (e.g., `s3Service.js`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.js`)

### Code Style

- **Indentation**: 4 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Line Length**: Max 100 characters (flexible for readability)
- **Trailing Commas**: Yes (for better diffs)

### React Best Practices

```javascript
// ✅ Good
import { useState, useCallback } from 'react';

export const MyComponent = ({ prop1, prop2 }) => {
    const [state, setState] = useState(null);
    
    const handleClick = useCallback(() => {
        // Handler logic
    }, []);

    return <div>...</div>;
};

// ❌ Avoid
export default function MyComponent(props) {
    // Avoid default exports
    // Avoid destructuring in function params
}
```

### Error Handling

Use standardized error handling from `src/utils/errorHandler.js`:

```javascript
import { createError, createSuccess } from '../utils/errorHandler';

export const myFunction = async () => {
    try {
        const result = await someOperation();
        return createSuccess(result);
    } catch (error) {
        return createError(error.message, error.code);
    }
};
```

### Logging

Use the logger utility instead of console.log:

```javascript
import { createLogger } from '../utils/logger';

const logger = createLogger('MyComponent');

logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');
```

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
feat(s3): add virtual scrolling for large file lists

Implemented virtual scrolling using react-window to improve
performance when displaying directories with >100 files.

Closes #123
```

```bash
fix(auth): resolve session token verification issue

Fixed HMAC signature verification that was causing false
negatives on session restoration.
```

## Pull Request Process

### Before Submitting

1. **Update from main**
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Run tests**
   ```bash
   npm test
   ```

3. **Check for linting errors**
   ```bash
   npm run lint
   ```

4. **Build successfully**
   ```bash
   npm run build
   ```

### PR Checklist

- [ ] Code follows the style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings or errors
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Commit messages follow guidelines

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
```

## Testing

### Running Tests

```bash
# Frontend tests
npm test

# Backend tests
cd backend
npm test
```

### Writing Tests

```javascript
// Example test structure
describe('MyComponent', () => {
    it('should render correctly', () => {
        // Test implementation
    });

    it('should handle user interaction', () => {
        // Test implementation
    });
});
```

## Documentation

### Code Documentation

Use JSDoc for functions:

```javascript
/**
 * Upload a file to S3
 * @param {File} file - File to upload
 * @param {string} key - S3 object key
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const uploadFile = async (file, key, onProgress) => {
    // Implementation
};
```

### README Updates

Update README.md when adding:
- New features
- Configuration options
- Dependencies
- Breaking changes

## Project Structure

```
cloudcore/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   ├── contexts/       # React contexts
│   └── config/         # Configuration files
├── backend/
│   ├── src/
│   │   ├── routes/     # Express routes
│   │   └── utils/      # Backend utilities
│   └── data/           # SQLite database
├── docs/               # Documentation
└── tests/              # Test files
```

## Getting Help

- **Issues**: Check existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Refer to docs/ folder

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to CloudCore! 🚀
