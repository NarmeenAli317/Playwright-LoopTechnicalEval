import { expect, test as setup } from '@playwright/test';
import { debugLog } from './shared/debug.js';
import { TEST_DATA } from './shared/env.js';

// Authentication setup that saves storage state
setup('authenticate', async ({ page }) => {
    await debugLog('Setting up authentication and saving storage state...', 'INFO');
    
    // Navigate to login page
    await page.goto(TEST_DATA.LOGIN.URL);
    await debugLog('Navigated to login page', 'INFO');
    
    // Perform login
    await page.getByRole('textbox', { name: 'Username' }).fill(TEST_DATA.LOGIN.EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_DATA.LOGIN.PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Wait for successful login (redirect away from login page)
    await page.waitForURL(url => !url.includes('login'), { timeout: 10000 });
    await debugLog('Login successful', 'SUCCESS');
    
    // Verify we're on the dashboard
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await debugLog('Dashboard loaded successfully', 'SUCCESS');
    
    // Save storage state to file
    await page.context().storageState({ path: 'auth-state.json' });
    await debugLog('Storage state saved to auth-state.json', 'SUCCESS');
});
