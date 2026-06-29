/* ============================================================
   DEEPGRAVITY – js/modules/friends.js (EXTENDED)
   Friends Module – Friends List, Requests, Search, Add/Remove
   ============================================================ */

const FriendsModule = {
    
    // ============================================================
    // STATE
    // ============================================================
    state: {
        friends: [],
        requests: [],
        searchResults: [],
        currentTab: 'friends',  // 'friends', 'requests', 'find'
        isLoading: false
    },
    
    // Default data for first visit
    defaultFriends: [
        { id: 1, name: 'Shadow', avatar: '/uploads/profiles/user1.png', online: true, status: 'Online' },
        { id: 2, name: 'Cipher', avatar: '/uploads/profiles/user2.png', online: false, status: 'Last seen 2h ago' },
        { id: 3, name: 'Relay', avatar: '/uploads/profiles/user3.png', online: true, status: 'Online' }
    ],
    
    defaultRequests: [
        { id: 4, name: 'Phantom', avatar: '/uploads/profiles/user4.png', status: 'Wants to be friends' },
        { id: 5, name: 'DarkNode', avatar: '/uploads/profiles/default.png', status: 'Wants to be friends' }
    ],
    
    // ============================================================
    // INITIALIZATION
    // ============================================================
    
    /**
     * Initialize friends module
     */
    init() {
        console.log('Friends module initialized');
        
        this.loadData();
        this.renderGrid();
        this.bindEvents();
    },
    
    /**
     * Load data from localStorage
     */
    loadData() {
        try {
            const storedFriends = localStorage.getItem('dg_friends');
            if (storedFriends) {
                this.state.friends = JSON.parse(storedFriends);
            } else {
                this.state.friends = JSON.parse(JSON.stringify(this.defaultFriends));
                this.saveFriends();
            }
            
            const storedRequests = localStorage.getItem('dg_friend_requests');
            if (storedRequests) {
                this.state.requests = JSON.parse(storedRequests);
            } else {
                this.state.requests = JSON.parse(JSON.stringify(this.defaultRequests));
                this.saveRequests();
            }
        } catch (error) {
            console.error('Failed to load friends data:', error);
            this.state.friends = JSON.parse(JSON.stringify(this.defaultFriends));
            this.state.requests = JSON.parse(JSON.stringify(this.defaultRequests));
        }
    },
    
    /**
     * Save friends to localStorage
     */
    saveFriends() {
        try {
            localStorage.setItem('dg_friends', JSON.stringify(this.state.friends));
        } catch (error) {
            console.error('Failed to save friends:', error);
        }
    },
    
    /**
     * Save requests to localStorage
     */
    saveRequests() {
        try {
            localStorage.setItem('dg_friend_requests', JSON.stringify(this.state.requests));
        } catch (error) {
            console.error('Failed to save requests:', error);
        }
    },
    
    // ============================================================
    // TAB SWITCHING
    // ============================================================
    
    /**
     * Switch between tabs
     * @param {string} tab - 'friends', 'requests', 'find'
     */
    switchTab(tab) {
        this.state.currentTab = tab;
        
        // Update tab button styles
        document.querySelectorAll('.friends-tab-btn').forEach(btn => {
            btn.style.color = '#64748b';
            btn.style.borderBottomColor = 'transparent';
        });
        
        const activeBtn = document.getElementById('tab-' + tab);
        if (activeBtn) {
            activeBtn.style.color = '#e2e8f0';
            activeBtn.style.borderBottomColor = '#8b5cf6';
        }
        
        // Show/hide search
        const searchContainer = document.getElementById('search-container');
        if (searchContainer) {
            searchContainer.style.display = tab === 'find' ? 'block' : 'none';
        }
        
        // Clear search if switching away
        if (tab !== 'find') {
            const searchInput = document.getElementById('friends-search-input');
            if (searchInput) searchInput.value = '';
            this.state.searchResults = [];
        }
        
        // Render
        this.renderGrid();
    },
    
    // ============================================================
    // RENDERING
    // ============================================================
    
    /**
     * Render the main grid based on current tab
     */
    renderGrid() {
        const container = document.getElementById('friends-grid');
        if (!container) return;
        
        let data;
        let emptyMessage;
        
        switch (this.state.currentTab) {
            case 'friends':
                data = this.state.friends;
                emptyMessage = 'No friends yet. Use Find Friends to add some!';
                break;
            case 'requests':
                data = this.state.requests;
                emptyMessage = 'No pending requests.';
                break;
            case 'find':
                data = this.state.searchResults;
                emptyMessage = 'Start typing to search for users...';
                break;
            default:
                data = [];
                emptyMessage = '';
        }
        
        if (data.length === 0) {
            const icon = this.state.currentTab === 'friends' ? '👥' : 
                         this.state.currentTab === 'requests' ? '📩' : '🔍';
            container.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;color:#64748b;padding:4rem 2rem;">
                    <div style="font-size:3.5rem;margin-bottom:1rem;opacity:0.5;">${icon}</div>
                    <p style="font-size:1rem;">${emptyMessage}</p>
                </div>`;
            return;
        }
        
        container.innerHTML = data.map(user => this._renderUserCard(user)).join('');
    },
    
    /**
     * Render a single user card
     * @param {object} user 
     * @returns {string} HTML string
     */
    _renderUserCard(user) {
        const avatar = user.avatar || '/uploads/profiles/default.png';
        const name = this._escapeHtml(user.name);
        
        if (this.state.currentTab === 'friends') {
            return `
                <div class="friend-card" data-user-id="${user.id}">
                    <div style="position:relative;flex-shrink:0;">
                        <img src="${avatar}" alt="${name}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.06);">
                        ${user.online ? '<span style="position:absolute;bottom:2px;right:2px;width:12px;height:12px;background:#10b981;border-radius:50%;border:2px solid #12121a;box-shadow:0 0 6px rgba(16,185,129,0.4);"></span>' : ''}
                    </div>
                    <div style="flex:1;min-width:0;">
                        <div style="font-weight:600;color:#e2e8f0;">${name}</div>
                        <div style="font-size:0.8rem;color:${user.online ? '#10b981' : '#64748b'};">
                            ${user.status || (user.online ? 'Online' : 'Offline')}
                        </div>
                    </div>
                    <div style="display:flex;gap:6px;">
                        <button onclick="FriendsModule.sendMessage(${user.id})" 
                            style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.3);color:#8b5cf6;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:0.8rem;font-weight:600;">
                            Message
                        </button>
                        <button onclick="FriendsModule.removeFriend(${user.id})" 
                            style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#ef4444;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:0.8rem;font-weight:600;">
                            Remove
                        </button>
                    </div>
                </div>
            `;
        } else if (this.state.currentTab === 'requests') {
            return `
                <div class="friend-card" data-user-id="${user.id}">
                    <img src="${avatar}" alt="${name}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;flex-shrink:0;">
                    <div style="flex:1;min-width:0;">
                        <div style="font-weight:600;color:#e2e8f0;">${name}</div>
                        <div style="font-size:0.8rem;color:#64748b;">${user.status || 'Wants to be friends'}</div>
                    </div>
                    <div style="display:flex;gap:6px;">
                        <button onclick="FriendsModule.acceptRequest(${user.id})" 
                            style="background:linear-gradient(135deg,#8b5cf6,#06b6d4);color:white;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:0.8rem;font-weight:600;">
                            Accept
                        </button>
                        <button onclick="FriendsModule.rejectRequest(${user.id})" 
                            style="background:none;border:1px solid rgba(255,255,255,0.1);color:#64748b;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:0.8rem;">
                            Reject
                        </button>
                    </div>
                </div>
            `;
        } else {
            // Search result
            return `
                <div class="friend-card" data-user-id="${user.id}">
                    <img src="${avatar}" alt="${name}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;flex-shrink:0;">
                    <div style="flex:1;min-width:0;">
                        <div style="font-weight:600;color:#e2e8f0;">${name}</div>
                        <div style="font-size:0.8rem;color:#64748b;">@${name.toLowerCase().replace(/\s/g,'_')}</div>
                    </div>
                    <button onclick="FriendsModule.sendRequest('${name}')" 
                        style="background:linear-gradient(135deg,#8b5cf6,#06b6d4);color:white;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:0.8rem;font-weight:600;">
                        Add Friend
                    </button>
                </div>
            `;
        }
    },
    
    // ============================================================
    // ACTIONS
    // ============================================================
    
    /**
     * Accept a friend request
     * @param {number} userId 
     */
    acceptRequest(userId) {
        const user = this.state.requests.find(r => r.id === userId);
        if (!user) return;
        
        // Move to friends
        this.state.friends.push({
            id: user.id,
            name: user.name,
            avatar: user.avatar || '/uploads/profiles/default.png',
            online: false,
            status: 'Just added'
        });
        
        // Remove from requests
        this.state.requests = this.state.requests.filter(r => r.id !== userId);
        
        // Save
        this.saveFriends();
        this.saveRequests();
        
        // Update UI
        this.renderGrid();
        this._updateRequestsBadge();
        
        if (typeof Notifications !== 'undefined') {
            Notifications.success(`${user.name} is now your friend!`);
        }
    },
    
    /**
     * Reject a friend request
     * @param {number} userId 
     */
    rejectRequest(userId) {
        this.state.requests = this.state.requests.filter(r => r.id !== userId);
        this.saveRequests();
        this.renderGrid();
        this._updateRequestsBadge();
    },
    
    /**
     * Remove a friend
     * @param {number} userId 
     */
    removeFriend(userId) {
        const friend = this.state.friends.find(f => f.id === userId);
        if (!friend) return;
        
        if (!confirm(`Remove ${friend.name} from your friends?`)) return;
        
        this.state.friends = this.state.friends.filter(f => f.id !== userId);
        this.saveFriends();
        this.renderGrid();
        
        if (typeof Notifications !== 'undefined') {
            Notifications.info(`${friend.name} removed from friends.`);
        }
    },
    
    /**
     * Send a friend request (from search)
     * @param {string} name 
     */
    sendRequest(name) {
        if (typeof Notifications !== 'undefined') {
            Notifications.success(`Friend request sent to ${name}!`);
        } else {
            alert(`Friend request sent to ${name}!`);
        }
    },
    
    /**
     * Navigate to messages with this friend
     * @param {number} userId 
     */
    sendMessage(userId) {
        window.location.href = 'messages.html';
        // In a full implementation, would pass userId to pre-select contact
    },
    
    /**
     * Search for users
     * @param {string} query 
     */
    searchUsers(query) {
        if (!query || query.trim().length < 2) {
            this.state.searchResults = [];
            this.renderGrid();
            return;
        }
        
        // Simulate search – in production, would call API
        const q = query.trim().toLowerCase();
        this.state.searchResults = [
            { id: 100, name: query.trim(), avatar: '/uploads/profiles/default.png' },
            { id: 101, name: q.charAt(0).toUpperCase() + q.slice(1) + '_Node', avatar: '/uploads/profiles/user1.png' }
        ].filter(u => 
            !this.state.friends.some(f => f.name.toLowerCase() === u.name.toLowerCase())
        );
        
        this.renderGrid();
    },
    
    // ============================================================
    // EVENT BINDING
    // ============================================================
    
    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Tab buttons
        const tabFriends = document.getElementById('tab-friends');
        const tabRequests = document.getElementById('tab-requests');
        const tabFind = document.getElementById('tab-find');
        
        if (tabFriends) tabFriends.addEventListener('click', () => this.switchTab('friends'));
        if (tabRequests) tabRequests.addEventListener('click', () => this.switchTab('requests'));
        if (tabFind) tabFind.addEventListener('click', () => this.switchTab('find'));
        
        // Search input
        const searchInput = document.getElementById('friends-search-input');
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.searchUsers(searchInput.value);
                }, 300);
            });
        }
    },
    
    // ============================================================
    // UTILITY
    // ============================================================
    
    /**
     * Update requests badge count
     */
    _updateRequestsBadge() {
        const badge = document.getElementById('requests-badge');
        if (badge) {
            badge.textContent = this.state.requests.length;
            badge.style.display = this.state.requests.length > 0 ? 'inline' : 'none';
        }
    },
    
    /**
     * Escape HTML
     */
    _escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ============================================================
// AUTO-INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('friends-grid')) {
        FriendsModule.init();
    }
});

// Export globally
window.FriendsModule = FriendsModule;