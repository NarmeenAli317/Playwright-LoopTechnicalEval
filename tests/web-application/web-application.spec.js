import { expect, test } from '@playwright/test';
import { createSection, debugLog, initDebugMode } from '../../shared/debug.js';
import { PageFactory } from '../../shared/PageFactory.js';
import { regressionTest, smokeTest } from '../../shared/test-wrappers.js';
import testData from '../../test-data.json' assert { type: 'json' };

// Initialize debug mode
initDebugMode();

// Filter test scenarios for Web Application only
const webApplicationTests = testData.testScenarios.filter(scenario => 
    scenario.application === 'Web Application'
);

test.describe('Web Application Tests - Data Driven', () => {
    webApplicationTests.forEach((testScenario) => {
        const testFunction = testScenario.category === 'smoke' ? smokeTest : regressionTest;
        
        testFunction(testScenario.testName, {
            testTypes: testScenario.testTypes,
            testKey: testScenario.testKey
        }, async ({ page }) => {
            const section = createSection(testScenario.testName);
            
            try {
                await section.start();
                await debugLog(`Executing ${testScenario.testId}: ${testScenario.description}`, 'INFO');

                // Step 1: Verify we're already logged in (storage state)
                await debugLog('Step 1: Verifying authentication state...', 'INFO');
                await page.waitForLoadState('networkidle');
                await expect(page.locator('text=Dashboard')).toBeVisible();
                await debugLog('✓ Already authenticated via storage state', 'SUCCESS');

                // Step 2: Create page objects
                await debugLog('Step 2: Creating page objects...', 'INFO');
                const pages = PageFactory.createPages(page);
                await debugLog('Page objects created', 'SUCCESS');

                // Step 3: Navigate to Web Application
                await debugLog('Step 3: Navigating to Web Application...', 'INFO');
                const navigationResult = await pages.dashboardPage.navigateToWebApplication();
                expect(navigationResult).toBe(true);
                await debugLog('Navigation to Web Application successful', 'SUCCESS');

                // Step 4: Wait for kanban board
                await debugLog('Step 4: Waiting for kanban board to load...', 'INFO');
                const kanbanLoaded = await pages.kanbanPage.waitForKanbanBoard();
                expect(kanbanLoaded).toBe(true);
                await debugLog('Kanban board loaded', 'SUCCESS');

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
                
                await debugLog(`✓ Task "${testScenario.taskName}" found in ${testScenario.column} column`, 'SUCCESS');
                await debugLog(`✓ Tags verified: ${testScenario.expectedTags.join(', ')}`, 'SUCCESS');

                await debugLog(`${testScenario.testId} completed successfully`, 'SUCCESS');

            } catch (error) {
                await debugLog(`${testScenario.testId} failed: ${error.message}`, 'ERROR');
                throw error;
            } finally {
                await section.end();
            }
        });
    });
});