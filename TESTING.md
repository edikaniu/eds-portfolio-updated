<<<<<<< HEAD
# Testing Guide

This document provides a comprehensive guide to running and maintaining tests for the portfolio application.

## Test Structure

```
tests/
├── unit/                    # Unit tests for individual components and functions
│   ├── components/         # React component tests
│   ├── lib/               # Library and utility function tests
│   └── cache/             # Caching system tests
├── integration/            # Integration tests for APIs and workflows
│   └── api/               # API endpoint tests
├── e2e/                   # End-to-end tests using Playwright
│   ├── homepage.spec.ts   # Homepage functionality tests
│   └── admin-auth.spec.ts # Admin authentication tests
├── performance/           # Performance and load tests
└── utils/                 # Test utilities and helpers
```

## Setup

### 1. Install Testing Dependencies

```bash
# Install all testing dependencies
npm install --save-dev @playwright/test @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/jest babel-jest jest jest-environment-jsdom
```

### 2. Setup Test Environment

```bash
# Setup test database and environment
npm run test:setup
```

### 3. Install Playwright Browsers

```bash
npx playwright install
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Integration Tests

```bash
# Run all integration tests
npm run test:integration
```

### End-to-End Tests

```bash
# Run E2E tests (headless)
npm run test:e2e

# Run E2E tests with browser UI
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug
```

### Performance Tests

```bash
# Run performance tests
npm run test:performance
```

### All Tests

```bash
# Run all test suites
npm run test:all

# Run CI test suite
npm run test:ci
```

## Test Configuration

### Jest Configuration

- **Config File**: `jest.config.js`
- **Setup File**: `jest.setup.js`
- **Polyfills**: `jest.polyfills.js`

Key features:
- Next.js integration
- TypeScript support
- React Testing Library setup
- Coverage reporting
- Custom matchers

### Playwright Configuration

- **Config File**: `playwright.config.ts`
- **Global Setup**: `tests/e2e/global-setup.ts`

Key features:
- Multi-browser testing (Chrome, Firefox, Safari)
- Mobile device testing
- Automatic dev server startup
- Screenshot/video on failure
- Parallel execution

## Writing Tests

### Unit Tests

```typescript
import { render, screen } from '../../utils/test-utils'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})
```

### API Integration Tests

```typescript
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/my-endpoint/route'
import { createMockRequest } from '../../utils/test-utils'

