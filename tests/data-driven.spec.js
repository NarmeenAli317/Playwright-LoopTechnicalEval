import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage.js';
import { KanbanPage } from '../pages/KanbanPage.js';
import { LoginPage } from '../pages/LoginPage.js';
import { CURRENT_ENV, TEST_DATA as ENV_TEST_DATA } from '../shared/env.js';
import testData from '../test-data.json' assert { type: 'json' };

test('Single data-driven evaluation suite', async ({ page, browser }, testInfo) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const kanbanPage = new KanbanPage(page);

    // Preconditions: navigate to app and login using env credentials (storageState already set for chromium project)
    // If storageState not present (e.g., running unauthenticated), perform login.
    await test.step('Navigate to app', async () => {
        await loginPage.navigateToLogin(CURRENT_ENV.URLS.ASANA_DEMO);
    });

    // Heuristic: If dashboard not visible, attempt login
    await test.step('Ensure authenticated session', async () => {
        const isDashboard = await dashboardPage.verifyDashboardLoaded();
        if (!isDashboard) {
            await loginPage.login(ENV_TEST_DATA.LOGIN.USERNAME, ENV_TEST_DATA.LOGIN.PASSWORD);
            const ok = await dashboardPage.verifyDashboardLoaded();
            expect(ok, 'Dashboard should be visible after login').toBeTruthy();
        }
    });

    // Iterate functional scenarios (web/mobile board validations)
    for (const scenario of testData.testScenarios) {
        await test.step(`${scenario.testKey} - ${scenario.testName}`, async () => {
            // Navigate to requested application
            if (scenario.application.toLowerCase().includes('web')) {
                const ok = await dashboardPage.navigateToWebApplication();
                expect(ok).toBeTruthy();
            } else if (scenario.application.toLowerCase().includes('mobile')) {
                const ok = await dashboardPage.navigateToMobileApplication();
                expect(ok).toBeTruthy();
            }

            // Wait for kanban
            const boardLoaded = await kanbanPage.waitForKanbanBoard();
            expect(boardLoaded).toBeTruthy();

            // Verify task presence and tags
            const result = await kanbanPage.verifyTaskInColumn(
                scenario.taskName,
                scenario.column,
                scenario.expectedTags || []
            );

            expect(result.found, `Task ${scenario.taskName} should exist in ${scenario.column}`).toBeTruthy();
            if (scenario.expectedTags && scenario.expectedTags.length > 0) {
                expect(result.tagsMatch, `Expected tags ${scenario.expectedTags} on ${scenario.taskName}. Actual: ${result.tags}`).toBeTruthy();
            }

            // Attach minimal artifact per scenario
            const screenshot = await page.screenshot({ fullPage: true });
            await testInfo.attach(`${scenario.testKey}-screenshot`, { body: screenshot, contentType: 'image/png' });
        });
    }

    // Negative login scenarios removed per request

    // Performance scenarios removed per request
});


