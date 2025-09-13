import { expect, test } from '@playwright/test';
import { createSection, debugLog, initDebugMode } from '../../shared/debug.js';
import { TEST_DATA } from '../../shared/env.js';
import { PageFactory } from '../../shared/PageFactory.js';
import { regressionTest, smokeTest } from '../../shared/test-wrappers.js';
import testData from '../../test-data.json' assert { type: 'json' };

// Initialize debug mode
initDebugMode();

// Filter test scenarios for Mobile Application only
const mobileApplicationTests = testData.testScenarios.filter(scenario => 
    scenario.application === 'Mobile Application'
);

test.describe('Mobile Application Tests - Data Driven', () => {
    mobileApplicationTests.forEach((testScenario) => {
        const testFunction = testScenario.category === 'smoke' ? smokeTest : regressionTest;
        
        testFunction(`${testScenario.testKey} - ${testScenario.taskName} in ${testScenario.column}`, {
            testTypes: testScenario.testTypes,
            testKey: testScenario.testKey
        }, async ({ page }) => {
            const section = createSection(testScenario.testName);
            
            try {
                await section.start();
                await debugLog(`Executing ${testScenario.testKey}: ${testScenario.description}`, 'INFO');

                // Step 1: Verify we're already logged in (storage state)
                await debugLog('Step 1: Waiting for page to load with storage state...', 'INFO');
                await page.waitForLoadState('networkidle');
                
                // Step 2: Create page objects and navigate to dashboard
                await debugLog('Step 2: Creating page objects and navigating to dashboard...', 'INFO');
                const pages = PageFactory.createPages(page);
                await page.goto(TEST_DATA.LOGIN.URL);
                await pages.dashboardPage.waitForPageLoad();
                
                const isAuthenticated = await pages.dashboardPage.verifyUserIsAuthenticated();
                expect(isAuthenticated).toBe(true);
                await debugLog('Already authenticated via storage state', 'SUCCESS');

                // Step 3: Navigate to Mobile Application
                await debugLog('Step 3: Navigating to Mobile Application...', 'INFO');
                const navigationResult = await pages.dashboardPage.navigateToMobileApplication();
                expect(navigationResult).toBe(true);
                await debugLog('Navigation to Mobile Application successful', 'SUCCESS');

                // Step 4: Wait for kanban board
                await debugLog('Step 4: Waiting for kanban board to load...', 'INFO');
                const kanbanLoaded = await pages.kanbanPage.waitForKanbanBoard();
                expect(kanbanLoaded).toBe(true);

                // Step 5: Verify task in specified column (data-driven)
                await debugLog(`Step 5: Verifying "${testScenario.taskName}" task in ${testScenario.column} column...`, 'INFO');
                const verificationResult = await pages.kanbanPage.verifyTaskInColumn(
                    testScenario.taskName,
                    testScenario.column,
                    testScenario.expectedTags
                );
                
                expect(verificationResult.found).toBe(true);
                expect(verificationResult.column).toBe(testScenario.column);
                expect(verificationResult.tags).toEqual(expect.arrayContaining(testScenario.expectedTags));
                
                await debugLog(`Task "${testScenario.taskName}" found in ${testScenario.column} column`, 'SUCCESS');
                await debugLog(`Tags verified: ${testScenario.expectedTags.join(', ')}`, 'SUCCESS');

                await debugLog(`${testScenario.testKey} completed successfully`, 'SUCCESS');

            } catch (error) {
                await debugLog(`${testScenario.testKey} failed: ${error.message}`, 'ERROR');
                throw error;
            } finally {
                await section.end();
            }
        });
    });
});