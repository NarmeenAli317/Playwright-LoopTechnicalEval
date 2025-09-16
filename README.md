# Playwright Technical Evaluation Framework

A comprehensive, data-driven Playwright test suite designed for technical evaluation, demonstrating advanced automation testing capabilities with enterprise-grade architecture and best practices.

## 🚀 Quick Start

### Prerequisites
- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0

### Single Data-Driven Test (TC1–TC6)
Run the entire evaluation as a single data-driven test that loops through scenarios from `test-data.json` (TC1–TC6 only):
```bash
npm run test:datadriven
```
This executes `tests/data-driven.spec.js` under the `chromium` project (pre-authenticated via `auth.setup.js` → `auth-state.json`). It performs strict assertions; any mismatch will fail the spec.

### Installation & Setup
```bash
# 1. Clone the repository and create .env
git clone <https://github.com/NarmeenAli317/Playwright-LoopTechnicalEval>
cd playwright-LoopTechEval

##.env variables
ENV=DEMO
USERNAME=
PASSWORD=

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
│   ├── env.js                 # Environment configuration & settings
│   ├── debug.js               # Advanced logging system
│   ├── test-wrappers.js       # Custom test categorization
│   ├── PlaywrightHandler.js   # Advanced UI interaction handlers
│   ├── statistics.js          # Test analytics & reporting
│   ├── LoginManager.js        # Centralized login management
│   └── PageFactory.js         # Page object factory
├── pages/                     # Page Object Model classes
│   ├── LoginPage.js           # Authentication page interactions
│   ├── DashboardPage.js       # Navigation & dashboard management
│   └── KanbanPage.js          # Kanban board operations
├── tests/                     # Test suites organized by feature
│   ├── login/                 # Authentication test suite
│   ├── web-application/       # Web app specific tests
│   ├── mobile-application/    # Mobile app specific tests
│   └── advanced-tests/        # Performance & security tests
├── test-data.json             # Test case data and scenarios
├── test-results/              # Execution artifacts
├── auth.setup.js              # Authentication setup script
├── auth-state.json            # Pre-authenticated state storage
├── Jenkinsfile                # CI/CD pipeline configuration
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
// shared/env.js - Environment-specific settings
export const ENVIRONMENT_CONFIG = {
    DEMO: {
        URLS: {
            ASANA_DEMO: 'https://animated-gingersnap-8cf7f2.netlify.app/'
        },
        CREDENTIALS: {
            USERNAME: process.env.username,
            PASSWORD: process.env.password
        },
        TIMEOUTS: {
            DEFAULT: 10000,
            LOGIN: 15000,
            NAVIGATION: 8000
        }
    }
};
```

#### Test Data Configuration
```json
// test-data.json - All test case data
{
  "testScenarios": [
    {
      "testKey": "TC1",
      "testName": "Verify user authentication task in To Do column",
      "description": "Login to Demo App, navigate to Web Application, verify 'Implement user authentication' is in the 'To Do' column with tags 'Feature' and 'High Priority'",
      "application": "Web Application",
      "column": "To Do",
      "taskName": "Implement user authentication",
      "expectedTags": ["Feature", "High Priority"],
      "testTypes": ["ui", "Feature", "High Priority"],
      "priority": "high",
      "category": "regression"
    }
  ],
  "negativeTestScenarios": [
    {
      "testKey": "NEG_LOGIN_INVALID_PASSWORD",
      "testName": "Negative Test - Invalid Password",
      "description": "Test login with valid username but invalid password",
      "username": "admin",
      "password": "wrongpassword",
      "expectedResult": "login_failure",
      "testTypes": ["ui", "security"],
      "category": "regression"
    }
  ]
}
```

#### Test Data Structure
Each test case includes:
- **testKey**: Unique identifier
- **testName**: Descriptive test name
- **description**: Detailed test description
- **application**: Target application (Web/Mobile)
- **column**: Expected column location
- **taskName**: Task to verify
- **expectedTags**: Expected task tags
- **testTypes**: Test categorization tags for filtering
- **priority**: Test priority (high/medium/low)
- **category**: Test type (smoke/regression/release)

**Negative Test Scenarios** include additional fields:
- **username**: Test username for negative testing
- **password**: Test password for negative testing
- **expectedResult**: Expected outcome (e.g., "login_failure")

#### Environment Variables (.env file)
Create a `.env` file in the project root to customize environment settings:

```env
# Environment Configuration
ENV=DEMO

# Login Credentials
username=admin
password=password123

# Optional: Environment-specific URLs
# ASANA_DEMO_URL_UAT=https://uat.animated-gingersnap-8cf7f2.netlify.app/
# ASANA_DEMO_URL_PROD=https://www.animated-gingersnap-8cf7f2.netlify.app/

# Optional: Browser settings
# HEADLESS_UAT=true
# HEADLESS_PROD=true
```

**Available Environment Variables:**
- `ENV`: Environment type (DEMO|UAT|PROD) - Default: DEMO
- `username`: Login username (lowercase) - Default: admin
- `password`: Login password (lowercase) - Default: password123
- `ASANA_DEMO_URL_UAT`: UAT environment URL (optional)
- `ASANA_DEMO_URL_PROD`: Production environment URL (optional)
- `HEADLESS_UAT`: Run UAT tests in headless mode (true|false) - Default: true
- `HEADLESS_PROD`: Run Production tests in headless mode (true|false) - Default: true

**Note:** Environment variables use lowercase naming (e.g., `username`, `password`) as defined in `shared/env.js`.

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
- **Centralized Test Data**: All test cases managed in `test-data.json`
- **Environment Configuration**: Environment settings in `shared/env.js`
- **JSON-Based Test Cases**: Easy to add/modify test scenarios
- **Environment Flexibility**: Support for multiple test environments (DEMO/UAT/PROD)
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
    agent { label 'QA' }
    parameters {
        choice(name: 'TEST_ENVIRONMENT', choices: ['DEMO', 'UAT', 'PROD'])
        choice(name: 'NPM_SCRIPT', choices: ['test', 'test:web', 'test:mobile', 'test:login', 'test:security', 'test:performance', 'test:smoke', 'test:regression'])
        string(name: 'CUSTOM_SCRIPT', defaultValue: '')
    }
    environment {
        NODE_OPTIONS = '--max-old-space-size=4096'
        ENV = "${params.TEST_ENVIRONMENT}"
        CI = 'true'
    }
    stages {
        stage('Setup') { /* Install dependencies and browsers */ }
        stage('Run Tests') { /* Execute selected test suite */ }
    }
    post {
        always { /* Publish HTML reports and archive artifacts */ }
        failure { /* Diagnostic information */ }
    }
}
```

**Features:**
- Multi-environment support (DEMO/UAT/PROD)
- Flexible test selection via parameters
- HTML report generation and artifact archiving
- Comprehensive error diagnostics

**Available Scripts:** `test`, `test:web`, `test:mobile`, `test:login`, `test:security`, `test:performance`, `test:smoke`, `test:regression`, `test:ui`, `test:feature`, `test:bug`, `test:design`, `test:high-priority`

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


**Built with ❤️ for Technical Evaluation Excellence**