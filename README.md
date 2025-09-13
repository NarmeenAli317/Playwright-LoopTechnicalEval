# Playwright Technical Evaluation Framework

A comprehensive, data-driven Playwright test suite designed for technical evaluation, demonstrating advanced automation testing capabilities with enterprise-grade architecture and best practices.

## 🚀 Quick Start

### Prerequisites
- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0

### Installation & Setup
```bash
# 1. Clone the repository
git clone <repository-url>
cd playwright-eval

# 2. Install dependencies and browsers
npm run setup

# 3. Run all tests
npm test
```

### Essential Commands
```bash
# Run all tests
npm test

# Run with visible browser
npm run test:headed

# Run specific test suites
npm run test:web              # Web application tests
npm run test:mobile           # Mobile application tests
npm run test:login            # Login/authentication tests
npm run test:security         # Security tests
npm run test:performance      # Performance tests

# Run by test type
npm run test:smoke        # Smoke tests only
npm run test:regression   # Regression tests only

# Debug mode
npm run debug

# View test report
npm run report
```

## 🎯 Overview

This project showcases professional Playwright testing implementation featuring:

- **📊 Data-Driven Architecture** - JSON-driven test configuration for maximum scalability
- **🏗️ Page Object Model (POM)** - Industry-standard design pattern for maintainable test code
- **🔐 Unified Authentication** - Centralized login management with storage state
- **📝 Advanced Logging** - Color-coded debug system with structured reporting
- **⚡ Advanced Interactions** - Custom Playwright handlers for complex UI operations
- **📈 Test Analytics** - Comprehensive statistics and performance reporting
- **🔧 CI/CD Ready** - Jenkins integration with automated test execution

## 🏗️ Architecture

### Project Structure
```
playwright-eval/
├── shared/                     # Core framework utilities
│   ├── env.js                 # Environment configuration & test data
│   ├── debug.js               # Advanced logging system
│   ├── test-wrappers.js       # Custom test categorization
│   ├── PlaywrightHandler.js   # Advanced UI interaction handlers
│   └── statistics.js          # Test analytics & reporting
├── pages/                     # Page Object Model classes
│   ├── LoginPage.js           # Authentication page interactions
│   ├── DashboardPage.js       # Navigation & dashboard management
│   └── KanbanPage.js          # Kanban board operations
├── tests/                     # Test suites organized by feature
│   ├── login/                 # Authentication test suite
│   ├── web-application/       # Web app specific tests
│   ├── mobile-application/    # Mobile app specific tests
│   └── advanced-tests/        # Performance & security tests
├── test-results/              # Execution artifacts
└── playwright.config.js       # Playwright configuration
```

## 📋 Test Coverage

### Core Evaluation Test Cases
| Test ID | Application | Task | Column | Tags | Priority |
|---------|-------------|------|--------|------|----------|
| TC1 | Web | Implement user authentication | To Do | Feature, High Priority | High |
| TC2 | Web | Fix navigation bug | To Do | Bug | Medium |
| TC3 | Web | Design system updates | In Progress | Design | Medium |
| TC4 | Mobile | Push notification system | To Do | Feature | High |
| TC5 | Mobile | Offline mode | In Progress | Feature, High Priority | High |
| TC6 | Mobile | App icon design | Done | Design | Low |

### Additional Test Suites
- **🔐 Login Tests**: Authentication validation, negative testing, security
- **⚡ Performance Tests**: Load time validation, responsiveness
- **🛡️ Security Tests**: XSS protection, SQL injection prevention
- **🔄 Regression Tests**: Comprehensive functionality validation
- **💨 Smoke Tests**: Critical path verification

## 🎮 Usage

### Test Execution Commands

#### Basic Execution
```bash
# Run all tests
npm test

# Run with visible browser
npm run test:headed

# Run in debug mode
npm run debug

# View HTML report
npm run report
```

#### Targeted Test Execution
```bash
# Run specific test suites
npm run test:login          # Login tests only
npm run test:web            # Web application tests
npm run test:mobile         # Mobile application tests
npm run test:smoke          # Smoke tests only
npm run test:regression     # Regression tests only

# Run specific test cases
npm test -- --grep "TC1"   # Run specific test case
npm test -- --grep "Login" # Run login-related tests
```

#### Project-Specific Execution
```bash
# Run authenticated tests (with storage state)
npm run test:chromium

# Run unauthenticated tests (without storage state)
npm run test:unauthenticated
```

### Configuration Management

