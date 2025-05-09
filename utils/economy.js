/**
 * Economy utility module for managing user balances.
 * In-memory store; replace with a database for production.
 */

const store = {}; // { userId: { wallet: Number, bank: Number, lastDaily: Number } }

function getUser(userId) {
    if (!store[userId]) {
        store[userId] = { wallet: 0, bank: 0, lastDaily: 0 };
    }
    return store[userId];
}

function setUser(userId, data) {
    store[userId] = data;
}

function addWallet(userId, amount) {
    const user = getUser(userId);
    user.wallet += amount;
    setUser(userId, user);
}

function addBank(userId, amount) {
    const user = getUser(userId);
    user.bank += amount;
    setUser(userId, user);
}

function transferToBank(userId, amount) {
    const user = getUser(userId);
    if (user.wallet >= amount) {
        user.wallet -= amount;
        user.bank += amount;
        setUser(userId, user);
        return true;
    }
    return false;
}

function transferToWallet(userId, amount) {
    const user = getUser(userId);
    if (user.bank >= amount) {
        user.bank -= amount;
        user.wallet += amount;
        setUser(userId, user);
        return true;
    }
    return false;
}

function getAll() {
    return store;
}

module.exports = {
    getUser,
    setUser,
    addWallet,
    addBank,
    transferToBank,
    transferToWallet,
    getAll
};
