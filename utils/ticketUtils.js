const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../config/ticket-config.json');

function loadConfig() {
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function saveConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function formatDM(template, data) {
  return template.replace(/{(\w+)}/g, (_, key) => data[key] || '');
}

module.exports = {
  loadConfig,
  saveConfig,
  formatDM
};