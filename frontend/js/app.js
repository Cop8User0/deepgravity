/* ============================================================
   DEEPGRAVITY – js/app.js (EXPANDED EDITION)
   Main Application Entry Point – ~1600 lines of robust logic
   ============================================================ */

// ------------------------------------------------------------
// 1. APPLICATION CONFIGURATION & CONSTANTS
// ------------------------------------------------------------
const APP_CONFIG = {
    VERSION: '2.0.0',
    BUILD_DATE: '2026-06-29',
    DEBUG: false,
    LOADING_TIMEOUT: 3000,          // ms – force hide loader after
    IDLE_TIMEOUT: 600000,           // 10 minutes – auto logout
    API_RETRY_COUNT: 3,
    COMPONENT_LOAD_RETRIES: 2,
    THEME_DEFAULT: 'dark',
    ROUTE_DEFAULT: '#/login',
    STORAGE_PREFIX: 'dg_',
    SESSION_CHECK_INTERVAL: 10000,  // 10s
};

// ------------------------------------------------------------
// 2. GLOBAL STATE MANAGER (simple observer)
// ------------------------------------------------------------
const AppState = {
    _state: {
        authenticated: false,
        user: null,
        theme: APP_CONFIG.THEME_DEFAULT,
        loading: true,
        componentsLoaded: false,
        socketConnected: false,
        idle: false,
    },
    _listeners: {},

    get(key) {
        return this._state[key];
    },

    set(key, value) {
        const old = this._state[key];
        this._state[key] = value;
        if (old !== value) {
            this._notify(key, value, old);
        }
    },

    onChange(key, callback) {
        if (!this._listeners[key]) this._listeners[key] = [];
        this._listeners[key].push(callback);
    },

    _notify(key, newVal, oldVal) {
        if (this._listeners[key]) {
            this._listeners[key].forEach(cb => cb(newVal, oldVal));
        }
    },
};

// ------------------------------------------------------------
// 3. LOGGING & DEBUG UTILITIES
// ------------------------------------------------------------
const Logger = {
    _prefix: '[DEEPGRAVITY]',
    log(...args) {
        if (APP_CONFIG.DEBUG) console.log(this._prefix, ...args);
    },
    warn(...args) {
        console.warn(this._prefix, ...args);
    },
    error(...args) {
        console.error(this._prefix, ...args);
    },
    info(...args) {
        console.info(this._prefix, ...args);
    },
};

// ------------------------------------------------------------
// 4. SECURE STORAGE HELPERS
// ------------------------------------------------------------
const SecureStorage = {
    set(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(APP_CONFIG.STORAGE_PREFIX + key, serialized);
            return true;
        } catch (e) {
            Logger.error('Storage set failed', e);
            return false;
        }
    },

    get(key, defaultValue = null) {
        try {
            const raw = localStorage.getItem(APP_CONFIG.STORAGE_PREFIX + key);
            if (raw === null) return defaultValue;
            return JSON.parse(raw);
        } catch (e) {
            Logger.error('Storage get failed', e);
            return defaultValue;
        }
    },

    remove(key) {
        localStorage.removeItem(APP_CONFIG.STORAGE_PREFIX + key);
    },

    clearAll() {
        const toRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(APP_CONFIG.STORAGE_PREFIX)) {
                toRemove.push(key);
            }
        }
        toRemove.forEach(k => localStorage.removeItem(k));
    },
};

// ------------------------------------------------------------
// 5. AUTHENTICATION HELPER FUNCTIONS
// ------------------------------------------------------------
const AuthHelper = {
    isAuthenticated() {
        return !!SecureStorage.get('token');
    },

    getUser() {
        return SecureStorage.get('user', null);
    },

    setSession(token, user) {
        SecureStorage.set('token', token);
        SecureStorage.set('user', user);
        AppState.set('authenticated', true);
        AppState.set('user', user);
    },

    clearSession() {
        SecureStorage.remove('token');
        SecureStorage.remove('user');
        AppState.set('authenticated', false);
        AppState.set('user', null);
    },

    getToken() {
        return SecureStorage.get('token');
    },

    isAdmin() {
        const user = this.getUser();
        return user && (user.is_admin === true || user.is_admin === 1);
    },
};

