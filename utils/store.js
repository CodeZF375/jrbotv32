/**
 * In-memory store for shop items.
 * Replace with a database for production.
 */

const shop = []; // { name: string, price: number }

function getShop() {
    return shop;
}

function addItem(item) {
    shop.push(item);
}

function removeItem(name) {
    const index = shop.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
    if (index !== -1) {
        shop.splice(index, 1);
        return true;
    }
    return false;
}

module.exports = {
    getShop,
    addItem,
    removeItem
};