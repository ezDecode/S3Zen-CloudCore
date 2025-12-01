# File Naming Conventions

This document defines the naming conventions used throughout the CloudCore project.

## Overview

Consistent naming conventions improve code readability and maintainability. Follow these guidelines when creating new files.

## Conventions by File Type

### React Components
**Format**: PascalCase  
**Extension**: `.jsx`

```
✅ Good:
- FileExplorer.jsx
- AuthModal.jsx
- ShareButton.jsx
- ErrorBoundary.jsx

❌ Avoid:
- fileExplorer.jsx
- auth-modal.jsx
- share_button.jsx
```

### React Hooks
**Format**: camelCase with `use` prefix  
**Extension**: `.js`

```
✅ Good:
- useAuth.js
- useFavorites.js
- useFileOperations.js
- useStorageStats.js

❌ Avoid:
- UseAuth.js
- use-auth.js
- authHook.js
```

### Utility Functions
**Format**: camelCase  
**Extension**: `.js`

```
✅ Good:
- validationUtils.js
- cryptoUtils.js
- authUtils.js
- errorHandler.js

❌ Avoid:
- ValidationUtils.js
- validation-utils.js
- validation_utils.js
```

### Services
**Format**: camelCase  
**Extension**: `.js`

```
✅ Good:
- s3Service.js
- urlShortener.js
- previewService.js

❌ Avoid:
- S3Service.js
- url-shortener.js
- preview_service.js
```

### Contexts
**Format**: PascalCase with `Context` suffix  
**Extension**: `.jsx`

```
✅ Good:
- FileExplorerContext.jsx
- ThemeContext.jsx
- AuthContext.jsx

❌ Avoid:
- fileExplorerContext.jsx
- file-explorer-context.jsx
```

### Constants
**Format**: camelCase or UPPER_SNAKE_CASE  
**Extension**: `.js`

```
✅ Good:
- constants.js
- API_ENDPOINTS.js
- CONFIG.js

❌ Avoid:
- Constants.js
- api-endpoints.js
```

### Configuration Files
**Format**: lowercase with hyphens or dots  
**Extension**: varies

```
✅ Good:
- vite.config.js
- eslint.config.js
- .env.example
- package.json

❌ Avoid:
- ViteConfig.js
- eslint_config.js
```

### Test Files
**Format**: Match source file + `.test` or `.spec`  
**Extension**: `.js` or `.jsx`

```
✅ Good:
- validationUtils.test.js
- FileExplorer.test.jsx
- s3Service.spec.js

❌ Avoid:
- validation-test.js
- test-file-explorer.jsx
```

### Documentation
**Format**: UPPERCASE or PascalCase  
**Extension**: `.md`

```
✅ Good:
- README.md
- CONTRIBUTING.md
- API.md
- SECURITY.md

❌ Avoid:
- readme.md
- contributing.MD
- api-docs.md
```

## Directory Naming

### General Directories
**Format**: lowercase with hyphens

```
✅ Good:
- file-explorer/
- common/
- modals/
- lazy/

❌ Avoid:
- FileExplorer/
- Common/
- file_explorer/
```

### Special Directories
Some directories follow specific conventions:

```
src/
├── components/      # React components
├── hooks/           # Custom hooks
├── services/        # API services
├── utils/           # Utility functions
├── contexts/        # React contexts
├── config/          # Configuration
├── assets/          # Static assets
└── pages/           # Page components
```

## Examples by Feature

### Authentication Feature
```
src/
├── components/
│   └── auth/
│       ├── AuthModal.jsx          # Component
│       └── LoginForm.jsx          # Component
├── hooks/
│   └── useAuth.js                 # Hook
├── utils/
│   └── authUtils.js               # Utilities
└── contexts/
    └── AuthContext.jsx            # Context
```

### File Explorer Feature
```
src/
├── components/
│   └── file-explorer/
│       ├── FileExplorer.jsx       # Main component
│       ├── FileList.jsx           # Sub-component
│       ├── FileItem.jsx           # Sub-component
│       └── hooks/
│           ├── useFileNavigation.js
│           └── useFileOperations.js
└── services/
    └── aws/
        └── s3Service.js           # Service
```

## Quick Reference

| Type | Format | Example |
|------|--------|---------|
| Component | PascalCase | `FileExplorer.jsx` |
| Hook | camelCase + use | `useAuth.js` |
| Utility | camelCase | `validationUtils.js` |
| Service | camelCase | `s3Service.js` |
| Context | PascalCase + Context | `AuthContext.jsx` |
| Constant | UPPER_SNAKE_CASE | `API_ENDPOINTS.js` |
| Test | source + .test | `utils.test.js` |
| Doc | UPPERCASE | `README.md` |

## Rationale

### Why PascalCase for Components?
- Standard React convention
- Distinguishes components from regular functions
- Matches JSX usage: `<FileExplorer />`

### Why camelCase for Hooks?
- Standard JavaScript convention
- Matches React's built-in hooks: `useState`, `useEffect`
- Clear indication of hook usage

### Why camelCase for Utils/Services?
- Standard JavaScript convention
- Consistent with module exports
- Easy to import: `import { validate } from './utils'`

## Migration Guide

If you have files that don't follow these conventions:

1. **Rename the file** following the convention
2. **Update all imports** in other files
3. **Update any references** in documentation
4. **Test thoroughly** to ensure nothing broke

### Example Migration

```bash
# Before
src/components/file_explorer.jsx

# After
src/components/FileExplorer.jsx

# Update imports
# Before: import FileExplorer from './file_explorer'
# After:  import { FileExplorer } from './FileExplorer'
```

## Exceptions

Some files may not follow these conventions due to:
- Third-party requirements
- Build tool conventions
- Historical reasons

Document any exceptions in code comments.

## Enforcement

- Use ESLint rules for automatic checking
- Code review process
- Pre-commit hooks (optional)

---

Last Updated: December 1, 2025