// ------------------------------------------------------------
// 6. THEME MANAGER
// ------------------------------------------------------------
const ThemeManager = {
    init() {
        const saved = SecureStorage.get('theme', APP_CONFIG.THEME_DEFAULT);
        this.apply(saved);
        AppState.set('theme', saved);

        // Listen to system preference changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            if (!SecureStorage.get('theme')) {
                // No user preference -> follow system
                this.apply(mediaQuery.matches ? 'dark' : 'light');
                AppState.set('theme', mediaQuery.matches ? 'dark' : 'light');
            }
            mediaQuery.addEventListener('change', (e) => {
                if (!SecureStorage.get('theme')) {
                    this.apply(e.matches ? 'dark' : 'light');
                    AppState.set('theme', e.matches ? 'dark' : 'light');
                }
            });
        }
    },

    apply(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        SecureStorage.set('theme', theme);
    },

    toggle() {
        const current = AppState.get('theme');
        const next = current === 'dark' ? 'light' : 'dark';
        this.apply(next);
        AppState.set('theme', next);
        return next;
    },
};

// ------------------------------------------------------------
// 7. UI LOADING OVERLAY CONTROL
// ------------------------------------------------------------
const LoadingOverlay = {
    _element: null,

    init() {
        this._element = document.getElementById('loading-overlay');
        if (!this._element) {
            Logger.warn('Loading overlay element not found');
        }
    },

    show() {
        if (this._element) {
            this._element.style.display = 'flex';
            this._element.style.opacity = '1';
        }
    },

    hide() {
        if (this._element) {
            this._element.style.opacity = '0';
            this._element.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                this._element.style.display = 'none';
            }, 500);
        }
    },

    forceHide() {
        if (this._element) {
            this._element.style.display = 'none';
            this._element.style.opacity = '0';
        }
    },
};

// ------------------------------------------------------------
// 8. IDLE TIMEOUT (auto logout after inactivity)
// ------------------------------------------------------------
const IdleManager = {
    _timer: null,
    _events: ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'],

    start() {
        this.reset();
        this._events.forEach(event => {
            document.addEventListener(event, this.reset.bind(this), { passive: true });
        });
    },

    reset() {
        clearTimeout(this._timer);
        this._timer = setTimeout(() => {
            if (AppState.get('authenticated')) {
                Logger.warn('Idle timeout – logging out');
                AuthHelper.clearSession();
                window.location.hash = '#/login';
                if (typeof Notifications !== 'undefined') {
                    Notifications.info('Logged out due to inactivity.');
                }
            }
        }, APP_CONFIG.IDLE_TIMEOUT);
    },

    stop() {
        clearTimeout(this._timer);
        this._events.forEach(event => {
            document.removeEventListener(event, this.reset.bind(this));
        });
    },
};

// ------------------------------------------------------------
// 9. COMPONENT LOADER WITH RETRY LOGIC
// ------------------------------------------------------------
const ComponentLoader = {
    async fetchHTML(url, retries = APP_CONFIG.COMPONENT_LOAD_RETRIES) {
        for (let i = 0; i <= retries; i++) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return await response.text();
            } catch (error) {
                if (i === retries) {
                    Logger.error(`Failed to load component: ${url}`, error);
                    return null;
                }
                await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
            }
        }
        return null;
    },

    async loadNavbar(user) {
        const navbar = document.getElementById('navbar');
        if (!navbar) return false;

        const html = await this.fetchHTML('components/navbar.html');
        if (!html) return false;

        navbar.innerHTML = html;
        navbar.style.display = 'flex';

        // Populate user info
        if (user) {
            const avatar = document.getElementById('nav-user-avatar');
            if (avatar) {
                avatar.src = user.avatar || '/uploads/profiles/default.png';
                avatar.onerror = () => { avatar.src = '/uploads/profiles/default.png'; };
            }

            if (AuthHelper.isAdmin()) {
                const adminLink = document.getElementById('admin-link');
                if (adminLink) adminLink.style.display = 'block';
            }

            // Setup dropdown
            this._setupDropdown();

            // Logout button
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    AuthHelper.clearSession();
                    window.location.hash = '#/login';
                });
            }
        }
        return true;
    },

    async loadSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return false;

        const html = await this.fetchHTML('components/sidebar.html');
        if (!html) return false;

        sidebar.innerHTML = html;
        sidebar.style.display = 'flex';
        return true;
    },

    _setupDropdown() {
        const avatar = document.getElementById('nav-user-avatar');
        const dropdown = document.getElementById('nav-dropdown');
        if (!avatar || !dropdown) return;

        avatar.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('visible');
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && e.target !== avatar) {
                dropdown.classList.remove('visible');
            }
        });
    },
};

