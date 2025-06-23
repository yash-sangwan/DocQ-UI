# Contributing Guide

Thank you for your interest in contributing to this project! We welcome contributions from everyone and appreciate your help in making this project better.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [yashsangwan00@gmail.com].

## How Can I Contribute?

There are many ways you can contribute to this project:

- **Reporting bugs** - Help us identify and fix issues
- **Suggesting enhancements** - Propose new features or improvements
- **Writing code** - Submit bug fixes or new features
- **Reviewing pull requests** - Help maintain code quality
- **Testing** - Help test new features and bug fixes

### Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
    ```bash
    cd repository-name
    ```
3. Add the original repository as upstream:
    ```bash
    git remote add upstream https://github.com/original-owner/repository-name.git
    ```

## Making Changes

### Branch Naming

Create a new branch for your work:
- `feature/description` for new features
- `bugfix/description` for bug fixes
- `docs/description` for documentation changes
- `refactor/description` for code refactoring

Example:
```bash
git checkout -b feature/add-user-authentication
```

### Commit Messages

Write clear, descriptive commit messages:
- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

Example:
```
Add user authentication system

- Implement login/logout functionality
- Add password hashing with bcrypt
- Create user session management
- Fixes #123
```

## Submitting Changes

### Pull Request Process

1. Update your fork with the latest changes:
    ```bash
    git fetch upstream
    git checkout main
    git merge upstream/main
    ```

2. Rebase your feature branch:
    ```bash
    git checkout your-feature-branch
    git rebase main
    ```

3. Run tests and ensure your code follows the style guidelines

4. Push your changes:
    ```bash
    git push origin your-feature-branch
    ```

5. Create a pull request on GitHub with:
    - A clear title and description
    - Reference to any related issues
    - Screenshots if applicable
    - List of changes made

### Pull Request Guidelines

- Keep pull requests focused on a single feature or bug fix
- Follow the existing code style
- Be responsive to feedback and make requested changes promptly

## Style Guidelines

### Code Style

Follow the existing code formatting and naming conventions used in the project.

### Documentation Style

- Use clear, concise language
- Include code examples where helpful
- Keep line length under 80 characters for markdown files
- Use proper markdown formatting

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Screenshots** if applicable
- **Environment information** (OS, browser, version numbers)
- **Error messages** or logs

Use this template:
```
**Bug Description:**
A clear description of what the bug is.

**To Reproduce:**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior:**
What you expected to happen.

**Screenshots:**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., Windows 10, macOS 12]
- Browser: [e.g., Chrome 95, Firefox 94]
- Version: [e.g., 1.2.3]
```

## Feature Requests

When suggesting new features:

- **Use a clear title** that describes the feature
- **Provide detailed description** of the proposed functionality
- **Explain the motivation** - why would this feature be useful?
- **Consider alternatives** - are there other ways to achieve the same goal?
- **Provide examples** if possible

## Questions?

If you have questions about contributing, feel free to:
- Open an issue with the "question" label
- Reach out to the maintainers at [yashsangwan00@gmail.com]

## Recognition

Contributors will be recognized in our README.md file and release notes. We appreciate all contributions, no matter how small!

---

Thank you for contributing!