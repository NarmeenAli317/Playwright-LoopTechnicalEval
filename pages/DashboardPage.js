import { debugLog } from '../shared/debug.js';
import { PlaywrightHandler } from '../shared/PlaywrightHandler.js';

export class DashboardPage {
    constructor(page) {
        this.page = page;
        this.handler = new PlaywrightHandler(page);
        this.webApplicationLink = page.locator('button:has(h2:text("Web Application"))');
        this.mobileApplicationLink = page.locator('button:has(h2:text("Mobile Application"))');
    }
    
    async verifyDashboardLoaded() {
        try {
            // Wait for dashboard elements to be visible
            await Promise.race([
                this.webApplicationLink.waitFor({ timeout: 10000 }),
                this.mobileApplicationLink.waitFor({ timeout: 10000 })
            ]);

            // Dashboard loaded successfully
            return true;
        } catch (error) {
            await debugLog(`Dashboard verification failed: ${error.message}`, 'ERROR');
            return false;
        }
    }

    async verifyUserIsAuthenticated() {
        try {
            // Check if at least one application link is visible (indicates user is logged in)
            const webAppVisible = await this.webApplicationLink.isVisible().catch(() => false);
            const mobileAppVisible = await this.mobileApplicationLink.isVisible().catch(() => false);
            
            if (webAppVisible || mobileAppVisible) {
                await debugLog('User authentication verified - application links visible', 'SUCCESS');
                return true;
            } else {
                await debugLog('User authentication verification failed - no application links visible', 'ERROR');
                return false;
            }
        } catch (error) {
            await debugLog(`User authentication verification failed: ${error.message}`, 'ERROR');
            return false;
        }
    }

    async verifyUserIsNotAuthenticated() {
        try {
            // Check if application links are NOT visible (indicates user is not logged in)
            const webAppCount = await this.webApplicationLink.count();
            const mobileAppCount = await this.mobileApplicationLink.count();
            
            if (webAppCount === 0 && mobileAppCount === 0) {
                await debugLog('User authentication verified - no application links visible', 'SUCCESS');
                return true;
            } else {
                await debugLog('User appears to be authenticated when they should not be', 'ERROR');
                return false;
            }
        } catch (error) {
            await debugLog(`User authentication verification failed: ${error.message}`, 'ERROR');
            return false;
        }
    }

    async navigateToWebApplication() {
        try {
            // Use POM selector
            await this.webApplicationLink.click();

            // Wait for navigation
            await this.page.waitForLoadState('networkidle');
            
            // Verify we're on the Web Application page
            const webAppLoaded = await this.verifyWebApplicationLoaded();
            if (webAppLoaded) {
                await debugLog('Successfully navigated to Web Application', 'SUCCESS');
                return true;
            } else {
                await debugLog('Web Application page did not load properly', 'ERROR');
                return false;
            }
        } catch (error) {
            await debugLog(`Failed to navigate to Web Application: ${error.message}`, 'ERROR');
            return false;
        }
    }

    async navigateToMobileApplication() {
        await debugLog('Navigating to Mobile Application...', 'INFO');
        
        try {
            // Use POM selector
            await this.mobileApplicationLink.click();

            // Wait for navigation
            await this.page.waitForLoadState('networkidle');
            
            // Verify we're on the Mobile Application page
            const mobileAppLoaded = await this.verifyMobileApplicationLoaded();
            if (mobileAppLoaded) {
                await debugLog('Successfully navigated to Mobile Application', 'SUCCESS');
                return true;
            } else {
                await debugLog('Mobile Application page did not load properly', 'ERROR');
                return false;
            }
        } catch (error) {
            await debugLog(`Failed to navigate to Mobile Application: ${error.message}`, 'ERROR');
            return false;
        }
    }

    async verifyWebApplicationLoaded() {
        try {
            // Look for Web Application specific elements
            await Promise.race([
                this.page.waitForSelector('text=Web Application', { timeout: 5000 }),
                this.page.waitForSelector('[data-testid*="web"]', { timeout: 5000 }),
                this.page.waitForSelector('.kanban', { timeout: 5000 }),
                this.page.waitForSelector('.column', { timeout: 5000 })
            ]);
            return true;
        } catch (error) {
            await debugLog(`Web Application verification failed: ${error.message}`, 'ERROR');
            return false;
        }
    }

    async verifyMobileApplicationLoaded() {
        try {
            // Look for Mobile Application specific elements
            await Promise.race([
                this.page.waitForSelector('text=Mobile Application', { timeout: 5000 }),
                this.page.waitForSelector('[data-testid*="mobile"]', { timeout: 5000 }),
                this.page.waitForSelector('.kanban', { timeout: 5000 }),
                this.page.waitForSelector('.column', { timeout: 5000 })
            ]);

            await debugLog('Mobile Application page loaded', 'INFO');
            return true;
        } catch (error) {
            await debugLog(`Mobile Application verification failed: ${error.message}`, 'ERROR');
            return false;
        }
    }

    async waitForPageLoad() {
        try {
            await this.page.waitForLoadState('networkidle');
            await this.verifyDashboardLoaded();
            return true;
        } catch (error) {
            await debugLog(`Dashboard page load failed: ${error.message}`, 'ERROR');
            return false;
        }
    }

    async getCurrentUrl() {
        return this.page.url();
    }

    async takeScreenshot(name = 'dashboard') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `test-results/${name}-${timestamp}.png`;
        await this.page.screenshot({ path: filename, fullPage: true });
        await debugLog(`Screenshot saved: ${filename}`, 'INFO');
        return filename;
    }
}
