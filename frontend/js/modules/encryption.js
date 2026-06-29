/* ============================================================
   DEEPGRAVITY – js/modules/encryption.js
   Client-Side Encryption Module
   ============================================================ */

const EncryptionModule = {
    
    // Default encryption key
    defaultKey: 'DeepGravitySecretKey2026',
    
    /**
     * Initialize encryption module
     */
    init() {
        console.log('Encryption module initialized');
    },
    
    /**
     * Encrypt text using XOR + Base64
     * @param {string} text - Plain text to encrypt
     * @param {string} key - Encryption key (optional, uses default)
     * @returns {string} Encrypted text (Base64)
     */
    encrypt(text, key = null) {
        if (!text) return '';
        
        const encryptionKey = key || this.defaultKey;
        const keyBytes = this._stringToBytes(encryptionKey);
        const textBytes = this._stringToBytes(text);
        
        // XOR each byte
        const xorBytes = [];
        for (let i = 0; i < textBytes.length; i++) {
            xorBytes.push(textBytes[i] ^ keyBytes[i % keyBytes.length]);
        }
        
        // Convert to Base64
        return this._bytesToBase64(xorBytes);
    },
    
    /**
     * Decrypt text using XOR + Base64
     * @param {string} encryptedText - Base64 encrypted text
     * @param {string} key - Encryption key (optional, uses default)
     * @returns {string} Decrypted text
     */
    decrypt(encryptedText, key = null) {
        if (!encryptedText) return '';
        
        try {
            const encryptionKey = key || this.defaultKey;
            const keyBytes = this._stringToBytes(encryptionKey);
            
            // Decode from Base64
            const xorBytes = this._base64ToBytes(encryptedText);
            
            // XOR each byte
            const resultBytes = [];
            for (let i = 0; i < xorBytes.length; i++) {
                resultBytes.push(xorBytes[i] ^ keyBytes[i % keyBytes.length]);
            }
            
            // Convert back to string
            return this._bytesToString(resultBytes);
        } catch (error) {
            console.error('Decryption failed:', error);
            return encryptedText; // Return original if decryption fails
        }
    },
    
    /**
     * Encrypt using Base64 only (simple encoding)
     * @param {string} text 
     * @returns {string}
     */
    base64Encode(text) {
        try {
            return btoa(unescape(encodeURIComponent(text)));
        } catch (e) {
            return btoa(text);
        }
    },
    
    /**
     * Decrypt from Base64
     * @param {string} encoded 
     * @returns {string}
     */
    base64Decode(encoded) {
        try {
            return decodeURIComponent(escape(atob(encoded)));
        } catch (e) {
            return atob(encoded);
        }
    },
    
    /**
     * ROT13 cipher
     * @param {string} text 
     * @returns {string}
     */
    rot13(text) {
        return text.replace(/[a-zA-Z]/g, function(c) {
            return String.fromCharCode(
                (c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26
            );
        });
    },
    
    /**
     * Hex encode
     * @param {string} text 
     * @returns {string}
     */
    hexEncode(text) {
        let hex = '';
        for (let i = 0; i < text.length; i++) {
            hex += text.charCodeAt(i).toString(16).padStart(2, '0');
        }
        return hex;
    },
    
    /**
     * Hex decode
     * @param {string} hex 
     * @returns {string}
     */
    hexDecode(hex) {
        try {
            let str = '';
            for (let i = 0; i < hex.length; i += 2) {
                str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
            }
            return str;
        } catch (e) {
            return hex;
        }
    },
    
    /**
     * Generate a random encryption key
     * @param {number} length 
     * @returns {string}
     */
    generateKey(length = 16) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        let key = '';
        for (let i = 0; i < length; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return key;
    },
    
    /**
     * Generate a random passkey (6 digits)
     * @returns {string}
     */
    generatePasskey() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    },
    
    /**
     * Hash text using simple algorithm (not cryptographically secure)
     * @param {string} text 
     * @returns {string}
     */
    simpleHash(text) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return Math.abs(hash).toString(16).padStart(8, '0');
    },
    
    /**
     * Convert string to byte array
     * @param {string} str 
     * @returns {number[]}
     */
    _stringToBytes(str) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            const code = str.charCodeAt(i);
            if (code < 128) {
                bytes.push(code);
            } else if (code < 2048) {
                bytes.push(192 | (code >> 6));
                bytes.push(128 | (code & 63));
            } else {
                bytes.push(224 | (code >> 12));
                bytes.push(128 | ((code >> 6) & 63));
                bytes.push(128 | (code & 63));
            }
        }
        return bytes;
    },
    
    /**
     * Convert byte array to string
     * @param {number[]} bytes 
     * @returns {string}
     */
    _bytesToString(bytes) {
        let str = '';
        let i = 0;
        while (i < bytes.length) {
            const byte1 = bytes[i++];
            if (byte1 < 128) {
                str += String.fromCharCode(byte1);
            } else if (byte1 >= 192 && byte1 < 224) {
                const byte2 = bytes[i++];
                str += String.fromCharCode(((byte1 & 31) << 6) | (byte2 & 63));
            } else {
                const byte2 = bytes[i++];
                const byte3 = bytes[i++];
                str += String.fromCharCode(((byte1 & 15) << 12) | ((byte2 & 63) << 6) | (byte3 & 63));
            }
        }
        return str;
    },
    
    /**
     * Convert byte array to Base64 string
     * @param {number[]} bytes 
     * @returns {string}
     */
    _bytesToBase64(bytes) {
        const binary = String.fromCharCode.apply(null, bytes);
        return btoa(binary);
    },
    
    /**
     * Convert Base64 string to byte array
     * @param {string} base64 
     * @returns {number[]}
     */
    _base64ToBytes(base64) {
        const binary = atob(base64);
        const bytes = [];
        for (let i = 0; i < binary.length; i++) {
            bytes.push(binary.charCodeAt(i));
        }
        return bytes;
    }
};

// Export globally
window.EncryptionModule = EncryptionModule;