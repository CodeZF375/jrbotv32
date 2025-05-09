const fs = require('fs');
const path = require('path');

// Path to your config file (adjust if needed)
const CONFIG_PATH = path.join(__dirname, '../data/server-config.json');

// Ensure the data directory exists
const DATA_DIR = path.dirname(CONFIG_PATH);
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load the config file or return an empty object if it doesn't exist
function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (err) {
    console.error('[configManager] Failed to parse config:', err);
    return {};
  }
}

// Save the config object to the file
function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}

// Get the config object for a specific guild
function getGuildConfig(guildId) {
  const config = loadConfig();
  return config[guildId] || {};
}

// Set (merge) new settings for a guild
function setGuildConfig(guildId, newSettings) {
  const config = loadConfig();
  config[guildId] = { ...config[guildId], ...newSettings };
  saveConfig(config);
}

// Remove a specific key from a guild's config
function resetGuildConfigKey(guildId, key) {
  const config = loadConfig();
  if (config[guildId]) {
    delete config[guildId][key];
    saveConfig(config);
  }
}

module.exports = {
  getGuildConfig,
  setGuildConfig,
  resetGuildConfigKey,
};