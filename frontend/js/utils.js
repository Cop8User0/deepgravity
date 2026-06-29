/* ============================================================
   DEEPGRAVITY – js/utils.js
   Utility Functions
   ============================================================ */

/**
 * Format a date string into a human-readable relative time
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted time
 */
function formatDate(dateStr) {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // Difference in seconds
    
    if (isNaN(diff)) return dateStr;
    
    if (diff < 5) return 'Just now';
    if (diff < 60) return `${diff} seconds ago`;
    
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
    
    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
}

/**
 * Sanitize HTML string to prevent XSS
 * @param {string} str - Potentially unsafe string
 * @returns {string} Sanitized string
 */
function sanitizeHTML(str) {
    if (!str) return '';
    
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Create an HTML element
 * @param {string} tag - HTML tag name
 * @param {string} className - CSS class name
 * @param {string} innerHTML - Inner HTML content
 * @returns {HTMLElement}
 */
function createElement(tag, className = '', innerHTML = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (innerHTML) el.innerHTML = innerHTML;
    return el;
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<void>}
 */
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
        return true;
    } catch (error) {
        console.error('Failed to copy:', error);
        return false;
    }
}

/**
 * Debounce a function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function}
 */
function debounce(fn, delay = 300) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * Throttle a function
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function}
 */
function throttle(fn, limit = 300) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Generate a random ID
 * @param {number} length - Length of ID
 * @returns {string}
 */
function generateId(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result + Date.now().toString(36);
}

/**
 * Format file size
 * @param {number} bytes 
 * @returns {string}
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Truncate text with ellipsis
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
function truncate(text, maxLength = 50) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Get URL parameter by name
 * @param {string} name 
 * @returns {string|null}
 */
function getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

/**
 * Check if device is mobile
 * @returns {boolean}
 */
function isMobile() {
    return window.innerWidth < 768;
}

/**
 * Check if device is touch-enabled
 * @returns {boolean}
 */
function isTouchDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}

// Export globally
window.formatDate = formatDate;
window.sanitizeHTML = sanitizeHTML;
window.createElement = createElement;
window.copyToClipboard = copyToClipboard;
window.debounce = debounce;
window.throttle = throttle;
window.generateId = generateId;
window.formatFileSize = formatFileSize;
window.truncate = truncate;
window.getUrlParam = getUrlParam;
window.isMobile = isMobile;
window.isTouchDevice = isTouchDevice;