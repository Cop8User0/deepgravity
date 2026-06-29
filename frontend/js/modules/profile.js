/* ============================================================
   DEEPGRAVITY – js/modules/profile.js (EXTENDED)
   Profile Module – Avatar Upload, Display Name, Bio, Stats
   ============================================================ */

const ProfileModule = {
    
    // ============================================================
    // STATE
    // ============================================================
    state: {
        profile: {
            displayName: 'gravity888',
            bio: 'Deepcore operator. Trading and encryption enthusiast.',
            avatar: '/assets/images/default.png'
        },
        stats: {
            posts: 0,
            friends: 0
        },
        isEditing: false
    },
    
    // ============================================================
    // INITIALIZATION
    // ============================================================
    
    /**
     * Initialize profile module
     */
    init() {
        console.log('Profile module initialized');
        
        this.loadProfile();
        this.loadStats();
        this.updateUI();
        this.bindEvents();
    },
    
    /**
     * Load profile from localStorage
     */
    loadProfile() {
        try {
            const stored = localStorage.getItem('dg_profile');
            if (stored) {
                const parsed = JSON.parse(stored);
                this.state.profile.displayName = parsed.displayName || this.state.profile.displayName;
                this.state.profile.bio = parsed.bio || this.state.profile.bio;
                this.state.profile.avatar = parsed.avatar || this.state.profile.avatar;
            }
            
            // Also check global user object
            const user = JSON.parse(localStorage.getItem('dg_user') || '{}');
            if (user.avatar) this.state.profile.avatar = user.avatar;
            if (user.display_name) this.state.profile.displayName = user.display_name;
            if (user.bio) this.state.profile.bio = user.bio;
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    },
    
    /**
     * Load stats from localStorage
     */
    loadStats() {
        try {
            const posts = JSON.parse(localStorage.getItem('dg_posts') || '[]');
            this.state.stats.posts = posts.length;
            
            const friends = JSON.parse(localStorage.getItem('dg_friends') || '[]');
            this.state.stats.friends = friends.length;
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    },
    
    /**
     * Save profile to localStorage
     */
    saveProfile() {
        try {
            localStorage.setItem('dg_profile', JSON.stringify(this.state.profile));
            
            // Also update global user object
            const user = JSON.parse(localStorage.getItem('dg_user') || '{}');
            user.avatar = this.state.profile.avatar;
            user.display_name = this.state.profile.displayName;
            user.bio = this.state.profile.bio;
            localStorage.setItem('dg_user', JSON.stringify(user));
        } catch (error) {
            console.error('Failed to save profile:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Failed to save profile.');
            }
        }
    },
    
    // ============================================================
    // UI UPDATE
    // ============================================================
    
    /**
     * Update all UI elements with current profile data
     */
  updateUI() {
    // Avatar
    const avatarEl = document.getElementById('profile-avatar');
    if (avatarEl) {
        avatarEl.src = this.state.profile.avatar;
        avatarEl.onerror = () => {
            avatarEl.src = '/assets/images/default.png';   // ✅ სწორი
            this.state.profile.avatar = '/assets/images/default.png';
            this.saveProfile();
        };
    }
    // ... დანარჩენი კოდი

        // Display Name
        const nameEl = document.getElementById('profile-display-name');
        if (nameEl) nameEl.textContent = this.state.profile.displayName;
        
        // Bio
        const bioEl = document.getElementById('profile-bio');
        if (bioEl) bioEl.textContent = this.state.profile.bio || 'No bio yet.';
        
        // Stats
        const postsEl = document.getElementById('profile-stat-posts');
        const friendsEl = document.getElementById('profile-stat-friends');
        if (postsEl) postsEl.textContent = this.state.stats.posts;
        if (friendsEl) friendsEl.textContent = this.state.stats.friends;
        
        // Sync avatar across all pages
        this._syncAvatarGlobally();
    },
    
    /**
     * Sync avatar to all pages that use it
     */
    _syncAvatarGlobally() {
        // Update all avatar images on the current page
        const allAvatars = document.querySelectorAll('img[src*="profiles"], img[src*="data:"]');
        allAvatars.forEach(img => {
            if (img.id !== 'profile-avatar' && img.id !== 'avatar-file-input') {
                img.src = this.state.profile.avatar;
            }
        });
        
        // Update navbar avatar if it exists
        const navAvatar = document.querySelector('#shared-navbar img');
        if (navAvatar) {
            navAvatar.src = this.state.profile.avatar;
        }
    },
    
    // ============================================================
    // ACTIONS
    // ============================================================
    
    /**
     * Handle avatar upload
     * @param {Event} event 
     */
    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Please select an image file (JPEG, PNG, GIF, WebP).');
            } else {
                alert('Please select an image file.');
            }
            return;
        }
        
        // Validate file size (max 2MB)
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Image must be less than 2MB.');
            } else {
                alert('Image must be less than 2MB.');
            }
            return;
        }
        
        // Read file as data URL
        const reader = new FileReader();
        reader.onload = (e) => {
            // Update state
            this.state.profile.avatar = e.target.result;
            
            // Save
            this.saveProfile();
            
            // Update UI
            this.updateUI();
            
            if (typeof Notifications !== 'undefined') {
                Notifications.success('Avatar updated successfully!');
            }
        };
        reader.onerror = () => {
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Failed to read image file.');
            }
        };
        reader.readAsDataURL(file);
    },
    
    /**
     * Show edit form
     */
    showEditForm() {
        this.state.isEditing = true;
        
        // Populate form fields
        const nameInput = document.getElementById('edit-display-name');
        const bioInput = document.getElementById('edit-bio');
        
        if (nameInput) nameInput.value = this.state.profile.displayName;
        if (bioInput) bioInput.value = this.state.profile.bio || '';
        
        // Show form, hide actions
        const form = document.getElementById('profile-edit-form');
        const actions = document.getElementById('profile-actions');
        
        if (form) form.style.display = 'block';
        if (actions) actions.style.display = 'none';
        
        // Focus name input
        setTimeout(() => {
            if (nameInput) nameInput.focus();
        }, 200);
    },
    
    /**
     * Hide edit form
     */
    hideEditForm() {
        this.state.isEditing = false;
        
        const form = document.getElementById('profile-edit-form');
        const actions = document.getElementById('profile-actions');
        
        if (form) form.style.display = 'none';
        if (actions) actions.style.display = 'block';
    },
    
    /**
     * Save profile changes from edit form
     */
    saveChanges() {
        const nameInput = document.getElementById('edit-display-name');
        const bioInput = document.getElementById('edit-bio');
        
        const newName = nameInput ? nameInput.value.trim() : '';
        const newBio = bioInput ? bioInput.value.trim() : '';
        
        // Validate
        if (!newName) {
            if (typeof Notifications !== 'undefined') {
                Notifications.warning('Display name cannot be empty.');
            } else {
                alert('Display name cannot be empty.');
            }
            return;
        }
        
        // Update state
        this.state.profile.displayName = newName;
        this.state.profile.bio = newBio || '';
        
        // Save
        this.saveProfile();
        
        // Update UI
        this.updateUI();
        
        // Hide form
        this.hideEditForm();
        
        if (typeof Notifications !== 'undefined') {
            Notifications.success('Profile updated successfully!');
        }
    },
    
    // ============================================================
    // EVENT BINDING
    // ============================================================
    
    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Avatar upload
        const avatarInput = document.getElementById('avatar-file-input');
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => this.handleAvatarUpload(e));
        }
        
        // Edit button
        const editBtn = document.getElementById('edit-profile-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.showEditForm());
        }
        
        // Cancel button
        const cancelBtn = document.getElementById('cancel-edit-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideEditForm());
        }
        
        // Save button
        const saveBtn = document.getElementById('save-profile-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveChanges());
        }
        
        // Enter key to save in edit form
        const editForm = document.getElementById('profile-edit-form');
        if (editForm) {
            editForm.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    this.saveChanges();
                }
            });
        }
        
        // Click on avatar to change it
        const avatarImg = document.getElementById('profile-avatar');
        if (avatarImg) {
            avatarImg.addEventListener('click', () => {
                const input = document.getElementById('avatar-file-input');
                if (input) input.click();
            });
        }
    }
};

// ============================================================
// AUTO-INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('profile-avatar') || document.getElementById('profile-display-name')) {
        ProfileModule.init();
    }
});

// Export globally
window.ProfileModule = ProfileModule;