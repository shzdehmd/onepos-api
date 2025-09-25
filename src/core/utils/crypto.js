const crypto = require('crypto');

// This secret key must be a 32-byte (256-bit) string and must be the same one
// used to encrypt the data in the first place. Store it securely in .env.
const ENCRYPTION_KEY = process.env.CRYPTO_SECRET_KEY;
const ALGORITHM = 'aes-256-gcm';

/**
 * Decrypts data that was encrypted using AES-256-GCM.
 * @param {object} hash - An object with iv, content, and authTag properties.
 * @returns {string} The decrypted string.
 */
const decrypt = (hash) => {
    if (!ENCRYPTION_KEY) {
        throw new Error('CRYPTO_SECRET_KEY is not defined in the environment variables.');
    }
    if (!hash || !hash.iv || !hash.content || !hash.authTag) {
        throw new Error('Invalid hash object for decryption.');
    }

    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        Buffer.from(ENCRYPTION_KEY, 'hex'),
        Buffer.from(hash.iv, 'hex'),
    );

    decipher.setAuthTag(Buffer.from(hash.authTag, 'hex'));

    let decrypted = decipher.update(hash.content, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
};

module.exports = { decrypt };
