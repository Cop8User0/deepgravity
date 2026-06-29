/* ============================================================
   DEEPGRAVITY – js/websocket.js
   WebSocket Connection Manager (Socket.IO)
   ============================================================ */

const socketManager = {
    
    // Socket instance
    socket: null,
    
    // Connection status
    connected: false,
    
    // Event callbacks
    callbacks: {
        onMessage: [],
        onRoomMessage: [],
        onUserJoined: [],
        onUserLeft: [],
        onConnect: [],
        onDisconnect: []
    },
    
    /**
     * Connect to WebSocket server
     * @returns {object|null} Socket instance
     */
    connect() {
        const token = localStorage.getItem('dg_token');
        
        if (!token) {
            console.warn('WebSocket: No auth token, skipping connection.');
            return null;
        }
        
        // Check if Socket.IO client is loaded
        if (typeof io === 'undefined') {
            console.error('WebSocket: Socket.IO client not loaded!');
            return null;
        }
        
        // Don't connect twice
        if (this.socket && this.socket.connected) {
            console.log('WebSocket: Already connected.');
            return this.socket;
        }
        
        try {
            this.socket = io(window.location.origin, {
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 2000
            });
            
            // Connection events
            this.socket.on('connect', () => {
                this.connected = true;
                console.log('WebSocket: Connected successfully.');
                this._triggerCallbacks('onConnect');
            });
            
            this.socket.on('disconnect', (reason) => {
                this.connected = false;
                console.log('WebSocket: Disconnected. Reason:', reason);
                this._triggerCallbacks('onDisconnect', reason);
            });
            
            this.socket.on('connect_error', (error) => {
                console.error('WebSocket: Connection error:', error.message);
                this.connected = false;
            });
            
            // Chat events
            this.socket.on('room_message', (data) => {
                console.log('WebSocket: Room message received:', data);
                this._triggerCallbacks('onRoomMessage', data);
            });
            
            this.socket.on('private_message', (data) => {
                console.log('WebSocket: Private message received:', data);
                this._triggerCallbacks('onMessage', data);
            });
            
            this.socket.on('user_joined', (data) => {
                console.log('WebSocket: User joined:', data);
                this._triggerCallbacks('onUserJoined', data);
            });
            
            this.socket.on('user_left', (data) => {
                console.log('WebSocket: User left:', data);
                this._triggerCallbacks('onUserLeft', data);
            });
            
            return this.socket;
            
        } catch (error) {
            console.error('WebSocket: Failed to connect:', error);
            return null;
        }
    },
    
    /**
     * Disconnect from WebSocket server
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
            console.log('WebSocket: Disconnected.');
        }
    },
    
    /**
     * Get socket instance
     * @returns {object|null}
     */
    getSocket() {
        return this.socket;
    },
    
    /**
     * Check if connected
     * @returns {boolean}
     */
    isConnected() {
        return this.connected && this.socket && this.socket.connected;
    },
    
    // ============================================================
    // CHAT ROOM ACTIONS
    // ============================================================
    
    /**
     * Join a chat room
     * @param {number|string} roomId 
     */
    joinChatRoom(roomId) {
        if (this.socket && this.connected) {
            this.socket.emit('join_chat_room', { room_id: roomId });
            console.log('WebSocket: Joining room:', roomId);
        }
    },
    
    /**
     * Leave a chat room
     * @param {number|string} roomId 
     */
    leaveChatRoom(roomId) {
        if (this.socket && this.connected) {
            this.socket.emit('leave_chat_room', { room_id: roomId });
            console.log('WebSocket: Leaving room:', roomId);
        }
    },
    
    /**
     * Send a message to a chat room
     * @param {number|string} roomId 
     * @param {number|string} userId 
     * @param {string} content 
     */
    sendRoomMessage(roomId, userId, content) {
        if (this.socket && this.connected) {
            this.socket.emit('send_room_message', { 
                room_id: roomId, 
                user_id: userId, 
                content 
            });
        }
    },
    
    // ============================================================
    // PRIVATE MESSAGES
    // ============================================================
    
    /**
     * Send a private message
     * @param {number|string} senderId 
     * @param {number|string} receiverId 
     * @param {string} content 
     * @param {string|null} imagePath 
     */
    sendPrivateMessage(senderId, receiverId, content, imagePath = null) {
        if (this.socket && this.connected) {
            this.socket.emit('send_private_message', { 
                sender_id: senderId, 
                receiver_id: receiverId, 
                content, 
                image_path: imagePath 
            });
        }
    },
    
    // ============================================================
    // EVENT SYSTEM
    // ============================================================
    
    /**
     * Register a callback for an event
     * @param {string} event - Event name
     * @param {Function} callback 
     */
    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
    },
    
    /**
     * Remove a callback
     * @param {string} event 
     * @param {Function} callback 
     */
    off(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
        }
    },
    
    /**
     * Trigger all callbacks for an event
     * @param {string} event 
     * @param {*} data 
     */
    _triggerCallbacks(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`WebSocket callback error (${event}):`, error);
                }
            });
        }
    }
};

// Export globally
window.socketManager = socketManager;