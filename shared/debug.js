let debugMode = false; // Flag to indicate if debug mode is enabled

const LOG_LEVELS = {
    DEBUG: { prefix: '\x1b[37m', color: '\x1b[37;1m' },  // Bright White
    INFO: { prefix: 'ℹ️', color: '\x1b[36;1m' },   // Bright Cyan
    SUCCESS: { prefix: '✅', color: '\x1b[32;1m' }, // Bright Green
    WARN: { prefix: '⚠️', color: '\x1b[33;1m' },   // Bright Yellow
    ERROR: { prefix: '❌', color: '\x1b[31;1m' },    // Bright Red
    HEADER: { prefix: '' , color: '\x1b[35;1m' },  // Bright Magenta
    SUBHEADER: { prefix: '' , color: '\x1b[34;1m' },  // Bright Blue
};

const RESET_COLOR = '\x1b[0m'; // Reset color for console output

/**
 * Initializes debug mode based on command line arguments.
 */
export function initDebugMode() {
    const argv = process.argv.slice(2);
    debugMode = argv.includes('--debug') || argv.includes('-d'); // Enable debug mode if specified
}

/**
 * Logs a message to the console with the specified log level.
 * @param {string|Object} message - The message to log.
 * @param {string} level - The log level (DEBUG, INFO, SUCCESS, WARN, ERROR).
 */
export async function debugLog(message, level = 'DEBUG') {
    if (!debugMode && level === 'DEBUG') return; // Skip debug messages if debug mode is off

    const logLevel = typeof level === 'string' ? level.toUpperCase() : 'DEBUG';
    const logConfig = LOG_LEVELS[logLevel] || LOG_LEVELS.DEBUG;
    
    let formattedMessage = typeof message === 'object' ? 
        JSON.stringify(message, null, 2) : message;

    // Use magenta for section headers
    const isSectionHeader = formattedMessage.startsWith('---') || formattedMessage.startsWith('===');
    const messageColor = isSectionHeader ? '\x1b[35m' : logConfig.color;

    // Don't add prefix for continuation lines (indented messages) or section headers
    if (!formattedMessage.startsWith('   ') && !isSectionHeader) {
        formattedMessage = `${logConfig.prefix} ${formattedMessage}`;
    }

    console.log(`${messageColor}${formattedMessage}${RESET_COLOR}`); // Log the formatted message
}

/**
 * Creates a section logger for starting and ending sections in logs.
 * @param {string} title - The title of the section.
 * @returns {Object} - An object with start and end methods for logging.
 */
export function createSection(title) {
    return {
        start: async () => {
            await debugLog(`\n=== ${title} ===`, 'HEADER'); // Log the start of the section
        },
        end: async () => {
            await debugLog(`=== ${title} Complete ===\n`, 'HEADER'); // Log the end of the section
        }
    };
}

export default {
    initDebugMode,
    debugLog,
    createSection
};
