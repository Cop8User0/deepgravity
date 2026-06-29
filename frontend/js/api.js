/* ============================================================
   DEEPGRAVITY – js/api.js
   API Wrapper Module
   ============================================================ */

const API_BASE = '/api';

/**
 * Make an API request
 * @param {string} endpoint - API endpoint (e.g., '/auth/login')
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object|null} body - Request body (for POST/PUT)
 * @param {boolean} isMultipart - Whether this is a file upload
 * @returns {Promise<object>} API response
 */
async function apiRequest(endpoint, method = 'GET', body = null, isMultipart = false) {
    const token = localStorage.getItem('dg_token');
    const headers = {};
    
    // Add auth token if available
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Set content type (skip for multipart/form-data)
    if (!isMultipart) {
        headers['Content-Type'] = 'application/json';
    }
    
    const config = {
        method,
        headers
    };
    
    // Add body for POST/PUT requests
    if (body && method !== 'GET') {
        config.body = isMultipart ? body : JSON.stringify(body);
    }
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        
        // Handle 401 – redirect to login
        if (response.status === 401) {
            const currentHash = window.location.hash;
            if (!currentHash.startsWith('#/login') && !currentHash.startsWith('#/register')) {
                localStorage.removeItem('dg_token');
                localStorage.removeItem('dg_user');
                window.location.hash = '#/login';
            }
        }
        
        // Parse JSON response
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error('API Request Error:', error);
        return { 
            success: false, 
            message: 'Connection error. Please check your network.' 
        };
    }
}

// ============================================================
// API ENDPOINTS
// ============================================================

const api = {
    
    // ----- AUTH -----
    auth: {
        /** Login user */
        login: (username, password) => 
            apiRequest('/auth/login', 'POST', { username, password }),
        
        /** Register new user */
        register: (username, displayName, password) => 
            apiRequest('/auth/register', 'POST', { 
                username, 
                display_name: displayName, 
                password 
            }),
        
        /** Logout current user */
        logout: () => 
            apiRequest('/auth/logout', 'POST'),
        
        /** Get current user info */
        me: () => 
            apiRequest('/auth/me', 'GET'),
        
        /** Change password */
        changePassword: (oldPassword, newPassword) => 
            apiRequest('/auth/password', 'PUT', { 
                old_password: oldPassword, 
                new_password: newPassword 
            })
    },
    
    // ----- POSTS -----
    posts: {
        /** Get all posts (with pagination) */
        getAll: (page = 1) => 
            apiRequest(`/posts?page=${page}`, 'GET'),
        
        /** Create a new post */
        create: (content, imagePath = null) => 
            apiRequest('/posts', 'POST', { 
                content, 
                image_path: imagePath 
            }),
        
        /** Delete a post */
        delete: (postId) => 
            apiRequest(`/posts/${postId}`, 'DELETE')
    },
    
    // ----- MESSAGES -----
    messages: {
        /** Get all conversations */
        getConversations: () => 
            apiRequest('/messages/conversations', 'GET'),
        
        /** Get messages with a specific user */
        getMessages: (userId, page = 1) => 
            apiRequest(`/messages/${userId}?page=${page}`, 'GET'),
        
        /** Send a private message */
        send: (userId, content, imagePath = null) => 
            apiRequest(`/messages/${userId}`, 'POST', { 
                content, 
                image_path: imagePath 
            }),
        
        /** Mark messages as read */
        markRead: (userId) => 
            apiRequest(`/messages/read/${userId}`, 'PUT')
    },
    
    // ----- CHAT -----
    chat: {
        /** Get all chat rooms */
        getRooms: () => 
            apiRequest('/chat/rooms', 'GET'),
        
        /** Create a new chat room */
        createRoom: (name, isPrivate = 0) => 
            apiRequest('/chat/rooms', 'POST', { 
                name, 
                is_private: isPrivate 
            }),
        
        /** Get messages in a room */
        getMessages: (roomId) => 
            apiRequest(`/chat/rooms/${roomId}/messages`, 'GET'),
        
        /** Get room members */
        getMembers: (roomId) => 
            apiRequest(`/chat/rooms/${roomId}/members`, 'GET'),
        
        /** Join a room */
        joinRoom: (roomId) => 
            apiRequest(`/chat/rooms/${roomId}/join`, 'POST'),
        
        /** Leave a room */
        leaveRoom: (roomId) => 
            apiRequest(`/chat/rooms/${roomId}/leave`, 'POST')
    },
    
    // ----- FRIENDS -----
    friends: {
        /** Get all friends */
        getAll: () => 
            apiRequest('/friends', 'GET'),
        
        /** Get pending friend requests */
        getPending: () => 
            apiRequest('/friends/pending', 'GET'),
        
        /** Send friend request */
        sendRequest: (friendId) => 
            apiRequest(`/friends/request/${friendId}`, 'POST'),
        
        /** Accept friend request */
        accept: (friendId) => 
            apiRequest(`/friends/accept/${friendId}`, 'PUT'),
        
        /** Reject friend request */
        reject: (friendId) => 
            apiRequest(`/friends/reject/${friendId}`, 'PUT'),
        
        /** Remove friend */
        remove: (friendId) => 
            apiRequest(`/friends/${friendId}`, 'DELETE'),
        
        /** Search users */
        search: (query) => 
            apiRequest(`/friends/search?q=${encodeURIComponent(query)}`, 'GET'),
        
        /** Block user */
        block: (targetId) => 
            apiRequest(`/friends/block/${targetId}`, 'POST')
    },
    
    // ----- PROFILE -----
    profile: {
        /** Get user profile */
        get: (userId) => 
            apiRequest(`/profile/${userId}`, 'GET'),
        
        /** Update own profile */
        update: (displayName, bio) => 
            apiRequest('/profile', 'PUT', { 
                display_name: displayName, 
                bio 
            })
    },
    
    // ----- ADMIN -----
    admin: {
        /** Get dashboard stats */
        getStats: () => 
            apiRequest('/admin/stats', 'GET'),
        
        /** Get all users */
        getUsers: () => 
            apiRequest('/admin/users', 'GET'),
        
        /** Delete a user */
        deleteUser: (userId) => 
            apiRequest(`/admin/users/${userId}`, 'DELETE'),
        
        /** Get all posts (for moderation) */
        getPosts: () => 
            apiRequest('/admin/posts', 'GET'),
        
        /** Delete a post */
        deletePost: (postId) => 
            apiRequest(`/admin/posts/${postId}`, 'DELETE')
    }
};

// Export globally
window.api = api;