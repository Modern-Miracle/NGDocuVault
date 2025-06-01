# Contributing to NGDocuVault

Thank you for your interest in contributing to NGDocuVault! This project is an open-source initiative developed as part of the NGI Sargasso program, creating an inclusive, blockchain-enabled document management system for immigrants.

## 🎯 Project Mission

NGDocuVault aims to ensure data sovereignty and seamless identity verification across EU, US, and Canadian standards, with Docu Assist providing AI-driven multilingual and barrier-free interface for legal guidance.

## 🤝 How to Contribute

We welcome contributions from developers, designers, documentation writers, and community members. Here are the main ways you can contribute:

### 1. Development Contributions
- **Bug fixes**: Help identify and fix issues
- **Feature development**: Implement new features according to our roadmap
- **Performance improvements**: Optimize code and smart contracts
- **Testing**: Write and improve test coverage

### 2. Documentation
- **User guides**: Help improve documentation for end users
- **Developer docs**: Enhance technical documentation
- **Translations**: Help make documentation accessible in multiple languages
- **API documentation**: Keep API docs up to date

### 3. Community Support
- **Issue triage**: Help categorize and prioritize issues
- **User support**: Answer questions in discussions
- **Code review**: Review pull requests from other contributors

## 🛠️ Development Setup

### Prerequisites

- **Node.js 18+** and **pnpm**
- **Docker** (for database and full stack development)
- **Git**
- Basic understanding of TypeScript, React, and Ethereum/Solidity

### Environment Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ng-docuvault.git
   cd ng-docuvault
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment files**
   ```bash
   cp .env.example .env
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   cp apps/contract/.env.example apps/contract/.env
   ```

4. **Configure environment variables**
   - Fill in your database connection details
   - Add IPFS storage credentials (Pinata or Web3.Storage)
   - Set JWT secrets for authentication

5. **Start development environment**
   ```bash
   # Quick start (recommended for new contributors)
   ./run-simple.sh
   
   # Or manual setup for advanced development
   # See README.md for detailed instructions
   ```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow our coding standards (see below)
   - Write tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   # Run all tests
   pnpm test
   
   # Run linting
   pnpm lint
   
   # Check types
   pnpm check-types
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: your descriptive commit message"
   ```

5. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Coding Standards

### General Guidelines

- **TypeScript**: Use TypeScript for all new code
- **Code formatting**: Use Prettier (configured in the project)
- **Linting**: Follow ESLint rules
- **Testing**: Write tests for new features and bug fixes

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Examples:**
```
feat(api): add document encryption before IPFS upload
fix(web): resolve wallet connection issue with MetaMask
docs(contract): update smart contract deployment guide
test(api): add integration tests for SIWE authentication
```

### Code Style Guidelines

#### TypeScript/JavaScript
- Use meaningful variable and function names
- Prefer `const` over `let` when possible
- Use arrow functions for simple functions
- Add JSDoc comments for complex functions
- Follow the existing code patterns in each application

#### React Components
- Use functional components with hooks
- Prefer composition over inheritance
- Use TypeScript interfaces for props
- Keep components focused and small
- Use proper error boundaries

#### Smart Contracts
- Follow Solidity best practices
- Use NatSpec documentation
- Implement proper access controls
- Emit events for important state changes
- Optimize for gas efficiency

## 🔍 Testing Guidelines

### API Testing
```bash
cd apps/api
pnpm test              # Run all tests
pnpm test:watch        # Run tests in watch mode
pnpm test:coverage     # Generate coverage report
```

### Smart Contract Testing
```bash
cd apps/contract
pnpm test              # Run contract tests
pnpm coverage          # Generate coverage report
```

### Frontend Testing
```bash
cd apps/web
pnpm test              # Run component tests
```

### Test Coverage Expectations
- **New features**: Must include comprehensive tests
- **Bug fixes**: Should include regression tests
- **Critical paths**: Aim for 80%+ coverage
- **Smart contracts**: Aim for 90%+ coverage

## 📚 Documentation Standards

### Code Documentation
- Use TypeScript types for self-documenting APIs
- Add JSDoc comments for complex functions
- Document environment variables and configuration options
- Keep README files up to date

### User Documentation
- Write clear, step-by-step instructions
- Include screenshots for UI features
- Provide examples and use cases
- Consider multiple skill levels (beginner to advanced)

### API Documentation
- Document all endpoints with OpenAPI/Swagger
- Include request/response examples
- Document error responses
- Keep authentication requirements clear

## 🐛 Bug Reports

When filing bug reports, please include:

1. **Clear description**: What is the expected vs. actual behavior?
2. **Steps to reproduce**: Detailed steps to recreate the issue
3. **Environment details**: OS, browser, Node.js version, etc.
4. **Logs and screenshots**: Include relevant error messages
5. **Impact assessment**: How does this affect users?

**Bug Report Template:**
```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS 12.0]
- Browser: [e.g., Chrome 95.0]
- Node.js: [e.g., 18.17.0]
- App version: [e.g., commit hash]

