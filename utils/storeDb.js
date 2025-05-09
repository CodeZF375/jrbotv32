const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '../data/store.json');

function readStore() {
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify([]), 'utf8');
  }
  const data = fs.readFileSync(STORE_PATH, 'utf8');
  return JSON.parse(data);
}

function writeStore(items) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(items, null, 2), 'utf8');
}

function getStoreItems() {
  return readStore();
}

function addStoreItem(name, price) {
  const items = readStore();
  if (items.find(item => item.name.toLowerCase() === name.toLowerCase())) {
    return false; // Already exists
  }
  items.push({ name, price });
  writeStore(items);
  return true;
}

function removeStoreItem(name) {
  let items = readStore();
  const initialLength = items.length;
  items = items.filter(item => item.name.toLowerCase() !== name.toLowerCase());
  writeStore(items);
  return items.length < initialLength;
}

module.exports = {
  getStoreItems,
  addStoreItem,
  removeStoreItem,
};