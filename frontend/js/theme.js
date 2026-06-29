/* ============================================================
   DEEPGRAVITY – js/theme.js
   Theme Manager (Dark/Light Mode)
   ============================================================ */

/**
 * Get current theme
 * @returns {string} 'dark' or 'light'
 */
function getTheme() {
    return localStorage.getItem('dg_theme') || 'dark';
}

/**
 * Set theme
 * @param {string} theme - 'dark' or 'light'
 */
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dg_theme', theme);
    
    // Update theme toggle if it exists
    const toggle = document.getElementById('settings-theme-toggle');
    if (toggle) {
        toggle.checked = theme === 'dark';
    }
}

/**
 * Toggle between dark and light theme
 * @returns {string} The new theme
 */
function toggleTheme() {
    const current = getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
    
    if (typeof Notifications !== 'undefined') {
        Notifications.info(`Theme switched to ${next} mode.`);
    }
    
    return next;
}

/**
 * Initialize theme on page load
 */
function initTheme() {
    const theme = getTheme();
    setTheme(theme);
    console.log(`Theme initialized: ${theme}`);
    
    // Listen for system theme changes
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem('dg_theme')) {
            setTheme(mediaQuery.matches ? 'dark' : 'light');
        }
        
        // Listen for changes
        mediaQuery.addEventListener('change', (e) => {
            if (!localStorage.getItem('dg_theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
}

// Export globally
window.getTheme = getTheme;
window.setTheme = setTheme;
window.toggleTheme = toggleTheme;
window.initTheme = initTheme;