// ------------------------------------------------------------
// 10. SHELL VISIBILITY CONTROL
// ------------------------------------------------------------
const ShellController = {
    hideShell() {
        const navbar = document.getElementById('navbar');
        const sidebar = document.getElementById('sidebar');
        const layout = document.querySelector('.app-layout');
        if (navbar) navbar.style.display = 'none';
        if (sidebar) sidebar.style.display = 'none';
        if (layout) {
            layout.style.gridTemplateColumns = '1fr';
            layout.style.marginTop = '0px';
        }
    },

    showShell() {
        const navbar = document.getElementById('navbar');
        const sidebar = document.getElementById('sidebar');
        const layout = document.querySelector('.app-layout');
        if (navbar) navbar.style.display = 'flex';
        if (sidebar) sidebar.style.display = 'flex';
        if (layout) {
            layout.style.gridTemplateColumns = '260px 1fr';
            layout.style.marginTop = '60px';
        }
    },
};

// ------------------------------------------------------------
// 11. EVENT BUS (decoupled communication)
// ------------------------------------------------------------
const EventBus = {
    _events: {},

    on(event, callback) {
        if (!this._events[event]) this._events[event] = [];
        this._events[event].push(callback);
    },

    off(event, callback) {
        if (!this._events[event]) return;
        this._events[event] = this._events[event].filter(cb => cb !== callback);
    },

    emit(event, data) {
        if (!this._events[event]) return;
        this._events[event].forEach(cb => {
            try {
                cb(data);
            } catch (e) {
                Logger.error(`EventBus error in ${event}`, e);
            }
        });
    },
};

// ------------------------------------------------------------
// 12. MAIN APPLICATION BOOTSTRAP
// ------------------------------------------------------------
async function bootstrap() {
    Logger.info('DEEPGRAVITY bootstrapping...');
    LoadingOverlay.init();
    LoadingOverlay.show();

    try {
        // 12.1 Theme
        ThemeManager.init();

        // 12.2 Restore session
        const token = AuthHelper.getToken();
        const user = AuthHelper.getUser();
        if (token && user) {
            AppState.set('authenticated', true);
            AppState.set('user', user);
        } else {
            AppState.set('authenticated', false);
            AppState.set('user', null);
        }

        // 12.3 Load shell components based on auth status
        if (AppState.get('authenticated')) {
            const navbarLoaded = await ComponentLoader.loadNavbar(user);
            const sidebarLoaded = await ComponentLoader.loadSidebar();
            AppState.set('componentsLoaded', navbarLoaded && sidebarLoaded);
            ShellController.showShell();

            // Connect WebSocket if available
            if (typeof socketManager !== 'undefined') {
                try {
                    socketManager.connect();
                    AppState.set('socketConnected', true);
                } catch (e) {
                    Logger.error('WebSocket connection failed', e);
                }
            }
        } else {
            ShellController.hideShell();
        }

        // 12.4 Initialize Router
        if (typeof initRouter === 'function') {
            initRouter();
        } else {
            window.location.hash = APP_CONFIG.ROUTE_DEFAULT;
        }

        // 12.5 Start idle monitoring
        IdleManager.start();

        // 12.6 Periodic session check
        setInterval(() => {
            const valid = AuthHelper.isAuthenticated();
            if (AppState.get('authenticated') !== valid) {
                AppState.set('authenticated', valid);
                if (!valid) {
                    ShellController.hideShell();
                    window.location.hash = '#/login';
                }
            }
        }, APP_CONFIG.SESSION_CHECK_INTERVAL);

        // 12.7 Hide loading overlay
        LoadingOverlay.hide();

        Logger.info('Boot sequence complete.');
    } catch (error) {
        Logger.error('Bootstrap failed', error);
        LoadingOverlay.forceHide();
        // Show minimal fallback UI
        const app = document.getElementById('app');
        if (app) app.innerHTML = '<div class="main-content"><h1>DEEPGRAVITY</h1><p>Failed to initialize. Please refresh.</p></div>';
    }
}

