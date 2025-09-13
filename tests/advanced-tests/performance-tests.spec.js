import { expect, test } from '@playwright/test';
import { LoginManager } from '../../shared/LoginManager.js';
import { createSection, debugLog, initDebugMode } from '../../shared/debug.js';
import { TEST_DATA } from '../../shared/env.js';
import { releaseTest, smokeTest } from '../../shared/test-wrappers.js';
import testData from '../../test-data.json' assert { type: 'json' };

// Initialize debug mode
initDebugMode();

test.describe('Performance Tests - Data Driven', () => {
    // Data-driven performance tests from JSON
    testData.performanceTestScenarios.forEach((testScenario) => {
        smokeTest(testScenario.testName, {
            testTypes: testScenario.testTypes,
            testKey: testScenario.testKey
        }, async ({ page }) => {
            const section = createSection(testScenario.testName);
            
            try {
                await section.start();
                await debugLog(`Executing ${testScenario.testId}: ${testScenario.description}`, 'INFO');

                if (testScenario.testId === 'PERF_LOGIN') {
                    const startTime = Date.now();
                    const loginResult = await LoginManager.login(page);
                    const loginTime = Date.now() - startTime;
                    
                    expect(loginResult.success).toBe(true);
                    expect(loginTime).toBeLessThan(testScenario.maxLoginTime);
                    await debugLog(`✓ Login completed in ${loginTime}ms (max: ${testScenario.maxLoginTime}ms)`, 'SUCCESS');
                }

                if (testScenario.testId === 'PERF_NAVIGATION') {
                    const loginResult = await LoginManager.login(page);
                    expect(loginResult.success).toBe(true);
                    const pages = loginResult.pages;

                    const startTime = Date.now();
                    await pages.dashboardPage.navigateToWebApplication();
                    await pages.dashboardPage.navigateToMobileApplication();
                    const navigationTime = Date.now() - startTime;
                    
                    expect(navigationTime).toBeLessThan(testScenario.maxNavigationTime);
                    await debugLog(`✓ Navigation completed in ${navigationTime}ms (max: ${testScenario.maxNavigationTime}ms)`, 'SUCCESS');
                }

            } catch (error) {
                await debugLog(`${testScenario.testId} failed: ${error.message}`, 'ERROR');
                throw error;
            } finally {
                await section.end();
            }
        });
    });

    // Additional performance tests
    smokeTest('Page Load Performance', {
        testType: 'performance',
        testKey: 'PERF_PAGE_LOAD'
    }, async ({ page }) => {
        const section = createSection('Performance Test - Page Load Time');
        
        try {
            await section.start();
            await debugLog('Measuring page load performance...', 'INFO');

            const startTime = Date.now();
            
            // Navigate to login page
            await page.goto(TEST_DATA.LOGIN.URL);
            await page.waitForLoadState('networkidle');
            
            const loadTime = Date.now() - startTime;
            await debugLog(`Page load time: ${loadTime}ms`, 'INFO');
            
            // Validate performance (should load within 5 seconds)
            expect(loadTime).toBeLessThan(5000);
            await debugLog('✓ Page load performance validated', 'SUCCESS');

        } catch (error) {
            await debugLog(`Page load performance test failed: ${error.message}`, 'ERROR');
            throw error;
        } finally {
            await section.end();
        }
    });

    releaseTest('End-to-End Performance', {
        testType: 'performance',
        testKey: 'PERF_E2E_WORKFLOW'
    }, async ({ page }) => {
        const section = createSection('Performance Test - End-to-End Workflow');
        
        try {
            await section.start();
            await debugLog('Measuring complete workflow performance...', 'INFO');

            const startTime = Date.now();
            
            // Complete workflow
            const loginResult = await LoginManager.login(page);
            expect(loginResult.success).toBe(true);
            const pages = loginResult.pages;
            
            await debugLog('Navigating to Web Application...', 'INFO');
            await pages.dashboardPage.navigateToWebApplication();
            await pages.kanbanPage.waitForKanbanBoard();
            
            await debugLog('Navigating to Mobile Application...', 'INFO');
            await pages.dashboardPage.navigateToMobileApplication();
            await pages.kanbanPage.waitForKanbanBoard();
            
            const totalTime = Date.now() - startTime;
            await debugLog(`Complete workflow time: ${totalTime}ms`, 'INFO');
            
            // Validate performance (should complete within 10 seconds)
            expect(totalTime).toBeLessThan(10000);
            await debugLog('✓ End-to-end performance validated', 'SUCCESS');

        } catch (error) {
            await debugLog(`End-to-end performance test failed: ${error.message}`, 'ERROR');
            throw error;
        } finally {
            await section.end();
        }
    });
});