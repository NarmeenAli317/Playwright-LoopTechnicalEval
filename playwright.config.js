/**
 * Playwright Configuration for Technical Evaluation Framework
 * 
 * This configuration demonstrates enterprise-level test automation setup
 * with multi-project architecture, comprehensive reporting, and environment-specific
 * settings. The configuration supports both authenticated and unauthenticated test
 * execution with proper project separation.
 * 
 * Architecture Highlights:
 * - Multi-project setup for different test types
 * - Storage state management for authentication
 * - Comprehensive reporting (HTML, JSON, JUnit)
 * - Environment-aware configuration
 * - CI/CD optimized settings
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  
  // Enable parallel test execution for faster test runs
  fullyParallel: true,
  
  // Prevent accidental test.only in CI environments
  forbidOnly: !!process.env.CI,
  
  // Retry failed tests in CI for stability
  retries: process.env.CI ? 2 : 0,
  
  // Limit workers in CI to prevent resource conflicts
  workers: process.env.CI ? 1 : undefined,
  // Comprehensive reporting configuration for different stakeholders
  reporter: [
    ['list'],                                                    // Console output with test results
    ['html', { outputFolder: 'playwright-report' }],            // Interactive HTML report
    ['json', { outputFile: 'test-results/results.json' }],      // Machine-readable JSON output
    ['junit', { outputFile: 'test-results/results.xml' }]       // JUnit XML for CI/CD integration
  ],
  
  // Global settings applied to all test projects
  use: {
    // Base URL configuration (uncomment and modify as needed)
    // baseURL: 'http://127.0.0.1:3000',

    // Trace collection for debugging failed tests
    trace: 'on-first-retry',
    
    // Screenshot capture on test failures for debugging
    screenshot: 'only-on-failure',
    
    // Video recording for failed tests to aid in debugging
    video: 'retain-on-failure',
    
    // Global timeouts for better test stability
    actionTimeout: 10000,        // Maximum time for individual actions
    navigationTimeout: 30000,    // Maximum time for page navigation
  },

  // Multi-project configuration for different test types and environments
  projects: [
    // Authentication setup project - runs first to create storage state
    {
      name: 'setup',
      testMatch: /.*\.setup\.js/,
      testDir: './',
    },
    
    // Main authenticated test project - uses storage state for efficiency
    {
      name: 'chromium',
      testDir: './tests',
      use: { 
        ...devices['Desktop Chrome'],
        // Pre-authenticated state for faster test execution
        storageState: 'auth-state.json',
      },
      dependencies: ['setup'],  // Ensure authentication runs first
      testMatch: /.*(web-application|mobile-application|performance-tests)\.spec\.js/,
    },
    
    // Unauthenticated test project - clean state for security testing
    {
      name: 'unauthenticated-tests',
      testDir: './tests',
      use: { 
        ...devices['Desktop Chrome'],
        // No storage state - clean browser for security tests
      },
      testMatch: /.*(security-tests|login)\.spec\.js/,
    }
/*
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },*/

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },

    /* Mobile viewports - Commented out for desktop-only testing */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