#### Environment Configuration
```javascript
// shared/env.js
export const TEST_DATA = {
    LOGIN: {
        URL: 'https://animated-gingersnap-8cf7f2.netlify.app/',
        USERNAME: 'admin',
        PASSWORD: 'password123'
    },
    TEST_CASES: {
        WEB_APPLICATION: [
            {
                testKey: 'TC1',
                taskName: 'Implement user authentication',
                column: 'To Do',
                expectedTags: ['Feature', 'High Priority']
            }
        ]
    }
};
```

#### Test Data Structure
Each test case includes:
- **testKey**: Unique identifier
- **taskName**: Task to verify
- **column**: Expected column location
- **expectedTags**: Expected task tags
- **category**: Test type (smoke/regression/release)
- **application**: Target application (Web/Mobile)

## 🔧 Advanced Features

### Page Object Model Implementation
```javascript
// Clean, maintainable selectors
export class LoginPage {
    get usernameInput() { return this.page.getByRole('textbox', { name: 'Username' }); }
    get passwordInput() { return this.page.getByRole('textbox', { name: 'Password' }); }
    get loginButton() { return this.page.getByRole('button', { name: 'Sign in' }); }
    
    async login(email, password) {
        await this.usernameInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }
}
```

### Data-Driven Testing Framework
- **Centralized Configuration**: All test data managed in `shared/env.js`
- **JSON-Based Test Cases**: Easy to add/modify test scenarios
- **Environment Flexibility**: Support for multiple test environments
- **Dynamic Test Generation**: Tests generated from configuration data

### Advanced Logging System
```javascript
import { debugLog, createSection } from '../shared/debug.js';

const section = createSection('Test Execution');
await debugLog('Starting authentication process', 'INFO');
await debugLog('Login successful', 'SUCCESS');
await section.end();
```

### Custom Playwright Handlers
```javascript
import { PlaywrightHandler } from '../shared/PlaywrightHandler.js';

const handler = new PlaywrightHandler(page);
await handler.handleDropdown(selector, value);
await handler.scrollToElement(selector);
await handler.waitForElementWithText(selector, text);
```

## 📊 Reporting & Analytics

### Generated Reports
- **📄 HTML Report**: `playwright-report/index.html`
- **📋 JSON Report**: `test-results/results.json`
- **🔧 JUnit XML**: `test-results/results.xml`
- **📸 Screenshots**: `test-results/*.png`
- **🎥 Videos**: `test-results/*.webm`

### Test Statistics
- **Execution Time**: Per test and total duration
- **Success Rate**: Pass/fail percentages
- **Performance Metrics**: Load times and responsiveness
- **Error Analysis**: Detailed failure reporting

## 🌐 Browser Support

| Browser | Desktop | Mobile | Status |
|---------|---------|--------|--------|
| **Chromium** | ✅ | ⚠️ | Primary |
| **Firefox** | ✅ | ⚠️ | Supported |
| **WebKit** | ✅ | ⚠️ | Supported |

*Note: Mobile configurations are available but commented out for desktop-focused evaluation*

## 🔄 CI/CD Integration

### Jenkins Pipeline
```groovy
pipeline {
    agent any
    stages {
        stage('Install') {
            steps { sh 'npm install' }
        }
        stage('Test') {
            steps { sh 'npm test' }
        }
        stage('Report') {
            steps { publishHTML([...]) }
        }
    }
}
```

## ✅ Technical Evaluation Compliance

This implementation demonstrates:

- ✅ **Data-Driven Testing**: JSON configuration drives all test scenarios
- ✅ **JavaScript/TypeScript**: Pure JavaScript implementation
- ✅ **Minimal Code Duplication**: POM pattern and shared utilities
- ✅ **Scalable Architecture**: Easy to add new test cases
- ✅ **Login Automation**: Complete Asana demo app authentication
- ✅ **All 6 Test Cases**: Fully implemented and verified
- ✅ **Professional Standards**: Enterprise-grade code quality
- ✅ **Comprehensive Documentation**: Detailed README and code comments

## 🏆 Best Practices Demonstrated

- **Page Object Model**: Proper encapsulation of page elements and actions
- **Data-Driven Design**: Configuration-driven test execution
- **Error Handling**: Robust error management and reporting
- **Logging**: Comprehensive debug and execution tracking
- **Code Reusability**: Shared utilities and centralized management
- **Test Organization**: Logical grouping and categorization
- **Documentation**: Clear, professional documentation
- **CI/CD Ready**: Jenkins integration and automated execution

## 📄 License

ISC License - See LICENSE file for details

---

**Built with ❤️ for Technical Evaluation Excellence**