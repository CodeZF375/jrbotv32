const fs = require('fs');
const path = require('path');

/**
 * Safely reads and parses a JSON file.
 * @param {string} filePath - Path to the JSON file.
 * @param {any} defaultValue - Value to return if file is missing or invalid.
 * @returns {any} Parsed JSON or defaultValue.
 */
function safeJsonRead(filePath, defaultValue = []) {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
            return defaultValue;
        }
        const data = fs.readFileSync(filePath, 'utf8');
        if (!data.trim()) {
            // File is empty
            fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
            return defaultValue;
        }
        return JSON.parse(data);
    } catch (err) {
        // If JSON is invalid, reset file and return default
        fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
        return defaultValue;
    }
}

module.exports = safeJsonRead;