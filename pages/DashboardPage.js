import { debugLog } from '../shared/debug.js';
import { PlaywrightHandler } from '../shared/PlaywrightHandler.js';

export class DashboardPage {
    constructor(page) {
        this.page = page;
        this.handler = new PlaywrightHandler(page);
    }

    // Selectors - following POM pattern
    get webApplicationLink() { return this.page.getByRole('button', { name: 'Web Application Main web' }); }
    get mobileApplicationLink() { return this.page.getByRole('button', { name: 'Mobile Application Native' }); }

    async verifyDashboardLoaded() {
        try {
            // Wait for dashboard elements to be visible
            await Promise.race([
                this.page.waitForSelector('text=Web Application', { timeout: 10000 }),
                this.page.waitForSelector('text=Mobile Application', { timeout: 10000 }),
                this.page.waitForSelector('[data-testid*="dashboard"]', { timeout: 10000 }),
                this.page.waitForSelector('[data-testid*="home"]', { timeout: 10000 })
            ]);

            await debugLog('Dashboard loaded successfully', 'SUCCESS');
            return true;
        } catch (error) {
            await debugLog(`Dashboard verification failed: ${error.message}`, 'ERROR');
            return false;
        }
    }

    async navigateToWebApplication() {
        await debugLog('Navigating to Web Application...', 'INFO');
        
        try {
            // Use POM selector
            await this.webApplicationLink.click();
            await debugLog('Web Application link clicked', 'SUCCESS');

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
            await debugLog('Mobile Application link clicked', 'SUCCESS');

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

            await debugLog('Web Application page loaded', 'SUCCESS');
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

            await debugLog('Mobile Application page loaded', 'SUCCESS');
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
