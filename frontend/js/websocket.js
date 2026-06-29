/* ============================================================
   DEEPGRAVITY – js/websocket.js
   WebSocket Connection Manager (Socket.IO)
   Enhanced & Optimized
   ============================================================ */

const socketManager = {
    
    // Socket instance
    socket: null,
    
    // Connection status
    connected: false,
    
    // Reconnection status
    reconnecting: false,
    
    // Heartbeat interval
    heartbeatInterval: null,
    
    // Event callbacks
    callbacks: {
        onMessage: [],
        onRoomMessage: [],
        onUserJoined: [],
        onUserLeft: [],
        onConnect: [],
        onDisconnect: [],
        onError: [],
        onTyping: [],
        onMessageRead: []
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
        
        if (typeof io === 'undefined') {
            console.error('WebSocket: Socket.IO client not loaded!');
            this._loadSocketIO();
            return null;
        }
        
        if (this.socket && this.socket.connected) {
            console.log('WebSocket: Already connected.');
            return this.socket;
        }
        
        // Use environment variable or fallback
        const wsUrl = window.WS_URL || 'https://deepgravity-app.onrender.com';
        
        try {
            this.socket = io(wsUrl, {
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 2000,
                reconnectionDelayMax: 10000,
                timeout: 30000,
                autoConnect: true,
                forceNew: true,
                path: '/socket.io/'
            });
            
            // Connection events
            this.socket.on('connect', () => {
                this.connected = true;
                this.reconnecting = false;
                console.log('WebSocket: Connected successfully.');
                this._startHeartbeat();
                this._triggerCallbacks('onConnect');
                this._notifyUserJoined();
            });
            
            this.socket.on('disconnect', (reason) => {
                this.connected = false;
                console.log('WebSocket: Disconnected. Reason:', reason);
                this._stopHeartbeat();
                this._triggerCallbacks('onDisconnect', reason);
                
                // Auto-reconnect for certain reasons
                if (reason === 'io server disconnect' || reason === 'transport close') {
                    console.log('WebSocket: Attempting to reconnect...');
                    setTimeout(() => this.connect(), 3000);
                }
            });
            
            this.socket.on('connect_error', (error) => {
                console.error('WebSocket: Connection error:', error.message);
                this.connected = false;
                this._triggerCallbacks('onError', error);
            });
            
            this.socket.on('reconnect_attempt', (attempt) => {
                console.log(`WebSocket: Reconnection attempt ${attempt}...`);
                this.reconnecting = true;
            });
            
            this.socket.on('reconnect_failed', () => {
                console.error('WebSocket: Reconnection failed.');
                this.reconnecting = false;
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
                this._showNotification(`${data.username} joined the chat`);
            });
            
            this.socket.on('user_left', (data) => {
                console.log('WebSocket: User left:', data);
                this._triggerCallbacks('onUserLeft', data);
                this._showNotification(`${data.username} left the chat`);
            });
            
            this.socket.on('typing', (data) => {
                this._triggerCallbacks('onTyping', data);
            });
            
            this.socket.on('message_read', (data) => {
                this._triggerCallbacks('onMessageRead', data);
            });
            
            // Ping/Pong for connection health
            this.socket.on('pong', () => {
                console.log('WebSocket: Pong received.');
            });
            
            return this.socket;
            
        } catch (error) {
            console.error('WebSocket: Failed to connect:', error);
            this._triggerCallbacks('onError', error);
            return null;
        }
    },
    
    /**
     * Disconnect from WebSocket server
     */
    disconnect() {
        this._stopHeartbeat();
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
                content,
                timestamp: new Date().toISOString()
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
                image_path: imagePath,
                timestamp: new Date().toISOString()
            });
        }
    },
    
    /**
     * Send typing indicator
     * @param {number|string} roomId 
     * @param {number|string} userId 
     * @param {boolean} isTyping 
     */
    sendTyping(roomId, userId, isTyping = true) {
        if (this.socket && this.connected) {
            this.socket.emit('typing', { room_id: roomId, user_id: userId, typing: isTyping });
        }
    },
    
    /**
     * Mark message as read
     * @param {number|string} messageId 
     */
    markMessageRead(messageId) {
        if (this.socket && this.connected) {
            this.socket.emit('message_read', { message_id: messageId });
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
    },
    
    // ============================================================
    // HEARTBEAT
    // ============================================================
    
    /**
     * Start heartbeat to keep connection alive
     */
    _startHeartbeat() {
        this._stopHeartbeat();
        this.heartbeatInterval = setInterval(() => {
            if (this.socket && this.connected) {
                this.socket.emit('ping', { timestamp: Date.now() });
                console.log('WebSocket: Heartbeat sent.');
            }
        }, 25000); // Every 25 seconds
    },
    
    /**
     * Stop heartbeat
     */
    _stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    },
    
    // ============================================================
    // NOTIFICATIONS
    // ============================================================
    
    /**
     * Show browser notification
     * @param {string} message 
     */
    _showNotification(message) {
        if (Notification.permission === 'granted') {
            new Notification('DEEPGRAVITY', {
                body: message,
                icon: '/assets/images/logo.png'
            });
        }
    },
    
    /**
     * Notify server that user joined
     */
    _notifyUserJoined() {
        if (this.socket && this.connected) {
            this.socket.emit('user_joined', {
                username: localStorage.getItem('dg_username') || 'Anonymous'
            });
        }
    },
    
    // ============================================================
    // UTILITY FUNCTIONS
    // ============================================================
    
    /**
     * Load Socket.IO client dynamically if not loaded
     */
    _loadSocketIO() {
        if (typeof io === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
            script.onload = () => {
                console.log('Socket.IO client loaded successfully.');
                this.connect();
            };
            script.onerror = () => {
                console.error('Failed to load Socket.IO client.');
            };
            document.head.appendChild(script);
        }
    },
    
    /**
     * Get connection status for UI
     * @returns {object}
     */
    getStatus() {
        return {
            connected: this.connected,
            reconnecting: this.reconnecting,
            socketId: this.socket ? this.socket.id : null,
            transport: this.socket ? this.socket.io?.engine?.transport?.name : null
        };
    }
};

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Export globally
window.socketManager = socketManager;

console.log('WebSocket Manager initialized.');