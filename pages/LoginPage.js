import { debugLog } from '../shared/debug.js';
import { TEST_DATA } from '../shared/env.js';
import { PlaywrightHandler } from '../shared/PlaywrightHandler.js';

export class LoginPage {
    constructor(page) {
        this.page = page;
        this.handler = new PlaywrightHandler(page);
    }

    // Selectors - following POM pattern
    get usernameInput() { return this.page.getByRole('textbox', { name: 'Username' }); }
    get passwordInput() { return this.page.getByRole('textbox', { name: 'Password' }); }
    get loginButton() { return this.page.getByRole('button', { name: 'Sign in' }); }

    async navigateToLogin(url = null) {
        const loginUrl = url || TEST_DATA.LOGIN.URL;
        await debugLog(`Navigating to login page: ${loginUrl}`, 'INFO');
        await this.page.goto(loginUrl);
        await this.page.waitForLoadState('networkidle');
    }

    async login(email = null, password = null) {
        const loginEmail = email || TEST_DATA.LOGIN.EMAIL;
        const loginPassword = password || TEST_DATA.LOGIN.PASSWORD;

        await debugLog(`Attempting login with email: ${loginEmail}`, 'INFO');

        // Use POM selectors
        await this.usernameInput.click();
        await this.usernameInput.fill(loginEmail);
        await debugLog('Username entered', 'SUCCESS');

        await this.passwordInput.click();
        await this.passwordInput.fill(loginPassword);
        await debugLog('Password entered', 'SUCCESS');

        await this.loginButton.click();
        await debugLog('Login button clicked', 'SUCCESS');

        // Wait for navigation or error
        await this.page.waitForLoadState('networkidle');
    }

    async verifyLoginSuccess() {
        try {
            // Wait for either success indicators or error messages
            await Promise.race([
                // Success indicators
                this.page.waitForSelector('text=Dashboard', { timeout: 5000 }),
                this.page.waitForSelector('text=Web Application', { timeout: 5000 }),
                this.page.waitForSelector('text=Mobile Application', { timeout: 5000 }),
                this.page.waitForSelector('[data-testid*="dashboard"]', { timeout: 5000 }),
                this.page.waitForSelector('[data-testid*="home"]', { timeout: 5000 }),
                // Generic success - no error messages
                this.page.waitForFunction(() => {
                    const errorMessages = document.querySelectorAll('[class*="error"], [class*="alert"], [class*="warning"]');
                    return errorMessages.length === 0;
                }, { timeout: 5000 })
            ]);

            // Additional verification - check if we're not on login page anymore
            const currentUrl = this.page.url();
            const isStillOnLoginPage = currentUrl.includes('login') || currentUrl.includes('signin');
            
            if (isStillOnLoginPage) {
                await debugLog('Still on login page after login attempt', 'WARN');
                return false;
            }

            await debugLog('Login successful - redirected from login page', 'SUCCESS');
            return true;

        } catch (error) {
            await debugLog(`Login verification failed: ${error.message}`, 'ERROR');
            
            // Check for common error messages
            const errorSelectors = [
                'text=Invalid credentials',
                'text=Login failed',
                'text=Authentication failed',
                'text=Invalid email or password',
                '[class*="error"]',
                '[class*="alert"]'
            ];

            for (const selector of errorSelectors) {
                try {
                    const errorElement = await this.page.waitForSelector(selector, { timeout: 1000 });
                    if (errorElement) {
                        const errorText = await errorElement.textContent();
                        await debugLog(`Login error detected: ${errorText}`, 'ERROR');
                        break;
                    }
                } catch (e) {
                    // Continue checking other selectors
                }
            }

            return false;
        }
    }

    async verifyLoginFailure() {
        try {
            // Wait for error message
            await this.page.waitForSelector('[class*="error"], [class*="alert"], text=Invalid', { timeout: 5000 });
            await debugLog('Login failure verified - error message displayed', 'SUCCESS');
            return true;
        } catch (error) {
            await debugLog('Login failure verification failed - no error message found', 'WARN');
            return false;
        }
    }

    async getCurrentUrl() {
        return this.page.url();
    }

    async takeScreenshot(name = 'login-page') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `test-results/${name}-${timestamp}.png`;
        await this.page.screenshot({ path: filename, fullPage: true });
        await debugLog(`Screenshot saved: ${filename}`, 'INFO');
        return filename;
    }
}