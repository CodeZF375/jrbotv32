
const fs = require('fs');
const path = require('path');

const debugFile = path.join(__dirname, '..', 'debug.json');

/**
 * Logs debug messages and error details to debug.json
 * @param {string} message - The log message
 * @param {object} data - Additional data or error object
 */
function logDebug(message, data = {}) {
    const entry = {
        timestamp: new Date().toISOString(),
        message,
        ...(
            data instanceof Error
                ? {
                    errorMessage: data.message,
                    errorStack: data.stack,
                    errorCode: data.code,
                    errorSyscall: data.syscall,
                    errorErrno: data.errno
                }
                : data
        )
    };
    let logs = [];
    if (fs.existsSync(debugFile)) {
        try {
            logs = JSON.parse(fs.readFileSync(debugFile, 'utf8'));
        } catch {
            logs = [];
        }
    }
    logs.push(entry);
    fs.writeFileSync(debugFile, JSON.stringify(logs, null, 2));
}

module.exports = { logDebug };