## Additional Context
Any other relevant information
```

## 💡 Feature Requests

For feature requests, please:

1. **Check existing issues**: Avoid duplicates
2. **Provide context**: Explain the problem you're trying to solve
3. **Describe the solution**: What would you like to see implemented?
4. **Consider alternatives**: Are there other ways to solve this?
5. **Think about impact**: Who would benefit from this feature?

## 🔒 Security

### Reporting Security Vulnerabilities

**Do not create public issues for security vulnerabilities.**

Instead, please email security@hora-ev.eu with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested fix (if any)

### Security Guidelines for Contributors

- Never commit secrets, API keys, or private keys
- Use environment variables for sensitive configuration
- Follow smart contract security best practices
- Validate all user inputs
- Use established cryptographic libraries

## 👥 Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inclusive experience for everyone. We expect all contributors to:

- **Be respectful**: Treat everyone with respect and kindness
- **Be inclusive**: Welcome newcomers and help them learn
- **Be collaborative**: Work together to find the best solutions
- **Be constructive**: Provide helpful feedback and suggestions
- **Be patient**: Remember that people have different skill levels and backgrounds

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and community discussions
- **Pull Requests**: Code review and collaboration
- **Email**: Direct communication with the team (contact@hora-ev.eu)

## 🎓 Learning Resources

### Project-Specific Resources
- [Project Documentation](docs/)
- [API Documentation](docs/api/)
- [Smart Contract Documentation](docs/contract/)
- [Frontend Architecture](docs/web/)

### General Learning Resources
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Ethereum Development](https://ethereum.org/developers/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [IPFS Documentation](https://docs.ipfs.tech/)

## 🏆 Recognition

We appreciate all contributions to NGDocuVault! Contributors will be:

- **Acknowledged**: Listed in our contributors section
- **Credited**: Mentioned in release notes for significant contributions
- **Invited**: To participate in project planning discussions
- **Supported**: Provided with guidance and mentoring

## 📞 Getting Help

If you need help:

1. **Check the documentation**: Start with our [docs](docs/) directory
2. **Search existing issues**: Your question might already be answered
3. **Create a discussion**: Use GitHub Discussions for questions
4. **Join our community**: Participate in project discussions
5. **Contact the team**: Email contact@hora-ev.eu for direct support

## 🙏 Acknowledgments

NGDocuVault is developed by:
- **[Hora e.V.](https://hora-ev.eu)** - Main development organization
- **[Modern Miracle](https://modern-miracle.com)** - Technology collaboration partner
- **NGI Sargasso** - Funding and support through the Next Generation Internet initiative

Thank you for contributing to a project that helps immigrants navigate complex bureaucratic processes with secure, sovereign digital identity tools!

---

**License**: This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).