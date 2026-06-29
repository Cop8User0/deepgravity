/* ============================================================
   DEEPGRAVITY – js/modules/settings.js
   Settings Module (Profile, Password, Theme, Danger Zone)
   ============================================================ */

const SettingsModule = {
    
    // Current state
    state: {
        loading: false,
        theme: 'dark'
    },
    
    /**
     * Initialize settings page
     */
    init() {
        console.log('Settings module initialized');
        this.loadCurrentSettings();
        this.bindEvents();
    },
    
    /**
     * Load current user settings
     */
    loadCurrentSettings() {
        // Load display name and bio
        if (Auth.currentUser) {
            const displayNameEl = document.getElementById('settings-display-name');
            const bioEl = document.getElementById('settings-bio');
            
            if (displayNameEl) displayNameEl.value = Auth.currentUser.display_name || '';
            if (bioEl) bioEl.value = Auth.currentUser.bio || '';
        }
        
        // Load theme preference
        const savedTheme = localStorage.getItem('dg_theme') || 'dark';
        this.state.theme = savedTheme;
        
        const themeToggle = document.getElementById('settings-theme-toggle');
        if (themeToggle) {
            themeToggle.checked = savedTheme === 'dark';
        }
    },
    
    /**
     * Save profile settings
     */
    saveProfile() {
        const displayName = document.getElementById('settings-display-name')?.value?.trim();
        const bio = document.getElementById('settings-bio')?.value?.trim();
        
        if (!displayName) {
            this._showMessage('display-name-error', 'Display name cannot be empty.', 'error');
            return;
        }
        
        // Update Auth
        if (Auth.currentUser) {
            Auth.currentUser.display_name = displayName;
            Auth.currentUser.bio = bio || '';
            localStorage.setItem('dg_user', JSON.stringify(Auth.currentUser));
        }
        
        if (window.Notifications) {
            Notifications.success('Profile saved successfully!');
        }
    },
    
    /**
     * Change password
     */
    changePassword() {
        const oldPassword = document.getElementById('settings-old-password')?.value;
        const newPassword = document.getElementById('settings-new-password')?.value;
        
        if (!oldPassword) {
            if (window.Notifications) Notifications.warning('Please enter your current password.');
            return;
        }
        
        if (!newPassword) {
            if (window.Notifications) Notifications.warning('Please enter a new password.');
            return;
        }
        
        if (newPassword.length < 4) {
            if (window.Notifications) Notifications.warning('New password must be at least 4 characters.');
            return;
        }
        
        // Simulate password change
        setTimeout(() => {
            // Clear inputs
            const oldEl = document.getElementById('settings-old-password');
            const newEl = document.getElementById('settings-new-password');
            if (oldEl) oldEl.value = '';
            if (newEl) newEl.value = '';
            
            if (window.Notifications) {
                Notifications.success('Password updated successfully!');
            }
        }, 500);
    },
    
    /**
     * Toggle theme
     * @param {boolean} isDark 
     */
    toggleTheme(isDark) {
        this.state.theme = isDark ? 'dark' : 'light';
        
        // Update HTML attribute
        document.documentElement.setAttribute('data-theme', this.state.theme);
        
        // Save preference
        localStorage.setItem('dg_theme', this.state.theme);
        
        if (window.Notifications) {
            Notifications.info(`Theme changed to ${this.state.theme} mode.`);
        }
    },
    
    /**
     * Delete account
     */
    deleteAccount() {
        // Show confirmation dialog
        const confirmed = confirm(
            '⚠️ Are you absolutely sure?\n\n' +
            'This will permanently delete your account and all associated data:\n' +
            '- All your posts\n' +
            '- All your messages\n' +
            '- All your friends connections\n' +
            '- Your profile\n\n' +
            'This action CANNOT be undone!'
        );
        
        if (!confirmed) return;
        
        // Double confirmation
        const doubleConfirm = prompt('Type "DELETE" to confirm account deletion:');
        
        if (doubleConfirm !== 'DELETE') {
            if (window.Notifications) Notifications.info('Account deletion cancelled.');
            return;
        }
        
        // Simulate deletion
        if (window.Notifications) {
            Notifications.success('Account deleted. Logging out...');
        }
        
        // Clear all data
        setTimeout(() => {
            localStorage.clear();
            sessionStorage.clear();
            
            // Redirect to login
            window.location.hash = '#/login';
            window.location.reload();
        }, 1500);
    },
    
    /**
     * Export user data
     */
    exportData() {
        const data = {
            user: Auth.currentUser,
            posts: JSON.parse(localStorage.getItem('dg_posts') || '[]'),
            theme: localStorage.getItem('dg_theme'),
            export_date: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `deepgravity_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        if (window.Notifications) {
            Notifications.success('Data exported successfully!');
        }
    },
    
    /**
     * Show inline message
     * @param {string} elementId 
     * @param {string} message 
     * @param {string} type 
     */
    _showMessage(elementId, message, type) {
        let el = document.getElementById(elementId);
        
        if (!el) {
            el = document.createElement('p');
            el.id = elementId;
            el.style.cssText = `
                margin-top: 8px;
                font-size: 0.85rem;
                font-weight: 500;
            `;
            
            // Find parent to append
            const input = document.getElementById(elementId.replace('-error', ''));
            if (input && input.parentElement) {
                input.parentElement.appendChild(el);
            }
        }
        
        el.textContent = message;
        el.style.color = type === 'error' ? '#ef4444' : '#10b981';
        
        // Auto clear after 3 seconds
        setTimeout(() => {
            if (el) el.textContent = '';
        }, 3000);
    },
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Save profile form
        const profileForm = document.getElementById('settings-profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }
        
        // Change password form
        const passwordForm = document.getElementById('settings-password-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.changePassword();
            });
        }
        
        // Theme toggle
        const themeToggle = document.getElementById('settings-theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('change', () => {
                this.toggleTheme(themeToggle.checked);
            });
        }
        
        // Delete account button
        const deleteBtn = document.getElementById('delete-account-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.deleteAccount();
            });
        }
        
        // Save profile button (alternative click)
        const saveProfileBtn = document.getElementById('settings-save-profile-btn');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }
        
        // Update password button (alternative click)
        const updatePasswordBtn = document.getElementById('settings-update-password-btn');
        if (updatePasswordBtn) {
            updatePasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.changePassword();
            });
        }
    }
};

// Export globally
window.SettingsModule = SettingsModule;