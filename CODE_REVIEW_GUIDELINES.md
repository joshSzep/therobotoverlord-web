# Code Review Guidelines

## Overview
This document outlines the code review standards and practices for The Robot Overlord project to ensure high code quality, maintainability, and team collaboration.

## Pre-Review Checklist

### Before Submitting a PR
- [ ] All tests pass locally (`npm test`, `npm run test:e2e`)
- [ ] Code follows TypeScript strict mode requirements
- [ ] ESLint passes without errors (`npm run lint`)
- [ ] Code is properly formatted (`prettier --check .`)
- [ ] Pre-commit hooks have run successfully
- [ ] Branch is up to date with main/develop
- [ ] PR description clearly explains changes and reasoning

### PR Requirements
- [ ] Title follows conventional commit format: `type(scope): description`
- [ ] Description includes context, changes, and testing notes
- [ ] Screenshots/videos for UI changes
- [ ] Breaking changes are clearly documented
- [ ] Related issues are linked

## Review Criteria

### Code Quality
- **Readability**: Code should be self-documenting with clear variable/function names
- **Complexity**: Functions should be focused and not overly complex
- **DRY Principle**: Avoid code duplication, extract reusable components/utilities
- **SOLID Principles**: Follow single responsibility, open/closed, and dependency inversion
- **Error Handling**: Proper error boundaries and graceful failure handling

### TypeScript Standards
- **Type Safety**: Use strict TypeScript, avoid `any` types
- **Interfaces**: Define clear interfaces for props and data structures
- **Generics**: Use generics for reusable components and utilities
- **Null Safety**: Handle undefined/null cases explicitly
- **Return Types**: Explicit return types for complex functions

### React Best Practices
- **Component Structure**: Functional components with hooks
- **Props Interface**: Clear prop types and default values
- **State Management**: Appropriate use of useState, useEffect, and context
- **Performance**: Use React.memo, useMemo, useCallback when beneficial
- **Accessibility**: Proper ARIA attributes and semantic HTML

### Testing Requirements
- **Unit Tests**: All utilities and complex logic must have unit tests
- **Component Tests**: UI components should have rendering and interaction tests
- **Integration Tests**: Critical user flows must have integration tests
- **E2E Tests**: Major features require end-to-end test coverage
- **Test Quality**: Tests should be readable, maintainable, and test behavior not implementation

### Security Considerations
- **Input Validation**: All user inputs must be validated and sanitized
- **Authentication**: Proper token handling and session management
- **Authorization**: Role-based access control implementation
- **XSS Prevention**: Proper escaping of user-generated content
- **CSRF Protection**: Anti-CSRF tokens for state-changing operations

### Performance Standards
- **Bundle Size**: Monitor and optimize bundle size
- **Core Web Vitals**: Maintain good LCP, FID, and CLS scores
- **Lazy Loading**: Implement code splitting and lazy loading where appropriate
- **Caching**: Proper caching strategies for API calls and static assets
- **Memory Leaks**: Cleanup event listeners and subscriptions

## Review Process

### Reviewer Responsibilities
1. **Thorough Review**: Check code logic, style, tests, and documentation
2. **Constructive Feedback**: Provide specific, actionable feedback
3. **Knowledge Sharing**: Explain reasoning behind suggestions
4. **Timely Response**: Review within 24 hours during business days
5. **Approval Standards**: Only approve if you would deploy to production

### Author Responsibilities
1. **Self Review**: Review your own code before requesting review
2. **Context**: Provide sufficient context in PR description
3. **Responsiveness**: Address feedback promptly and thoroughly
4. **Discussion**: Engage in constructive discussion about feedback
5. **Testing**: Ensure all edge cases are tested

### Review Comments
- **Blocking**: Issues that must be fixed before merge
- **Non-blocking**: Suggestions for improvement (prefix with "nit:")
- **Question**: Requests for clarification (prefix with "question:")
- **Praise**: Acknowledge good practices and clever solutions

## Common Issues to Watch For

### Code Smells
- Functions longer than 50 lines
- Deeply nested conditionals (>3 levels)
- Magic numbers and strings
- Commented-out code
- TODO comments without tickets
- Inconsistent naming conventions

### React Anti-patterns
- Mutating props or state directly
- Using array indices as keys
- Not cleaning up useEffect subscriptions
- Overusing useEffect
- Props drilling (consider context)
- Inline object/function creation in render

### TypeScript Issues
- Using `any` type
- Missing error handling for async operations
- Not handling undefined/null cases
- Overly complex type definitions
- Missing generic constraints

### Performance Red Flags
- Unnecessary re-renders
- Large bundle imports
- Synchronous operations blocking UI
- Memory leaks in subscriptions
- Inefficient algorithms
- Missing loading states

## Approval Process

### Single Approval
- Bug fixes (< 10 lines changed)
- Documentation updates
- Configuration changes
- Dependency updates

### Two Approvals Required
- New features
- Refactoring (> 50 lines changed)
- Breaking changes
- Security-related changes
- Database schema changes

### Architecture Review
- Major architectural changes
- New external dependencies
- Performance-critical changes
- Security model changes

## Tools and Automation

### Automated Checks
- **ESLint**: Code quality and style enforcement
- **Prettier**: Code formatting consistency
- **TypeScript**: Type checking and compilation
- **Jest**: Unit and integration test execution
- **Playwright**: End-to-end test execution
- **Husky**: Pre-commit hook enforcement

### Manual Review Focus
- Business logic correctness
- User experience considerations
- Security implications
- Performance impact
- Maintainability concerns
- Architecture alignment

## Feedback Examples

### Good Feedback
```
// Blocking: This could cause a memory leak
The useEffect on line 45 doesn't clean up the event listener. 
Consider returning a cleanup function:

useEffect(() => {
  const handler = () => { /* ... */ }
  window.addEventListener('resize', handler)
  return () => window.removeEventListener('resize', handler)
}, [])
```

### Poor Feedback
```
// Vague and unhelpful
This doesn't look right.
```

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://react.dev/learn)
- [Testing Library Docs](https://testing-library.com/docs/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Next.js Documentation](https://nextjs.org/docs)

## Questions?

If you have questions about these guidelines or need clarification on review feedback, please reach out to the team leads or start a discussion in the appropriate channel.
