const crypto = require('crypto');

function generateToken() {
    return crypto.randomBytes(64).toString('hex');
}

module.exports = generateToken;
