/**
 * Environment Configuration and Test Data Management
 * 
 * This module provides centralized configuration management for different
 * environments (DEMO, UAT, PROD) with dynamic credential loading, URL
 * management, and timeout configurations. It demonstrates enterprise-level
 * configuration management patterns with environment-specific settings.
 * 
 * Key Features:
 * - Multi-environment support (DEMO, UAT, PROD)
 * - Secure credential management via .env files
 * - Dynamic configuration loading based on environment
 * - Centralized test data management
 * - Environment-specific timeout and browser settings
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { debugLog } from './debug.js';

// ES Module compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

// Load environment variables from .env file
dotenv.config({ 
    path: envPath,
    debug: false,    // Disable dotenv debug output
    quiet: true      // Suppress dotenv warnings
});

// Determine current environment with fallback to DEMO
const currentEnv = process.env.ENV || 'DEMO';

// Validate environment variable
if (!currentEnv) {
    console.error('❌ ENV required: ENV=DEMO|UAT|PROD');
    process.exit(1);
}

// Validate against allowed environments
const VALID_ENVIRONMENTS = ['DEMO', 'UAT', 'PROD'];
if (!VALID_ENVIRONMENTS.includes(currentEnv.toUpperCase())) {
    console.error(`❌ Invalid ENV: ${currentEnv}. Use: ${VALID_ENVIRONMENTS.join('|')}`);
    process.exit(1);
}

// Display current environment for visibility
console.log(`🎯 ${currentEnv}`);

/**
 * Global credentials configuration
 * 
 * Centralized credential management with fallback values for development.
 * In production, these should be loaded from secure environment variables
 * or a secrets management system.
 */
export const CREDENTIALS = {
    USERNAME: process.env.username || 'admin',
    PASSWORD: process.env.password || 'password123'
};

// Environment Configuration for Technical Evaluation
export const ENVIRONMENT_CONFIG = {
    DEMO: {
        NAME: 'DEMO',
        URLS: {
            ASANA_DEMO: 'https://animated-gingersnap-8cf7f2.netlify.app/'
        },
        TIMEOUTS: {
            DEFAULT: 10000,
            LOGIN: 15000,
            NAVIGATION: 8000,
            KANBAN_LOAD: 10000
        },
        BROWSER: {
            HEADLESS: true,
            VIEWPORT: { width: 1280, height: 720 }
        },
        CREDENTIALS: {
            DEMO_USER: {
                USERNAME: process.env.username || 'admin',
                PASSWORD: process.env.password || 'password123'
            }
        }
    },
    UAT: {
        NAME: 'UAT',
        URLS: {
            ASANA_DEMO: process.env.ASANA_DEMO_URL_UAT || 'https://uat.animated-gingersnap-8cf7f2.netlify.app/'
        },
        CREDENTIALS: {
            DEMO_USER: {
                USERNAME: process.env.username || 'admin', // sensitive data stored in .env file. this is just for demo purposes.
                PASSWORD: process.env.password || 'password123'
            }
        },
        TIMEOUTS: {
            DEFAULT: 15000,
            LOGIN: 20000,
            NAVIGATION: 10000,
            KANBAN_LOAD: 15000
        },
        BROWSER: {
            HEADLESS: process.env.HEADLESS_UAT === 'false' ? false : true,
            VIEWPORT: { width: 1280, height: 720 }
        }
    },
    PROD: {
        NAME: 'PROD',
        URLS: {
            ASANA_DEMO: process.env.ASANA_DEMO_URL_PROD || 'https://www.animated-gingersnap-8cf7f2.netlify.app/'
        },
        CREDENTIALS: {
            DEMO_USER: {
                USERNAME: process.env.username || 'admin',
                PASSWORD: process.env.password || 'password123'
            }
        },
        TIMEOUTS: {
            DEFAULT: 20000,
            LOGIN: 25000,
            NAVIGATION: 15000,
            KANBAN_LOAD: 20000
        },
        BROWSER: {
            HEADLESS: process.env.HEADLESS_PROD === 'false' ? false : true,
            VIEWPORT: { width: 1280, height: 720 }
        }
    }
};

// Get current environment configuration
export const getCurrentEnvironment = () => {
    return ENVIRONMENT_CONFIG[currentEnv.toUpperCase()] || ENVIRONMENT_CONFIG.DEMO;
};

// Export current environment configuration (dynamic getter)
export const CURRENT_ENV = new Proxy({}, {
    get(target, prop) {
        const env = getCurrentEnvironment();
        return env[prop];
    },
    ownKeys(target) {
        const env = getCurrentEnvironment();
        return Reflect.ownKeys(env);
    },
    getOwnPropertyDescriptor(target, prop) {
        const env = getCurrentEnvironment();
        return Reflect.getOwnPropertyDescriptor(env, prop);
    },
    has(target, prop) {
        const env = getCurrentEnvironment();
        return prop in env;
    }
});

// Test Data Configuration
export const TEST_DATA = {
    LOGIN: {
        URL: CURRENT_ENV.URLS.ASANA_DEMO,
        USERNAME: CREDENTIALS.USERNAME,
        PASSWORD: CREDENTIALS.PASSWORD
    }
};

// Helper functions
export function getTestEnv() {
    return getCurrentEnvironment();
}

export function logWithEnv(message, level = 'info') {
    const env = getTestEnv();
    debugLog(`[${env.NAME}] ${message}`, level);
}

export function createTestPath(testName, subDir = 'TestResults') {
    const env = getTestEnv();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const sanitizedTestName = testName.replace(/[^a-zA-Z0-9]/g, '_');
    
    return path.join(
        process.cwd(), 
        'test-results', 
        env.NAME, 
        subDir, 
        `${sanitizedTestName}_${timestamp}_${randomSuffix}`
    );
}

export function getBasePath() {
    const env = getTestEnv();
    return path.join(process.cwd(), 'test-results', env.NAME);
}

export function logEnvironmentInfo() {
    const env = getTestEnv();
    debugLog(`Environment: ${env.NAME}`, 'info');
    debugLog(`Environment Base Path: ${getBasePath()}`, 'info');
    debugLog(`Demo URL: ${env.URLS.ASANA_DEMO}`, 'debug');
}

export function setupEnvironmentLogging() {
    logEnvironmentInfo();
}