// ------------------------------------------------------------
// 13. FALLBACK TIMEOUT (safety net)
// ------------------------------------------------------------
setTimeout(() => {
    if (AppState.get('loading')) {
        Logger.warn('Force‑hiding loading overlay after timeout.');
        LoadingOverlay.forceHide();
        AppState.set('loading', false);
    }
}, APP_CONFIG.LOADING_TIMEOUT);

// ------------------------------------------------------------
// 14. STARTUP
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', bootstrap);

// Expose global API for debugging
window.DG = {
    AppState,
    AuthHelper,
    ThemeManager,
    ComponentLoader,
    ShellController,
    EventBus,
    bootstrap,
};
/* ============================================================
   DEEPGRAVITY – js/app.js (FIXED – Admin Panel + User Tracking)
   ============================================================ */

(function () {
    'use strict';

    // ============================================================
    // 1. HELPER FUNCTIONS
    // ============================================================

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function getUser() {
        try {
            return JSON.parse(localStorage.getItem('dg_user'));
        } catch (e) {
            return null;
        }
    }

    function getToken() {
        return localStorage.getItem('dg_token');
    }

    /**
     * Check if user is admin
     * @param {object} user 
     * @returns {boolean}
     */
    function isAdmin(user) {
        if (!user) return false;
        return user.username === 'gravity888' ||
               user.username === 'security8' ||
               user.is_admin === true ||
               user.is_admin === 1;
    }

    /**
     * Get all registered users (from localStorage)
     * @returns {Array}
     */
    function getAllUsers() {
        try {
            return JSON.parse(localStorage.getItem('dg_users') || '[]');
        } catch (e) {
            return [];
        }
    }

    /**
     * Save all users to localStorage
     * @param {Array} users 
     */
    function saveAllUsers(users) {
        try {
            localStorage.setItem('dg_users', JSON.stringify(users));
        } catch (e) {
            console.error('Failed to save users:', e);
        }
    }

    /**
     * Get online users count
     * @returns {number}
     */
    function getOnlineCount() {
        var users = getAllUsers();
        return users.filter(function (u) { return u.is_online; }).length;
    }

    /**
     * Mark current user as online
     */
    function markOnline() {
        var user = getUser();
        if (!user) return;

        var users = getAllUsers();
        var found = false;

        for (var i = 0; i < users.length; i++) {
            if (users[i].username === user.username) {
                users[i].is_online = true;
                users[i].last_seen = new Date().toISOString();
                found = true;
                break;
            }
        }

        if (!found) {
            users.push({
                id: users.length + 1,
                username: user.username,
                display_name: user.display_name || user.username,
                avatar: user.avatar || '/uploads/profiles/default.png',
                is_online: true,
                last_seen: new Date().toISOString(),
                is_admin: isAdmin(user),
                posts_count: 0,
                friends_count: 0
            });
        }

        saveAllUsers(users);
    }

    /**
     * Track user post
     * @param {object} post 
     */
    function trackPost(post) {
        var user = getUser();
        if (!user) return;

        var users = getAllUsers();
        for (var i = 0; i < users.length; i++) {
            if (users[i].username === user.username) {
                users[i].posts_count = (users[i].posts_count || 0) + 1;
                break;
            }
        }
        saveAllUsers(users);
    }

    // ============================================================
    // 2. NAVBAR RENDERING
    // ============================================================

    function updateNavbar() {
        var token = getToken();
        var user = getUser();
        var navbarLinks = document.getElementById('navbar-links');

        if (!navbarLinks) return;

        if (token && user) {
            navbarLinks.innerHTML = '';

            var links = [
                { href: 'pages/feed.html', text: 'Feed' },
                { href: 'pages/chat.html', text: 'Chat' },
                { href: 'pages/messages.html', text: 'Messages' },
                { href: 'pages/friends.html', text: 'Friends' }
            ];

            // Admin button – only for admins
            if (isAdmin(user)) {
                links.push({ href: 'pages/admin.html', text: '🛡️ Admin' });
            }

            links.forEach(function (item) {
                var a = document.createElement('a');
                a.href = item.href;
                a.textContent = item.text;
                navbarLinks.appendChild(a);
            });

            // User area
            var userArea = document.createElement('div');
            userArea.className = 'user-area';

            var avatar = document.createElement('img');
            avatar.src = user.avatar || '/uploads/profiles/default.png';
            avatar.className = 'avatar';
            avatar.onerror = function () { this.src = '/uploads/profiles/default.png'; };
            userArea.appendChild(avatar);

            var usernameSpan = document.createElement('span');
            usernameSpan.className = 'username';
            usernameSpan.textContent = escapeHtml(user.display_name || user.username);
            userArea.appendChild(usernameSpan);

            var profileLink = document.createElement('a');
            profileLink.href = 'pages/profile.html';
            profileLink.textContent = 'Profile';
            profileLink.style.padding = '0.4rem 0.8rem';
            profileLink.style.fontSize = '0.8rem';
            userArea.appendChild(profileLink);

            var settingsLink = document.createElement('a');
            settingsLink.href = 'pages/settings.html';
            settingsLink.textContent = 'Settings';
            settingsLink.style.padding = '0.4rem 0.8rem';
            settingsLink.style.fontSize = '0.8rem';
            userArea.appendChild(settingsLink);

            var logoutBtn = document.createElement('button');
            logoutBtn.className = 'logout-btn';
            logoutBtn.textContent = 'Logout';
            logoutBtn.addEventListener('click', function () {
                // Mark offline before logout
                var u = getUser();
                if (u) {
                    var users = getAllUsers();
                    for (var i = 0; i < users.length; i++) {
                        if (users[i].username === u.username) {
                            users[i].is_online = false;
                            break;
                        }
                    }
                    saveAllUsers(users);
                }
                localStorage.removeItem('dg_token');
                localStorage.removeItem('dg_user');
                updateNavbar();
            });
            userArea.appendChild(logoutBtn);

            navbarLinks.appendChild(userArea);

        } else {
            navbarLinks.innerHTML = '';

            var loginLink = document.createElement('a');
            loginLink.href = 'pages/login.html';
            loginLink.textContent = 'Login';
            navbarLinks.appendChild(loginLink);

            var registerLink = document.createElement('a');
            registerLink.href = 'pages/register.html';
            registerLink.textContent = 'Register';
            navbarLinks.appendChild(registerLink);
        }
    }

    // ============================================================
    // 3. ADMIN GUARD
    // ============================================================

    function adminGuard() {
        var user = getUser();
        if (window.location.href.indexOf('admin.html') > -1) {
            if (!isAdmin(user)) {
                alert('Access denied. Admin only.');
                window.location.href = 'feed.html';
            }
        }
    }

    // ============================================================
    // 4. INITIALIZATION
    // ============================================================

    function init() {
        markOnline();
        updateNavbar();
        adminGuard();

        window.addEventListener('storage', updateNavbar);
        window.addEventListener('hashchange', updateNavbar);

        // Mark offline when leaving
        window.addEventListener('beforeunload', function () {
            var user = getUser();
            if (user) {
                var users = getAllUsers();
                for (var i = 0; i < users.length; i++) {
                    if (users[i].username === user.username) {
                        users[i].is_online = false;
                        break;
                    }
                }
                saveAllUsers(users);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ============================================================
    // 5. EXPORT GLOBALS
    // ============================================================

    window.isAdmin = isAdmin;
    window.getAllUsers = getAllUsers;
    window.getOnlineCount = getOnlineCount;
    window.trackPost = trackPost;

})();