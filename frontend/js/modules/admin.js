/* ============================================================
   DEEPGRAVITY – js/modules/admin.js (COMPLETE)
   Admin Dashboard Module – Stats, Users, Posts, Rooms
   ============================================================ */

const AdminModule = {
    
    // ============================================================
    // STATE
    // ============================================================
    state: {
        users: [],
        posts: [],
        chatRooms: [],
        friends: [],
        messages: [],
        stats: {
            users: 0,
            posts: 0,
            rooms: 0,
            online: 0
        }
    },
    
    // ============================================================
    // INITIALIZATION
    // ============================================================
    
    /**
     * Initialize admin module
     */
    init() {
        console.log('Admin module initialized');
        
        // Check admin access
        var user = null;
        try { user = JSON.parse(localStorage.getItem('dg_user')); } catch(e) {}
        
        var isAdminUser = user && (
            user.username === 'gravity888' || 
            user.username === 'security8' || 
            user.is_admin === true
        );
        
        if (!isAdminUser) {
            alert('Access denied. Admin only.');
            window.location.href = 'feed.html';
            return;
        }
        
        this.loadData();
        this.renderStats();
        this.renderUsersTable();
        this.renderPostsTable();
        this.renderRoomsTable();
        this.bindEvents();
    },
    
    // ============================================================
    // DATA LOADING
    // ============================================================
    
    /**
     * Load all data from localStorage
     */
    loadData() {
        try {
            this.state.posts = JSON.parse(localStorage.getItem('dg_posts') || '[]');
            this.state.users = JSON.parse(localStorage.getItem('dg_users') || '[]');
            this.state.chatRooms = JSON.parse(localStorage.getItem('dg_chat_rooms') || '[]');
            this.state.friends = JSON.parse(localStorage.getItem('dg_friends') || '[]');
            this.state.messages = JSON.parse(localStorage.getItem('dg_contacts') || '[]');
            
            // If users empty, add defaults
            if (this.state.users.length === 0) {
                this.state.users = [
                    { id:1, username:'gravity888', display_name:'Root Gravity Admin', is_admin:true, is_online:true, posts_count:0, last_seen: new Date().toISOString() },
                    { id:2, username:'security8', display_name:'Security Administrator', is_admin:true, is_online:false, posts_count:0, last_seen: new Date().toISOString() },
                    { id:3, username:'operator', display_name:'Operator', is_admin:false, is_online:false, posts_count:0, last_seen: new Date().toISOString() }
                ];
                localStorage.setItem('dg_users', JSON.stringify(this.state.users));
            }
        } catch (error) {
            console.error('Failed to load admin data:', error);
        }
    },
    
    /**
     * Save users to localStorage
     */
    saveUsers() {
        try {
            localStorage.setItem('dg_users', JSON.stringify(this.state.users));
        } catch (error) {
            console.error('Failed to save users:', error);
        }
    },
    
    /**
     * Save posts to localStorage
     */
    savePosts() {
        try {
            localStorage.setItem('dg_posts', JSON.stringify(this.state.posts));
        } catch (error) {
            console.error('Failed to save posts:', error);
        }
    },
    
    /**
     * Save chat rooms to localStorage
     */
    saveRooms() {
        try {
            localStorage.setItem('dg_chat_rooms', JSON.stringify(this.state.chatRooms));
        } catch (error) {
            console.error('Failed to save rooms:', error);
        }
    },
    
    // ============================================================
    // RENDERING
    // ============================================================
    
    /**
     * Render stat cards
     */
    renderStats() {
        this.state.stats.users = this.state.users.length;
        this.state.stats.posts = this.state.posts.length;
        this.state.stats.rooms = this.state.chatRooms.length;
        this.state.stats.online = this.state.users.filter(function(u) { return u.is_online; }).length;
        
        var usersEl = document.getElementById('admin-stat-users');
        var postsEl = document.getElementById('admin-stat-posts');
        var roomsEl = document.getElementById('admin-stat-rooms');
        var onlineEl = document.getElementById('admin-stat-online');
        
        if (usersEl) usersEl.textContent = this.state.stats.users;
        if (postsEl) postsEl.textContent = this.state.stats.posts;
        if (roomsEl) roomsEl.textContent = this.state.stats.rooms;
        if (onlineEl) onlineEl.textContent = this.state.stats.online;
    },
    
    /**
     * Render users table
     */
    renderUsersTable() {
        var tbody = document.getElementById('admin-users-table-body');
        if (!tbody) return;
        
        if (this.state.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;color:#64748b;">No users found.</td></tr>';
            return;
        }
        
        var self = this;
        tbody.innerHTML = this.state.users.map(function(user) {
            return '<tr>' +
                '<td>' + user.id + '</td>' +
                '<td><strong>' + self._escapeHtml(user.username) + '</strong></td>' +
                '<td>' + self._escapeHtml(user.display_name || user.username) + '</td>' +
                '<td>' + (user.is_admin ? '<span class="admin-badge admin-badge-admin">Admin</span>' : '<span class="admin-badge admin-badge-user">User</span>') + '</td>' +
                '<td>' + (user.is_online ? '<span class="admin-badge admin-badge-active">Online</span>' : '<span class="admin-badge admin-badge-inactive">Offline</span>') + '</td>' +
                '<td>' + (user.posts_count || 0) + '</td>' +
                '<td style="font-size:0.8rem;">' + new Date(user.last_seen).toLocaleString() + '</td>' +
                '<td>' +
                    '<button class="admin-action-btn danger" onclick="AdminModule.deleteUser(' + user.id + ')">Delete</button>' +
                '</td>' +
            '</tr>';
        }).join('');
    },
    
    /**
     * Render posts table
     */
    renderPostsTable() {
        var tbody = document.getElementById('admin-posts-table-body');
        if (!tbody) return;
        
        if (this.state.posts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:#64748b;">No posts to moderate.</td></tr>';
            return;
        }
        
        var self = this;
        tbody.innerHTML = this.state.posts.map(function(post, index) {
            return '<tr>' +
                '<td>' + (post.id || index) + '</td>' +
                '<td>' + self._escapeHtml(post.author || 'Anonymous') + '</td>' +
                '<td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + self._escapeHtml(post.content || '') + '</td>' +
                '<td>' + (post.media ? '📷 Yes' : '—') + '</td>' +
                '<td style="font-size:0.8rem;">' + post.time + '</td>' +
                '<td><button class="admin-action-btn danger" onclick="AdminModule.deletePost(' + index + ')">Delete</button></td>' +
            '</tr>';
        }).join('');
    },
    
    /**
     * Render chat rooms table
     */
    renderRoomsTable() {
        var tbody = document.getElementById('admin-rooms-table-body');
        if (!tbody) return;
        
        if (this.state.chatRooms.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:#64748b;">No chat rooms.</td></tr>';
            return;
        }
        
        var self = this;
        tbody.innerHTML = this.state.chatRooms.map(function(room) {
            return '<tr>' +
                '<td>' + room.id + '</td>' +
                '<td>' + self._escapeHtml(room.name) + '</td>' +
                '<td>' + (room.created_by || 'System') + '</td>' +
                '<td>' + (room.messages ? room.messages.length : 0) + '</td>' +
                '<td style="font-size:0.8rem;">' + (room.created_at || 'N/A') + '</td>' +
                '<td><button class="admin-action-btn danger" onclick="AdminModule.deleteRoom(' + room.id + ')">Delete</button></td>' +
            '</tr>';
        }).join('');
    },
    
    // ============================================================
    // ACTIONS
    // ============================================================
    
    /**
     * Delete a user
     * @param {number} userId 
     */
    deleteUser(userId) {
        if (!confirm('Delete user #' + userId + '? This cannot be undone.')) return;
        
        this.state.users = this.state.users.filter(function(u) { return u.id !== userId; });
        this.saveUsers();
        this.renderUsersTable();
        this.renderStats();
        
        if (typeof Notifications !== 'undefined') {
            Notifications.info('User deleted.');
        }
    },
    
    /**
     * Delete a post
     * @param {number} index 
     */
    deletePost(index) {
        if (!confirm('Delete this post? This cannot be undone.')) return;
        
        this.state.posts.splice(index, 1);
        this.savePosts();
        this.renderPostsTable();
        this.renderStats();
        
        if (typeof Notifications !== 'undefined') {
            Notifications.info('Post deleted.');
        }
    },
    
    /**
     * Delete a chat room
     * @param {number} roomId 
     */
    deleteRoom(roomId) {
        if (!confirm('Delete room #' + roomId + '? This cannot be undone.')) return;
        
        this.state.chatRooms = this.state.chatRooms.filter(function(r) { return r.id !== roomId; });
        this.saveRooms();
        this.renderRoomsTable();
        this.renderStats();
        
        if (typeof Notifications !== 'undefined') {
            Notifications.info('Room deleted.');
        }
    },
    
    /**
     * Clear all posts
     */
    clearAllPosts() {
        if (!confirm('Delete ALL posts? This cannot be undone.')) return;
        
        this.state.posts = [];
        this.savePosts();
        this.renderPostsTable();
        this.renderStats();
        
        if (typeof Notifications !== 'undefined') {
            Notifications.info('All posts cleared.');
        }
    },
    
    /**
     * Clear all chat rooms
     */
    clearAllRooms() {
        if (!confirm('Delete ALL chat rooms? This cannot be undone.')) return;
        
        this.state.chatRooms = [];
        this.saveRooms();
        this.renderRoomsTable();
        this.renderStats();
        
        if (typeof Notifications !== 'undefined') {
            Notifications.info('All rooms cleared.');
        }
    },
    
    // ============================================================
    // EVENT BINDING
    // ============================================================
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Add any admin-specific event listeners here
        console.log('Admin events bound');
    },
    
    // ============================================================
    // UTILITY
    // ============================================================
    
    /**
     * Escape HTML to prevent XSS
     * @param {string} text 
     * @returns {string}
     */
    _escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ============================================================
// AUTO-INIT
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('admin-stat-users') || document.getElementById('admin-users-table-body')) {
        AdminModule.init();
    }
});

// Export globally
window.AdminModule = AdminModule;