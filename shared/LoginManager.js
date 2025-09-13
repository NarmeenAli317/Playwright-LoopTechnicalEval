import { DashboardPage } from '../pages/DashboardPage.js';
import { KanbanPage } from '../pages/KanbanPage.js';
import { LoginPage } from '../pages/LoginPage.js';
import { createSection, debugLog } from './debug.js';
import { TEST_DATA } from './env.js';

export class LoginManager {
    static async login(page) {
        const section = createSection('Login Process');
        
        try {
            await section.start();
            await debugLog('Starting login process...', 'INFO');

            // Initialize page objects
            const loginPage = new LoginPage(page);
            const dashboardPage = new DashboardPage(page);
            const kanbanPage = new KanbanPage(page);

            // Step 1: Navigate to login page
            await debugLog('Step 1: Navigating to login page...', 'INFO');
            await loginPage.navigateToLogin();

            // Step 2: Perform login
            await debugLog('Step 2: Performing login...', 'INFO');
            await loginPage.login(TEST_DATA.LOGIN.USERNAME, TEST_DATA.LOGIN.PASSWORD);

            // Step 3: Verify login success
            await debugLog('Step 3: Verifying login success...', 'INFO');
            const loginSuccess = await loginPage.verifyLoginSuccess();
            
            if (!loginSuccess) {
                await debugLog('Login failed - could not verify successful login', 'ERROR');
                return {
                    success: false,
                    error: 'Login verification failed'
                };
            }

            // Step 4: Verify dashboard is loaded
            await debugLog('Step 4: Verifying dashboard is loaded...', 'INFO');
            const dashboardLoaded = await dashboardPage.verifyDashboardLoaded();
            
            if (!dashboardLoaded) {
                await debugLog('Dashboard verification failed', 'WARN');
            }

            await debugLog('Login process completed successfully', 'SUCCESS');
            
            return {
                success: true,
                pages: {
                    loginPage,
                    dashboardPage,
                    kanbanPage
                }
            };

        } catch (error) {
            await debugLog(`Login process failed: ${error.message}`, 'ERROR');
            return {
                success: false,
                error: error.message
            };
        } finally {
            await section.end();
        }
    }

    static async loginWithCredentials(page, email, password) {
        const section = createSection('Login Process with Custom Credentials');
        
        try {
            await section.start();
            await debugLog(`Starting login process with email: ${email}`, 'INFO');

            // Initialize page objects
            const loginPage = new LoginPage(page);
            const dashboardPage = new DashboardPage(page);
            const kanbanPage = new KanbanPage(page);

            // Step 1: Navigate to login page
            await debugLog('Step 1: Navigating to login page...', 'INFO');
            await loginPage.navigateToLogin();

            // Step 2: Perform login with custom credentials
            await debugLog('Step 2: Performing login with custom credentials...', 'INFO');
            await loginPage.login(email, password);

            // Step 3: Verify login success
            await debugLog('Step 3: Verifying login success...', 'INFO');
            const loginSuccess = await loginPage.verifyLoginSuccess();
            
            if (!loginSuccess) {
                await debugLog('Login failed - could not verify successful login', 'ERROR');
                return { 
                    success: false, 
                    error: 'Login verification failed' 
                };
            }

            // Step 4: Verify dashboard is loaded
            await debugLog('Step 4: Verifying dashboard is loaded...', 'INFO');
            const dashboardLoaded = await dashboardPage.verifyDashboardLoaded();
            
            if (!dashboardLoaded) {
                await debugLog('Dashboard verification failed', 'WARN');
            }

            await debugLog('Login process with custom credentials completed successfully', 'SUCCESS');
            
            return {
                success: true,
                pages: {
                    loginPage,
                    dashboardPage,
                    kanbanPage
                }
            };

        } catch (error) {
            await debugLog(`Login process with custom credentials failed: ${error.message}`, 'ERROR');
            return {
                success: false,
                error: error.message
            };
        } finally {
            await section.end();
        }
    }

    static async logout(page) {
        const section = createSection('Logout Process');
        
        try {
            await section.start();
            await debugLog('Starting logout process...', 'INFO');

            // Look for logout button/link
            const logoutSelectors = [
                'text=Logout',
                'text=Sign Out',
                'text=Log Out',
                '[data-testid*="logout"]',
                '[data-testid*="signout"]',
                'button:has-text("Logout")',
                'a:has-text("Logout")'
            ];

            let logoutClicked = false;
            for (const selector of logoutSelectors) {
                try {
                    await page.waitForSelector(selector, { timeout: 2000 });
                    await page.click(selector);
                    logoutClicked = true;
                    await debugLog('Logout button clicked', 'SUCCESS');
                    break;
                } catch (e) {
                    // Continue to next selector
                }
            }

            if (!logoutClicked) {
                await debugLog('No logout button found, navigating to login page', 'WARN');
                await page.goto(TEST_DATA.LOGIN.URL);
            }

            // Wait for navigation
            await page.waitForLoadState('networkidle');

            // Verify we're back on login page
            const currentUrl = page.url();
            const isOnLoginPage = currentUrl.includes('login') || currentUrl.includes('signin') || currentUrl === TEST_DATA.LOGIN.URL;
            
            if (isOnLoginPage) {
                await debugLog('Logout successful - returned to login page', 'SUCCESS');
                return { success: true };
            } else {
                await debugLog('Logout verification failed - not on login page', 'WARN');
                return { success: false, error: 'Not redirected to login page' };
            }

        } catch (error) {
            await debugLog(`Logout process failed: ${error.message}`, 'ERROR');
            return {
                success: false,
                error: error.message
            };
        } finally {
            await section.end();
        }
    }
}

export default LoginManager;
