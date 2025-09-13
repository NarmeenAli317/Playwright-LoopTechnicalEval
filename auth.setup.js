import { test as setup } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { debugLog } from './shared/debug.js';

// Authentication setup that saves storage state
setup('authenticate', async ({ page }) => {
    // Override any global environment variables for this test
    process.env.username = 'admin';
    process.env.password = 'password123';
    
    // Create LoginPage instance
    const loginPage = new LoginPage(page);
    
    // Navigate to login page
    await loginPage.navigateToLogin();
    
    // Perform login
    await loginPage.login(process.env.username, process.env.password);
    
    // Wait for successful login using DashboardPage
    const dashboardPage = new DashboardPage(page);
    const dashboardLoaded = await dashboardPage.verifyDashboardLoaded();
    
    if (dashboardLoaded) {
        await debugLog('Authentication setup completed successfully', 'SUCCESS');
    } else {
        throw new Error('Dashboard did not load after login');
    }
    
    // Save storage state to file
    await page.context().storageState({ path: 'auth-state.json' });
});
