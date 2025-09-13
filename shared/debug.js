/**
 * Advanced Debug Logging System
 * 
 * This module provides a comprehensive logging system with color-coded output,
 * structured formatting, and environment-aware debug control. Designed for
 * enterprise-level test automation with clear visual feedback and professional
 * reporting capabilities.
 * 
 * Features:
 * - ANSI color-coded console output for different log levels
 * - Environment-aware debug mode control
 * - Structured section logging for test organization
 * - Support for both string and object message formatting
 * - Professional visual indicators with emojis and colors
 */

let debugMode = false; // Global flag to control debug message visibility

/**
 * Log level configuration with ANSI color codes and visual indicators
 * Each level has a distinct color and emoji for quick visual identification
 * during test execution, making it easier to spot issues and track progress
 */
const LOG_LEVELS = {
    DEBUG: { prefix: '\x1b[37m', color: '\x1b[37;1m' },     // Bright white for detailed debugging
    INFO: { prefix: 'ℹ️', color: '\x1b[36;1m' },            // Cyan for informational messages
    SUCCESS: { prefix: '✅', color: '\x1b[32;1m' },        // Green for successful operations
    WARN: { prefix: '⚠️', color: '\x1b[33;1m' },            // Yellow for warnings
    ERROR: { prefix: '❌', color: '\x1b[31;1m' },           // Red for errors
    HEADER: { prefix: '', color: '\x1b[35;1m' },            // Magenta for section headers
    SUBHEADER: { prefix: '', color: '\x1b[34;1m' }          // Blue for subsection headers
};

const RESET_COLOR = '\x1b[0m'; // ANSI escape code to reset terminal colors

/**
 * Initializes debug mode based on command line arguments
 * 
 * This function parses command line arguments to determine if debug mode
 * should be enabled. Debug mode controls the visibility of detailed
 * debugging messages during test execution.
 * 
 * Supported flags:
 * - --debug: Full debug mode
 * - -d: Short form of debug mode
 * 
 * @example
 * // Enable debug mode
 * node test.js --debug
 * // or
 * node test.js -d
 */
export function initDebugMode() {
    const argv = process.argv.slice(2);
    debugMode = argv.includes('--debug') || argv.includes('-d');
}

/**
 * Logs a message to the console with the specified log level
 * 
 * This is the core logging function that handles message formatting,
 * color coding, and conditional output based on debug mode settings.
 * It supports both string and object messages with proper formatting.
 * 
 * @param {string|Object} message - The message to log. Objects are JSON stringified
 * @param {string} level - The log level (DEBUG, INFO, SUCCESS, WARN, ERROR, HEADER)
 * 
 * @example
 * // Log a simple message
 * await debugLog('Test started', 'INFO');
 * 
 * // Log an object with pretty formatting
 * await debugLog({ userId: 123, action: 'login' }, 'DEBUG');
 * 
 * // Log a section header
 * await debugLog('=== Authentication Test ===', 'HEADER');
 */
export async function debugLog(message, level = 'DEBUG') {
    // Skip debug messages if debug mode is disabled
    if (!debugMode && level === 'DEBUG') return;

    // Normalize log level to uppercase for consistent lookup
    const logLevel = typeof level === 'string' ? level.toUpperCase() : 'DEBUG';
    const logConfig = LOG_LEVELS[logLevel] || LOG_LEVELS.DEBUG;
    
    // Format message based on type - objects get pretty JSON formatting
    let formattedMessage = typeof message === 'object' ? 
        JSON.stringify(message, null, 2) : message;

    // Detect section headers for special formatting
    const isSectionHeader = formattedMessage.startsWith('---') || formattedMessage.startsWith('===');
    const messageColor = isSectionHeader ? '\x1b[35m' : logConfig.color;

    // Add prefix only for non-continuation lines and non-section headers
    if (!formattedMessage.startsWith('   ') && !isSectionHeader) {
        formattedMessage = `${logConfig.prefix} ${formattedMessage}`;
    }

    // Output with color coding and reset
    console.log(`${messageColor}${formattedMessage}${RESET_COLOR}`);
}

/**
 * Creates a section logger for structured test organization
 * 
 * This function returns an object with start() and end() methods that create
 * visually distinct section boundaries in the log output. This is particularly
 * useful for organizing test execution into logical phases and making the
 * output more readable during complex test scenarios.
 * 
 * @param {string} title - The title of the section to be logged
 * @returns {Object} - An object with start and end methods for logging
 * 
 * @example
 * const section = createSection('User Authentication');
 * await section.start();  // Logs: === User Authentication ===
 * // ... perform authentication steps ...
 * await section.end();    // Logs: === User Authentication Complete ===
 */
export function createSection(title) {
    return {
        start: async () => {
            await debugLog(`\n=== ${title} ===`, 'HEADER');
        },
        end: async () => {
            await debugLog(`=== ${title} Complete ===\n`, 'HEADER');
        }
    };
}

export default {
    initDebugMode,
    debugLog,
    createSection
};
