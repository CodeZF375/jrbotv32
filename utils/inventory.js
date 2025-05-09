/**
 * In-memory inventory for users.
 * Replace with a database for production.
 */

const inventories = {}; // { userId: { itemName: quantity, ... } }

function getInventory(userId) {
    if (!inventories[userId]) inventories[userId] = {};
    return inventories[userId];
}

function addItem(userId, itemName, quantity = 1) {
    const inv = getInventory(userId);
    inv[itemName] = (inv[itemName] || 0) + quantity;
}

function removeItem(userId, itemName, quantity = 1) {
    const inv = getInventory(userId);
    if (!inv[itemName] || inv[itemName] < quantity) return false;
    inv[itemName] -= quantity;
    if (inv[itemName] <= 0) delete inv[itemName];
    return true;
}

function hasItem(userId, itemName, quantity = 1) {
    const inv = getInventory(userId);
    return inv[itemName] && inv[itemName] >= quantity;
}

module.exports = {
    getInventory,
    addItem,
    removeItem,
    hasItem
};