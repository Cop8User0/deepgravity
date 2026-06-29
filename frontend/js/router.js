/* ============================================================
   DEEPGRAVITY – js/router.js
   SPA Hash Router
   ============================================================ */

// Route definitions
const routes = {
    'login': {
        secure: false,
        init: function() {
            if (typeof AuthModule !== 'undefined' && AuthModule.initLoginPage) {
                AuthModule.initLoginPage();
            }
        }
    },
    'register': {
        secure: false,
        init: function() {
            if (typeof AuthModule !== 'undefined' && AuthModule.initRegisterPage) {
                AuthModule.initRegisterPage();
            }
        }
    },
    'feed': {
        secure: true,
        init: function() {
            if (typeof FeedModule !== 'undefined' && FeedModule.init) {
                FeedModule.init();
            }
        }
    },
    'chat': {
        secure: true,
        init: function() {
            if (typeof ChatModule !== 'undefined' && ChatModule.init) {
                ChatModule.init();
            }
        }
    },
    'messages': {
        secure: true,
        init: function() {
            if (typeof MessagesModule !== 'undefined' && MessagesModule.init) {
                MessagesModule.init();
            }
        }
    },
    'profile': {
        secure: true,
        init: function() {
            if (typeof ProfileModule !== 'undefined' && ProfileModule.init) {
                ProfileModule.init();
            }
        }
    },
    'friends': {
        secure: true,
        init: function() {
            if (typeof FriendsModule !== 'undefined' && FriendsModule.init) {
                FriendsModule.init();
            }
        }
    },
    'admin': {
        secure: true,
        adminOnly: true,
        init: function() {
            if (typeof AdminModule !== 'undefined' && AdminModule.init) {
                AdminModule.init();
            }
        }
    },
    'settings': {
        secure: true,
        init: function() {
            if (typeof SettingsModule !== 'undefined' && SettingsModule.init) {
                SettingsModule.init();
            }
        }
    },
    'search': {
        secure: true,
        init: function() {
            console.log('Search page loaded');
        }
    },
    'about': {
        secure: false,
        init: function() {
            console.log('About page loaded');
        }
    }
};

/**
 * Navigate to a specific route
 */
async function navigate() {
    // Get current hash
    const hash = window.location.hash || '#/login';
    const pageName = hash.replace('#/', '').split('?')[0].split('/')[0] || 'login';
    
    // Get route config
    const route = routes[pageName];
    
    // If route not found, show 404
    if (!route) {
        await loadPageContent('404');
        return;
    }
    
    // Auth guard – redirect to login if not authenticated
    if (route.secure && !isAuthenticated()) {
        window.location.hash = '#/login';
        return;
    }
    
    // Admin guard – redirect to feed if not admin
    if (route.adminOnly && !isAdmin()) {
        window.location.hash = '#/feed';
        if (typeof Notifications !== 'undefined') {
            Notifications.warning('Access denied. Admin only.');
        }
        return;
    }
    
    // Redirect authenticated users away from login/register
    if (!route.secure && isAuthenticated() && (pageName === 'login' || pageName === 'register')) {
        window.location.hash = '#/feed';
        return;
    }
    
    // Show/hide shell based on route
    if (route.secure) {
        showShell();
    } else {
        hideShell();
    }
    
    // Load page content
    await loadPageContent(pageName);
    
    // Initialize page module
    if (route.init && typeof route.init === 'function') {
        setTimeout(() => {
            route.init();
        }, 100);
    }
    
    // Update active sidebar link
    updateActiveSidebarLink(pageName);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Load page HTML content
 * @param {string} pageName 
 */
async function loadPageContent(pageName) {
    const container = document.getElementById('app-container');
    if (!container) return;
    
    try {
        // Show loading state
        container.innerHTML = '<div style="text-align:center;padding:3rem;color:#64748b;">Loading...</div>';
        
        // Fetch page HTML
        const response = await fetch(`pages/${pageName}.html`);
        
        if (response.ok) {
            const html = await response.text();
            container.innerHTML = html;
        } else {
            // Fallback for missing pages
            container.innerHTML = `
                <div style="text-align:center;padding:4rem;color:#64748b;">
                    <div style="font-size:4rem;margin-bottom:1rem;">🔧</div>
                    <h2 style="color:#94a3b8;">Page Not Found</h2>
                    <p>The page "${pageName}" could not be loaded.</p>
                    <a href="#/feed" class="btn btn-primary" style="margin-top:1rem;">Go to Feed</a>
                </div>`;
        }
    } catch (error) {
        console.error('Failed to load page:', error);
        container.innerHTML = `
            <div style="text-align:center;padding:4rem;color:#64748b;">
                <div style="font-size:4rem;margin-bottom:1rem;">⚠️</div>
                <h2 style="color:#94a3b8;">Connection Error</h2>
                <p>Failed to load the page. Check your connection.</p>
                <button onclick="window.location.reload()" class="btn btn-primary" style="margin-top:1rem;">Retry</button>
            </div>`;
    }
}

/**
 * Update active link in sidebar
 * @param {string} pageName 
 */
function updateActiveSidebarLink(pageName) {
    // Remove all active classes
    document.querySelectorAll('.sidebar-menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to current page
    const activeItem = document.getElementById(`menu-${pageName}`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

/**
 * Hide shell for non-authenticated pages
 */
function hideShell() {
    const navbar = document.getElementById('navbar');
    const sidebar = document.getElementById('sidebar');
    const layout = document.querySelector('.app-layout');
    
    if (navbar) navbar.style.display = 'none';
    if (sidebar) sidebar.style.display = 'none';
    if (layout) {
        layout.style.gridTemplateColumns = '1fr';
        layout.style.marginTop = '0px';
    }
}

/**
 * Show shell for authenticated pages
 */
function showShell() {
    const navbar = document.getElementById('navbar');
    const sidebar = document.getElementById('sidebar');
    const layout = document.querySelector('.app-layout');
    
    if (navbar) navbar.style.display = 'flex';
    if (sidebar) sidebar.style.display = 'flex';
    if (layout) {
        layout.style.gridTemplateColumns = '260px 1fr';
        layout.style.marginTop = '60px';
    }
}

/**
 * Initialize the router
 */
function initRouter() {
    // Listen for hash changes
    window.addEventListener('hashchange', navigate);
    
    // Navigate to current hash or default
    navigate();
}

// Export globally
window.initRouter = initRouter;
window.navigate = navigate;