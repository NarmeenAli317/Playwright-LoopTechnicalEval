import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { debugLog } from './debug.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

dotenv.config({ 
    path: envPath,
    debug: false,
    quiet: true
});

const currentEnv = process.env.ENV || 'DEMO';

if (!currentEnv) {
    console.error('❌ ENV required: ENV=DEMO|UAT|PROD');
    process.exit(1);
}

const VALID_ENVIRONMENTS = ['DEMO', 'UAT', 'PROD'];
if (!VALID_ENVIRONMENTS.includes(currentEnv.toUpperCase())) {
    console.error(`❌ Invalid ENV: ${currentEnv}. Use: ${VALID_ENVIRONMENTS.join('|')}`);
    process.exit(1);
}

console.log(`🎯 ${currentEnv}`);

// Environment Configuration for Technical Evaluation
export const ENVIRONMENT_CONFIG = {
    DEMO: {
        NAME: 'DEMO',
        URLS: {
            ASANA_DEMO: 'https://animated-gingersnap-8cf7f2.netlify.app/'
        },
        CREDENTIALS: {
            DEMO_USER: {
                EMAIL: 'admin',
                PASSWORD: 'password123'
            }
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
        }
    },
    UAT: {
        NAME: 'UAT',
        URLS: {
            ASANA_DEMO: process.env.ASANA_DEMO_URL_UATR || 'https://animated-gingersnap-8cf7f2.netlify.app/'
        },
        CREDENTIALS: {
            DEMO_USER: {
                EMAIL: process.env.ASANA_DEMO_EMAIL_UAT || 'admin',
                PASSWORD: process.env.ASANA_DEMO_PASSWORD_UATR || 'password123'
            }
        },
        TIMEOUTS: {
            DEFAULT: 15000,
            LOGIN: 20000,
            NAVIGATION: 10000,
            KANBAN_LOAD: 15000
        },
        BROWSER: {
            HEADLESS: process.env.HEADLESS_UATR === 'false' ? false : true,
            VIEWPORT: { width: 1280, height: 720 }
        }
    },
    PROD: {
        NAME: 'PROD',
        URLS: {
            ASANA_DEMO: process.env.ASANA_DEMO_URL_PROD || 'https://animated-gingersnap-8cf7f2.netlify.app/'
        },
        CREDENTIALS: {
            DEMO_USER: {
                EMAIL: process.env.ASANA_DEMO_EMAIL_PROD || 'admin',
                PASSWORD: process.env.ASANA_DEMO_PASSWORD_PROD || 'password123'
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
        EMAIL: CURRENT_ENV.CREDENTIALS.DEMO_USER.EMAIL,
        PASSWORD: CURRENT_ENV.CREDENTIALS.DEMO_USER.PASSWORD
    },
    TEST_CASES: {
        WEB_APPLICATION: [
            {
                id: 'TC1',
                name: 'Verify user authentication task in To Do column',
                description: 'Login to Demo App, navigate to Web Application, verify "Implement user authentication" is in the "To Do" column with tags "Feature" and "High Priority"',
                application: 'Web Application',
                taskName: 'Implement user authentication',
                column: 'To Do',
                expectedTags: ['Feature', 'High Priority'],
                priority: 'high',
                category: 'smoke'
            },
            {
                id: 'TC2',
                name: 'Verify navigation bug task in To Do column',
                description: 'Login to Demo App, navigate to Web Application, verify "Fix navigation bug" is in the "To Do" column with tag "Bug"',
                application: 'Web Application',
                taskName: 'Fix navigation bug',
                column: 'To Do',
                expectedTags: ['Bug'],
                priority: 'medium',
                category: 'regression'
            },
            {
                id: 'TC3',
                name: 'Verify design system updates task in In Progress column',
                description: 'Login to Demo App, navigate to Web Application, verify "Design system updates" is in the "In Progress" column with tag "Design"',
                application: 'Web Application',
                taskName: 'Design system updates',
                column: 'In Progress',
                expectedTags: ['Design'],
                priority: 'medium',
                category: 'regression'
            }
        ],
        MOBILE_APPLICATION: [
            {
                id: 'TC4',
                name: 'Verify push notification system task in To Do column',
                description: 'Login to Demo App, navigate to Mobile Application, verify "Push notification system" is in the "To Do" column with tag "Feature"',
                application: 'Mobile Application',
                taskName: 'Push notification system',
                column: 'To Do',
                expectedTags: ['Feature'],
                priority: 'medium',
                category: 'smoke'
            },
            {
                id: 'TC5',
                name: 'Verify offline mode task in In Progress column',
                description: 'Login to Demo App, navigate to Mobile Application, verify "Offline mode" is in the "In Progress" column with tags "Feature" and "High Priority"',
                application: 'Mobile Application',
                taskName: 'Offline mode',
                column: 'In Progress',
                expectedTags: ['Feature', 'High Priority'],
                priority: 'high',
                category: 'smoke'
            },
            {
                id: 'TC6',
                name: 'Verify app icon design task in Done column',
                description: 'Login to Demo App, navigate to Mobile Application, verify "App icon design" is in the "Done" column with tag "Design"',
                application: 'Mobile Application',
                taskName: 'App icon design',
                column: 'Done',
                expectedTags: ['Design'],
                priority: 'low',
                category: 'regression'
            }
        ]
    },
    SELECTORS: {
        LOGIN: {
            USERNAME_INPUT: "input[placeholder='Username']",
            PASSWORD_INPUT: "input[placeholder='Password']", 
            LOGIN_BUTTON: "button:has-text('Sign in')",
            LOGIN_ERROR_MESSAGE: "div.text-red-500.text-sm"
        },
        NAVIGATION: {
            WEB_APPLICATION_LINK: "button:has-text('Web Application Main web')",
            MOBILE_APPLICATION_LINK: "button:has-text('Mobile Application Native')"
        },
        KANBAN: {
            TO_DO_COLUMN: "h2:has-text('To Do')",
            IN_PROGRESS_COLUMN: "h2:has-text('In Progress')",
            DONE_COLUMN: "h2:has-text('Done')",
            TASK_CARD: "button, [role='button']",
            TASK_TITLE: "text=Implement user authentication, text=Fix navigation bug, text=Design system updates, text=Push notification system, text=Offline mode, text=App icon design",
            TASK_TAGS: "text=Feature, text=High Priority, text=Bug, text=Design"
        }
    },
    
    // Condensed reusable selectors - much easier to use!
    SELECTORS: {
        // Login selectors
        username: (page) => page.getByRole('textbox', { name: 'Username' }),
        password: (page) => page.getByRole('textbox', { name: 'Password' }),
        loginBtn: (page) => page.getByRole('button', { name: 'Sign in' }),
        
        // Navigation selectors
        webApp: (page) => page.getByRole('button', { name: 'Web Application Main web' }),
        mobileApp: (page) => page.getByRole('button', { name: 'Mobile Application Native' })
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