describe('/api/my-endpoint', () => {
  it('should return success response', async () => {
    const request = createMockRequest('GET', 'http://localhost:3000/api/my-endpoint')
    const response = await GET(request as NextRequest)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})
```

### E2E Tests

```typescript
import { test, expect } from '@playwright/test'

test.describe('My Feature', () => {
  test('should work correctly', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Welcome')
  })
})
```

## Test Utilities

The `tests/utils/test-utils.tsx` file provides:

- Custom render function with providers
- Mock data factories
- Mock API utilities
- Common test helpers

### Available Mock Factories

- `createMockBlogPost()`
- `createMockProject()`
- `createMockCaseStudy()`
- `createMockUser()`
- `createMockRequest()`
- `createMockResponse()`

### API Mocking

```typescript
import { mockFetch, mockFetchError } from '../../utils/test-utils'

// Mock successful response
mockFetch({ success: true, data: [] })

// Mock error response  
mockFetchError('Server Error', 500)
```

## Coverage Requirements

- **Minimum Coverage**: 70% for all metrics
- **Components**: Focus on user interactions and edge cases
- **API Routes**: Test all endpoints and error conditions
- **Utilities**: Test pure functions thoroughly

## CI/CD Integration

### GitHub Actions

The testing suite integrates with CI/CD:

```yaml
- name: Run Tests
  run: |
    npm run test:setup
    npm run test:coverage
    npm run test:e2e
    npm run test:cleanup
```

### Test Reports

- **Jest Coverage**: `coverage/lcov-report/index.html`
- **Playwright Report**: `playwright-report/index.html`
- **JUnit Results**: `test-results/results.xml`

## Performance Testing

### API Performance Tests

Located in `tests/performance/api-performance.test.ts`, these tests verify:

- Response times under acceptable thresholds
- Concurrent request handling
- Cache performance
- Error response times

### Performance Thresholds

- **Standard APIs**: < 1000ms
- **Complex Queries**: < 2000ms
- **Error Responses**: < 500ms
- **Cached Responses**: < 200ms

## Database Testing

### Test Database

- Uses SQLite for testing (`prisma/test.db`)
- Automatically created and seeded
- Cleaned up after test runs

### Test Data

The test setup script creates:
- Test admin user
- Sample blog posts
- Sample projects
- Sample case studies

## Debugging Tests

### Jest Tests

```bash
# Debug specific test
npx jest --runInBand --no-cache MyComponent.test.tsx

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand MyComponent.test.tsx
```

### Playwright Tests

```bash
# Debug mode (opens browser dev tools)
npm run test:e2e:debug

# Run specific test
npx playwright test homepage.spec.ts --debug
```

## Best Practices

### Unit Tests

1. **Test user interactions, not implementation details**
2. **Use meaningful test descriptions**
3. **Test edge cases and error conditions**
4. **Mock external dependencies**
5. **Keep tests fast and isolated**

### Integration Tests

1. **Test complete workflows**
2. **Use realistic test data**
3. **Test error scenarios**
4. **Verify API contracts**

### E2E Tests

1. **Test critical user journeys**
2. **Use page object patterns for complex flows**
3. **Test across different browsers and devices**
4. **Include accessibility tests**
5. **Keep tests stable and maintainable**

## Troubleshooting

### Common Issues

1. **Tests failing locally but passing in CI**:
   - Check environment variables
   - Verify database setup
   - Check file paths (Windows vs Unix)

2. **Playwright browser issues**:
   - Run `npx playwright install`
   - Check system dependencies
   - Update Playwright version

3. **Jest configuration issues**:
   - Clear Jest cache: `npx jest --clearCache`
   - Check module resolution
   - Verify setup files

### Getting Help

- Check test logs in `test-results/`
- Review coverage reports
- Use debug mode for step-by-step execution
- Check GitHub Actions logs for CI failures

## Maintenance

### Regular Tasks

1. **Update test dependencies monthly**
2. **Review and update coverage thresholds**
3. **Clean up obsolete tests**
4. **Monitor test performance**
5. **Update test data as needed**

### Adding New Tests

1. **Create tests alongside new features**
2. **Follow existing patterns and structure**
3. **Update this documentation**
=======
# Testing Guide

This document provides a comprehensive guide to running and maintaining tests for the portfolio application.

## Test Structure

```
tests/
├── unit/                    # Unit tests for individual components and functions
│   ├── components/         # React component tests
│   ├── lib/               # Library and utility function tests
│   └── cache/             # Caching system tests
├── integration/            # Integration tests for APIs and workflows
│   └── api/               # API endpoint tests
├── e2e/                   # End-to-end tests using Playwright
│   ├── homepage.spec.ts   # Homepage functionality tests
│   └── admin-auth.spec.ts # Admin authentication tests
├── performance/           # Performance and load tests
└── utils/                 # Test utilities and helpers
```

## Setup

### 1. Install Testing Dependencies

```bash
# Install all testing dependencies
npm install --save-dev @playwright/test @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/jest babel-jest jest jest-environment-jsdom
```

### 2. Setup Test Environment

```bash
# Setup test database and environment
npm run test:setup
```

### 3. Install Playwright Browsers

```bash
npx playwright install
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Integration Tests

```bash
# Run all integration tests
npm run test:integration
```

### End-to-End Tests

```bash
# Run E2E tests (headless)
npm run test:e2e

# Run E2E tests with browser UI
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug
```

### Performance Tests

```bash
# Run performance tests
npm run test:performance
```

### All Tests

```bash
# Run all test suites
npm run test:all

# Run CI test suite
npm run test:ci
```

## Test Configuration

### Jest Configuration

- **Config File**: `jest.config.js`
- **Setup File**: `jest.setup.js`
- **Polyfills**: `jest.polyfills.js`

Key features:
- Next.js integration
- TypeScript support
- React Testing Library setup
- Coverage reporting
- Custom matchers

### Playwright Configuration

- **Config File**: `playwright.config.ts`
- **Global Setup**: `tests/e2e/global-setup.ts`

Key features:
- Multi-browser testing (Chrome, Firefox, Safari)
- Mobile device testing
- Automatic dev server startup
- Screenshot/video on failure
- Parallel execution

## Writing Tests

### Unit Tests

```typescript
import { render, screen } from '../../utils/test-utils'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})
```

### API Integration Tests

```typescript
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/my-endpoint/route'
import { createMockRequest } from '../../utils/test-utils'

describe('/api/my-endpoint', () => {
  it('should return success response', async () => {
    const request = createMockRequest('GET', 'http://localhost:3000/api/my-endpoint')
    const response = await GET(request as NextRequest)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})
```

### E2E Tests

```typescript
import { test, expect } from '@playwright/test'

test.describe('My Feature', () => {
  test('should work correctly', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Welcome')
  })
})
```

## Test Utilities

The `tests/utils/test-utils.tsx` file provides:

- Custom render function with providers
- Mock data factories
- Mock API utilities
- Common test helpers

### Available Mock Factories

- `createMockBlogPost()`
- `createMockProject()`
- `createMockCaseStudy()`
- `createMockUser()`
- `createMockRequest()`
- `createMockResponse()`

### API Mocking

```typescript
import { mockFetch, mockFetchError } from '../../utils/test-utils'

// Mock successful response
mockFetch({ success: true, data: [] })

// Mock error response  
mockFetchError('Server Error', 500)
```

## Coverage Requirements

- **Minimum Coverage**: 70% for all metrics
- **Components**: Focus on user interactions and edge cases
- **API Routes**: Test all endpoints and error conditions
- **Utilities**: Test pure functions thoroughly

## CI/CD Integration

### GitHub Actions

The testing suite integrates with CI/CD:

```yaml
- name: Run Tests
  run: |
    npm run test:setup
    npm run test:coverage
    npm run test:e2e
    npm run test:cleanup
```

### Test Reports

- **Jest Coverage**: `coverage/lcov-report/index.html`
- **Playwright Report**: `playwright-report/index.html`
- **JUnit Results**: `test-results/results.xml`

## Performance Testing

### API Performance Tests

Located in `tests/performance/api-performance.test.ts`, these tests verify:

- Response times under acceptable thresholds
- Concurrent request handling
- Cache performance
- Error response times

### Performance Thresholds

- **Standard APIs**: < 1000ms
- **Complex Queries**: < 2000ms
- **Error Responses**: < 500ms
- **Cached Responses**: < 200ms

## Database Testing

### Test Database

- Uses SQLite for testing (`prisma/test.db`)
- Automatically created and seeded
- Cleaned up after test runs

### Test Data

The test setup script creates:
- Test admin user
- Sample blog posts
- Sample projects
- Sample case studies

## Debugging Tests

### Jest Tests

```bash
# Debug specific test
npx jest --runInBand --no-cache MyComponent.test.tsx

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand MyComponent.test.tsx
```

### Playwright Tests

```bash
# Debug mode (opens browser dev tools)
npm run test:e2e:debug

# Run specific test
npx playwright test homepage.spec.ts --debug
```

## Best Practices

### Unit Tests

1. **Test user interactions, not implementation details**
2. **Use meaningful test descriptions**
3. **Test edge cases and error conditions**
4. **Mock external dependencies**
5. **Keep tests fast and isolated**

### Integration Tests

1. **Test complete workflows**
2. **Use realistic test data**
3. **Test error scenarios**
4. **Verify API contracts**

### E2E Tests

1. **Test critical user journeys**
2. **Use page object patterns for complex flows**
3. **Test across different browsers and devices**
4. **Include accessibility tests**
5. **Keep tests stable and maintainable**

## Troubleshooting

### Common Issues

1. **Tests failing locally but passing in CI**:
   - Check environment variables
   - Verify database setup
   - Check file paths (Windows vs Unix)

2. **Playwright browser issues**:
   - Run `npx playwright install`
   - Check system dependencies
   - Update Playwright version

3. **Jest configuration issues**:
   - Clear Jest cache: `npx jest --clearCache`
   - Check module resolution
   - Verify setup files

### Getting Help

- Check test logs in `test-results/`
- Review coverage reports
- Use debug mode for step-by-step execution
- Check GitHub Actions logs for CI failures

## Maintenance

### Regular Tasks

1. **Update test dependencies monthly**
2. **Review and update coverage thresholds**
3. **Clean up obsolete tests**
4. **Monitor test performance**
5. **Update test data as needed**

### Adding New Tests

1. **Create tests alongside new features**
2. **Follow existing patterns and structure**
3. **Update this documentation**
>>>>>>> 177dc73edd19f0ab5571599bf2c6435fbada064e
4. **Ensure CI/CD integration**