const { Low, JSONFile } = require('lowdb');
const path = require('path');

const dbFile = path.join(__dirname, 'economy.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

async function init() {
    await db.read();
    db.data ||= { users: {} };
    await db.write();
}

async function getUser(userId) {
    await init();
    if (!db.data.users[userId]) {
        db.data.users[userId] = { wallet: 0, bank: 0, lastDaily: 0 };
        await db.write();
    }
    return db.data.users[userId];
}

async function setUser(userId, userData) {
    await init();
    db.data.users[userId] = userData;
    await db.write();
}

module.exports = { getUser, setUser };