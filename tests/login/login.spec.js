import { expect, test } from '@playwright/test';
import { createSection, debugLog, initDebugMode } from '../../shared/debug.js';
import { TEST_DATA } from '../../shared/env.js';
import { LoginManager } from '../../shared/LoginManager.js';
import { PageFactory } from '../../shared/PageFactory.js';
import { regressionTest, releaseTest, smokeTest } from '../../shared/test-wrappers.js';
import testData from '../../test-data.json' assert { type: 'json' };

// Initialize debug mode
initDebugMode();

test.describe('Login Tests - Data Driven', () => {
    // ========================================
    // SMOKE TESTS - Critical Login Functionality
    // ========================================

    smokeTest('Valid Login Flow', {
        testType: 'ui',
        testKey: 'SMOKE_VALID_LOGIN'
    }, async ({ page }) => {
        const section = createSection('Smoke Test - Valid Login Flow');
        
        try {
            await section.start();
            await debugLog('Testing valid login functionality...', 'INFO');

            const loginResult = await LoginManager.login(page);
            expect(loginResult.success).toBe(true);
            await debugLog('Valid login successful', 'SUCCESS');

        } catch (error) {
            await debugLog(`Valid login test failed: ${error.message}`, 'ERROR');
            throw error;
        } finally {
            await section.end();
        }
    });

    // ========================================
    // DATA-DRIVEN NEGATIVE TESTS
    // ========================================

    testData.negativeTestScenarios.forEach((testScenario) => {
        regressionTest(`${testScenario.testKey} - ${testScenario.testName}`, {
            testTypes: testScenario.testTypes,
            testKey: testScenario.testKey
        }, async ({ page }) => {
            const section = createSection(testScenario.testName);
            
            try {
                await section.start();
                await debugLog(`Executing ${testScenario.testKey}: ${testScenario.description}`, 'INFO');

                // Navigate to login page
                await page.goto(TEST_DATA.LOGIN.URL);
                await debugLog('Navigated to login page', 'INFO');

                // Fill invalid credentials (data-driven)
                await page.getByRole('textbox', { name: 'Username' }).fill(testScenario.username); //use environment name
                await page.getByRole('textbox', { name: 'Password' }).fill(testScenario.password);
                await page.getByRole('button', { name: 'Sign in' }).click();
                await page.waitForTimeout(1000);
                
                // Verify login failure (data-driven)
                await expect(page.locator('div.text-red-500.text-sm')).toContainText('Invalid username or password');
                await debugLog(`${testScenario.testKey} - Login properly rejected`, 'SUCCESS');

                // Verify no unauthorized access to protected pages
                await debugLog('Verifying no unauthorized access...', 'INFO');
                const pages = PageFactory.createPages(page);
                const isNotAuthenticated = await pages.dashboardPage.verifyUserIsNotAuthenticated();
                expect(isNotAuthenticated).toBe(true);
                await debugLog('No unauthorized access to protected content', 'SUCCESS');

            } catch (error) {
                await debugLog(`${testScenario.testId} failed: ${error.message}`, 'ERROR');
                throw error;
            } finally {
                await section.end();
            }
        });
    });

    // ========================================
    // RELEASE TESTS - Additional Login Scenarios
    // ========================================

    releaseTest('Login Session Persistence', {
        testType: 'ui',
        testKey: 'RELEASE_SESSION_PERSISTENCE'
    }, async ({ page }) => {
        const section = createSection('Release Test - Login Session Persistence');
        
        try {
            await section.start();
            await debugLog('Testing login session persistence...', 'INFO');

            // Login
            const loginResult = await LoginManager.login(page);
            expect(loginResult.success).toBe(true);
            await debugLog('Initial login successful', 'SUCCESS');

            // Navigate to different pages to test session
            await debugLog('Testing session across navigation...', 'INFO');
            const pages = loginResult.pages;
            
            // Test Web Application navigation
            const webNavResult = await pages.dashboardPage.navigateToWebApplication();
            expect(webNavResult).toBe(true);
            await debugLog('Web Application navigation successful', 'SUCCESS');

            // Test Mobile Application navigation
            const mobileNavResult = await pages.dashboardPage.navigateToMobileApplication();
            expect(mobileNavResult).toBe(true);
            await debugLog('Mobile Application navigation successful', 'SUCCESS');

            // Verify still logged in
            const currentUrl = page.url();
            expect(currentUrl).not.toContain('login');
            await debugLog('Session maintained across navigation', 'SUCCESS');

        } catch (error) {
            await debugLog(`Session persistence test failed: ${error.message}`, 'ERROR');
            throw error;
        } finally {
            await section.end();
        }
    });
});