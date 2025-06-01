# Contributing to NGDocuVault

Thank you for your interest in contributing to NGDocuVault! This guide will help you get started with contributing to this open-source secure document management platform designed for **enterprise and individual document verification needs**.

> **🌐 Next Generation Document Management**: NGDocuVault leverages blockchain technology and advanced cryptographic methods to ensure document authenticity and security.

> **🏛️ Organizations**: Developed by [Modern Miracle](https://modern-miracle.com), focusing on innovative document security solutions.

## 🌟 **How to Contribute**

### **Ways to Contribute**
- 🐛 **Bug Reports** - Help us identify and fix issues
- 💡 **Feature Requests** - Suggest new functionality
- 📝 **Documentation** - Improve guides, examples, and explanations
- 🔧 **Code Contributions** - Fix bugs, implement features, optimize performance
- 🧪 **Testing** - Write tests, report test results, improve test coverage
- 🎨 **UI/UX Improvements** - Enhance user interface and experience
- 🔒 **Security** - Report vulnerabilities, improve security practices
- ⛓️ **Blockchain Integration** - Improve smart contract functionality

## 🚀 **Getting Started**

### **1. Fork and Clone**
```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/your-username/NGDocuVault.git
cd NGDocuVault/ngdocuvault-fullap

# Add the original repository as upstream
git remote add upstream https://github.com/Modern-Miracle/NGDocuVault.git
```

### **2. Set Up Development Environment**
```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development servers
pnpm dev

# Run the full stack (API + Web + Contracts)
./start.sh
```

### **3. Create a Feature Branch**
```bash
# Create a new branch for your feature/fix
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

## 📋 **Development Guidelines**

### **Code Style**
- **Frontend (Next.js/TypeScript)**: Follow the existing ESLint configuration
- **API (Node.js/TypeScript)**: Use ES6+ features, async/await patterns
- **Smart Contracts (Solidity)**: Follow Solidity best practices, comprehensive testing required
- **Documentation**: Use clear, concise language with examples

### **Commit Message Convention**
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(web): add document batch upload functionality
fix(api): resolve IPFS timeout issue
docs(readme): update smart contract deployment instructions
test(contract): add edge case tests for document verification
```

### **Pull Request Process**

1. **Ensure your code follows our guidelines:**
   ```bash
   # Frontend linting
   cd apps/web && pnpm lint
   
   # API linting
   cd apps/api && pnpm lint
   
   # Run all tests
   pnpm test
   
   # Smart contract tests
   cd apps/contract && pnpm test
   ```

2. **Update documentation** if your changes affect:
   - API endpoints
   - Environment variables
   - Setup procedures
   - User interface
   - Smart contract interfaces

3. **Write or update tests** for new functionality

4. **Create a descriptive pull request:**
   - Clear title and description
   - Reference any related issues
   - Include screenshots for UI changes
   - List breaking changes (if any)

## 🏗️ **Project Structure Guide**

### **Multi-App Architecture (`/ng-docuvault/`)**
```
apps/
├── web/               # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── api/               # Node.js API backend
│   ├── src/
│   │   ├── controllers/   # HTTP controllers
│   │   ├── services/      # Business logic
│   │   ├── models/        # Data models
│   │   ├── routes/        # API routes
│   │   └── middleware/    # Express middleware
├── contract/          # Smart contracts and deployment
│   ├── src/              # Solidity contracts
│   ├── test/             # Contract tests
│   ├── scripts/          # Deployment scripts
│   └── circuits/         # ZK-SNARK circuits
└── docs/              # Documentation site
    └── app/              # Next.js documentation
```

### **Frontend Architecture (`/apps/web/`)**
- **Framework**: React with Vite
- **Styling**: Tailwind CSS + Custom components
- **State Management**: React Query + Context
- **Authentication**: SIWE (Sign-In with Ethereum)
- **Blockchain**: Wagmi + Viem for Web3 interactions

### **Backend Architecture (`/apps/api/`)**
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: TypeORM with PostgreSQL
- **Storage**: IPFS integration
- **Authentication**: JWT + SIWE validation
- **Blockchain**: Contract interaction layer

### **Smart Contract Architecture (`/apps/contract/`)**
- **Language**: Solidity 0.8.x
- **Framework**: Hardhat
- **Testing**: Hardhat + Chai
- **ZK-SNARKs**: Circom circuits for privacy
- **Standards**: ERC standards compliance

## 🧪 **Testing Guidelines**

### **Running Tests**
```bash
# All tests across the monorepo
pnpm test

# Frontend tests
cd apps/web && pnpm test

# API tests
cd apps/api && pnpm test

# Smart contract tests
cd apps/contract && pnpm test

# ZK circuit tests
cd apps/contract/circuits && npm run test
```

### **Writing Tests**
- **Frontend**: Vitest + React Testing Library
- **API**: Jest with supertest for integration tests
- **Smart Contract**: Hardhat + Chai, aim for 100% coverage
- **ZK Circuits**: Custom circuit testing framework

### **Test Coverage Standards**
- **Frontend**: Minimum 80% coverage for critical components
- **API**: Minimum 90% coverage for business logic
- **Smart Contracts**: Aim for 100% line and branch coverage

## 🔒 **Security Considerations**

### **Reporting Security Issues**
- **DO NOT** open public issues for security vulnerabilities
- Email security issues to: [security@modern-miracle.com]
- Include detailed steps to reproduce
- Allow time for fix before public disclosure

### **Security Best Practices**
- Never commit real private keys or secrets
- Use environment variables for all sensitive data
- Follow OWASP guidelines for web application security
- Ensure document handling complies with privacy regulations (GDPR, CCPA)
- Test smart contracts thoroughly for common vulnerabilities
- **Document Privacy**: Implement zero-knowledge patterns for sensitive documents
- **Cryptographic Security**: Use audited cryptographic libraries

## 📚 **Documentation Standards**

### **Code Documentation**
- Use JSDoc for JavaScript/TypeScript functions
- Comment complex business logic
- Document API endpoints with OpenAPI/Swagger
- Include inline comments for smart contract functions
- Document ZK circuit logic and proofs

### **User Documentation**
- Update README.md for new features
- Add examples to environment variable guides
- Create troubleshooting guides for common issues
- Document deployment procedures
- Maintain API documentation

## 🎯 **Good First Issues**

Looking for a place to start? Look for issues labeled:
- `good first issue` - Beginner-friendly
- `documentation` - Improve docs
- `frontend` - UI/UX improvements
- `testing` - Add test coverage
- `enhancement` - Feature improvements
- `smart-contract` - Blockchain functionality

## 🤝 **Community Guidelines**

### **Code of Conduct**
- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers get started
- Follow document privacy principles

### **Getting Help**
- Check existing issues and documentation first
- Use GitHub Discussions for questions
- Include relevant logs and system information
- Be specific about your environment and steps taken

## 📊 **Performance Guidelines**

### **Frontend Performance**
- Use React.memo() for expensive components
- Implement proper loading states
- Optimize image sizes and formats
- Test document upload/download performance

### **API Performance**
- Monitor response times for document operations
- Implement proper error handling and retries
- Cache expensive operations when appropriate
- Monitor IPFS upload/download performance

### **Smart Contract Optimization**
- Minimize gas usage in contract functions
- Use events for logging instead of storage when possible
- Test gas costs with different document sizes
- Consider batch operations for multiple documents

## 🚢 **Release Process**

### **Versioning**
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### **Release Checklist**
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Security review completed
- [ ] Performance impact assessed
- [ ] Migration guide (if needed)
- [ ] Changelog updated
- [ ] Smart contracts audited (for contract changes)

## 📞 **Contact**

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and community discussion
- **Organizations**: 
  - **Modern Miracle**: [contact@modern-miracle.com](mailto:contact@modern-miracle.com)

Thank you for contributing to NGDocuVault! Together, we can build better document security technology. 📄🔒✨