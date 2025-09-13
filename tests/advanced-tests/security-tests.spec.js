import { expect, test } from '@playwright/test';
import { LoginManager } from '../../shared/LoginManager.js';
import { createSection, debugLog, initDebugMode } from '../../shared/debug.js';
import { TEST_DATA } from '../../shared/env.js';
import { releaseTest, smokeTest } from '../../shared/test-wrappers.js';
import testData from '../../test-data.json' assert { type: 'json' };

// Initialize debug mode
initDebugMode();

test.describe('Security Tests - Data Driven', () => {
    // Data-driven security tests from JSON
    testData.negativeTestScenarios.forEach((testScenario) => {
        smokeTest(testScenario.testName, {
            testTypes: testScenario.testTypes,
            testKey: testScenario.testKey
        }, async ({ page }) => {
            const section = createSection(testScenario.testName);
            
            try {
                await section.start();
                await debugLog(`Executing ${testScenario.testId}: ${testScenario.description}`, 'INFO');

                // Navigate to login page
                await page.goto(TEST_DATA.LOGIN.URL);
                await debugLog('Navigated to login page', 'INFO');

                // Fill invalid credentials (data-driven)
                await page.getByRole('textbox', { name: 'Username' }).fill(testScenario.email);
                await page.getByRole('textbox', { name: 'Password' }).fill(testScenario.password);
                await page.getByRole('button', { name: 'Sign in' }).click();
                await page.waitForTimeout(2000);
                
                // Verify login failure (data-driven)
                const currentUrl = page.url();
                expect(currentUrl).toContain('login');
                await debugLog(`✓ ${testScenario.testId} - Login properly rejected`, 'SUCCESS');

                // Verify no unauthorized access to protected pages
                await debugLog('Verifying no unauthorized access...', 'INFO');
                const dashboardElements = await page.locator('text=Dashboard').count(); 
                expect(dashboardElements).toBe(0);
                await debugLog('✓ No unauthorized access to protected content', 'SUCCESS');

            } catch (error) {
                await debugLog(`${testScenario.testId} failed: ${error.message}`, 'ERROR');
                throw error;
            } finally {
                await section.end();
            }
        });
    });

    // Additional security tests
    smokeTest('Authentication Security', {
        testType: 'security',
        testKey: 'SEC_AUTH'
    }, async ({ page }) => {
        const section = createSection('Security Test - Authentication');
        
        try {
            await section.start();
            await debugLog('Validating authentication security...', 'INFO');

            // Test invalid credentials
            await page.goto(TEST_DATA.LOGIN.URL);
            await page.waitForLoadState('networkidle');
            
            // Try with invalid email
            await page.getByRole('textbox', { name: 'Username' }).fill('invalid@email.com');
            await page.getByRole('textbox', { name: 'Password' }).fill(TEST_DATA.LOGIN.PASSWORD);
            await page.getByRole('button', { name: 'Sign in' }).click();
            await page.waitForTimeout(2000);
            
            // Verify login failure
            const currentUrl = page.url();
            expect(currentUrl).toContain('login');
            await debugLog('✓ Invalid email properly rejected', 'SUCCESS');

            // Try with invalid password
            await page.getByRole('textbox', { name: 'Username' }).fill(TEST_DATA.LOGIN.EMAIL);
            await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword');
            await page.getByRole('button', { name: 'Sign in' }).click();
            await page.waitForTimeout(2000);
            
            // Verify login failure
            const currentUrl2 = page.url();
            expect(currentUrl2).toContain('login');
            await debugLog('✓ Invalid password properly rejected', 'SUCCESS');

        } catch (error) {
            await debugLog(`Authentication security test failed: ${error.message}`, 'ERROR');
            throw error;
        } finally {
            await section.end();
        }
    });

    releaseTest('Session Security', {
        testType: 'security',
        testKey: 'SEC_SESSION'
    }, async ({ page }) => {
        const section = createSection('Security Test - Session Security');
        
        try {
            await section.start();
            await debugLog('Validating session security...', 'INFO');

            // Login successfully
            const loginResult = await LoginManager.login(page);
            expect(loginResult.success).toBe(true);
            await debugLog('Login successful', 'SUCCESS');

            // Verify session is maintained
            const currentUrl = page.url();
            expect(currentUrl).not.toContain('login');
            await debugLog('✓ Session established and maintained', 'SUCCESS');

            // Test session persistence across navigation
            const pages = loginResult.pages;
            await pages.dashboardPage.navigateToWebApplication();
            await pages.dashboardPage.navigateToMobileApplication();
            
            const finalUrl = page.url();
            expect(finalUrl).not.toContain('login');
            await debugLog('✓ Session maintained across navigation', 'SUCCESS');

        } catch (error) {
            await debugLog(`Session security test failed: ${error.message}`, 'ERROR');
            throw error;
        } finally {
            await section.end();
        }
    });

    releaseTest('Input Validation Security', {
        testType: 'security',
        testKey: 'SEC_INPUT_VALIDATION'
    }, async ({ page }) => {
        const section = createSection('Security Test - Input Validation');
        
        try {
            await section.start();
            await debugLog('Validating input validation security...', 'INFO');

            await page.goto(TEST_DATA.LOGIN.URL);
            await page.waitForLoadState('networkidle');
            
            // Test SQL injection attempt
            await page.getByRole('textbox', { name: 'Username' }).fill("admin'; DROP TABLE users; --");
            await page.getByRole('textbox', { name: 'Password' }).fill('password123');
            await page.getByRole('button', { name: 'Sign in' }).click();
            await page.waitForTimeout(2000);
            
            // Verify injection attempt is rejected
            const currentUrl = page.url();
            expect(currentUrl).toContain('login');
            await debugLog('✓ SQL injection attempt properly rejected', 'SUCCESS');

            // Test XSS attempt
            await page.getByRole('textbox', { name: 'Username' }).fill('<script>alert("xss")</script>');
            await page.getByRole('textbox', { name: 'Password' }).fill('password123');
            await page.getByRole('button', { name: 'Sign in' }).click();
            await page.waitForTimeout(2000);
            
            // Verify XSS attempt is rejected
            const currentUrl2 = page.url();
            expect(currentUrl2).toContain('login');
            await debugLog('✓ XSS attempt properly rejected', 'SUCCESS');

        } catch (error) {
            await debugLog(`Input validation security test failed: ${error.message}`, 'ERROR');
            throw error;
        } finally {
            await section.end();
        }
    });
});