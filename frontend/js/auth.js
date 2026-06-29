/* ============================================================
   DEEPGRAVITY – js/auth.js (Core Auth Functions)
   Authentication Manager – Token & User Management
   ============================================================ */

/**
 * Get authentication token from localStorage
 * @returns {string|null}
 */
function getToken() {
    return localStorage.getItem('dg_token');
}

/**
 * Get current user from localStorage
 * @returns {object|null}
 */
function getUser() {
    const userData = localStorage.getItem('dg_user');
    if (!userData) return null;
    
    try {
        return JSON.parse(userData);
    } catch (e) {
        console.error('Failed to parse user data:', e);
        return null;
    }
}

/**
 * Save authentication data
 * @param {string} token - JWT token
 * @param {object} user - User object
 */
function setAuth(token, user) {
    if (token) {
        localStorage.setItem('dg_token', token);
    }
    if (user) {
        localStorage.setItem('dg_user', JSON.stringify(user));
    }
}

/**
 * Clear all authentication data
 */
function clearAuth() {
    localStorage.removeItem('dg_token');
    localStorage.removeItem('dg_user');
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
function isAuthenticated() {
    const token = getToken();
    return !!token && token.length > 0;
}

/**
 * Check if current user is admin
 * @returns {boolean}
 */
function isAdmin() {
    const user = getUser();
    return user && (user.is_admin === 1 || user.is_admin === true);
}

/**
 * Get auth headers for API requests
 * @returns {object}
 */
function getAuthHeaders() {
    const token = getToken();
    return {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
    };
}

/**
 * Validate token (basic check)
 * @returns {boolean}
 */
function isTokenValid() {
    const token = getToken();
    if (!token) return false;
    
    // Simple check – in production, decode JWT and check expiration
    return token.length > 10;
}

/**
 * Refresh user data from server
 * @returns {Promise<object>}
 */
async function refreshUser() {
    try {
        const response = await fetch('/api/auth/me', {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
                setAuth(null, data.data);
                return data.data;
            }
        }
        
        // If unauthorized, clear auth
        if (response.status === 401) {
            clearAuth();
        }
        
        return null;
    } catch (error) {
        console.error('Failed to refresh user:', error);
        return null;
    }
}

/**
 * Check if user has specific clearance level
 * @param {string} level - Required clearance level
 * @returns {boolean}
 */
function hasClearance(level) {
    const user = getUser();
    if (!user) return false;
    
    const levels = ['CL1', 'CL2', 'CL3', 'CL4', 'OMEGA-4', 'OMEGA-5'];
    const userIndex = levels.indexOf(user.clearance || 'CL1');
    const requiredIndex = levels.indexOf(level);
    
    return userIndex >= requiredIndex;
}

// Export to global scope
window.getToken = getToken;
window.getUser = getUser;
window.setAuth = setAuth;
window.clearAuth = clearAuth;
window.isAuthenticated = isAuthenticated;
window.isAdmin = isAdmin;
window.getAuthHeaders = getAuthHeaders;
window.isTokenValid = isTokenValid;
window.refreshUser = refreshUser;
window.hasClearance = hasClearance;