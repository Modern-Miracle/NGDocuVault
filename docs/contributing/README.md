# Contributing to Docu

Thank you for your interest in contributing to Docu! This guide will help you get started.

## 📑 Table of Contents

- [Code of Conduct](./code-of-conduct.md)
- [Development Process](./development-process.md)
- [Coding Standards](./coding-standards.md)
- [Testing Guidelines](./testing-guidelines.md)
- [Pull Request Process](./pull-request-process.md)
- [Issue Guidelines](./issue-guidelines.md)

## 🤝 How to Contribute

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Docu.git
cd Docu

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/Docu.git
```

### 2. Create a Branch

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

### 3. Make Your Changes

- Follow the coding standards
- Write/update tests
- Update documentation
- Add changeset if needed

### 4. Commit Your Changes

```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: add user role management feature"

# Push to your fork
git push origin feature/your-feature-name
```

### 5. Create Pull Request

- Open PR against `main` branch
- Fill out PR template
- Link related issues
- Wait for review

## 📋 Contribution Guidelines

### Code Style

- **TypeScript**: Use proper types, avoid `any`
- **React**: Functional components with hooks
- **Formatting**: Run `pnpm format` before committing
- **Linting**: Fix all linting errors with `pnpm lint`

### Commit Messages

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build/tooling changes

### Testing

- Write tests for new features
- Maintain test coverage above 80%
- Run tests before submitting PR
- Include integration tests where applicable

### Documentation

- Update relevant documentation
- Add JSDoc comments for public APIs
- Include examples for new features
- Update README if needed

## 🔍 Code Review Process

1. **Automated Checks**
   - Linting passes
   - Tests pass
   - Type checking passes
   - Build succeeds

2. **Manual Review**
   - Code quality
   - Architecture decisions
   - Security considerations
   - Performance impact

3. **Feedback**
   - Address reviewer comments
   - Make requested changes
   - Re-request review

## 🚀 Development Tips

### Running Development Environment

```bash
# Install dependencies
pnpm install

# Start all services
pnpm dev

# Run specific app
pnpm dev:api
pnpm dev:web
pnpm dev:contract
```

### Useful Commands

```bash
# Type checking
pnpm check-types

# Linting
pnpm lint

# Formatting
pnpm format

# Testing
pnpm test
pnpm test:watch

# Building
pnpm build
```

## 🐛 Reporting Issues

- Use issue templates
- Provide reproduction steps
- Include error messages
- Specify environment details

## 💡 Feature Requests

- Check existing issues first
- Describe use case clearly
- Explain expected behavior
- Consider implementation approach

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's license.

Thank you for contributing to Docu! 🎉