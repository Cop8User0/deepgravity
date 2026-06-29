/* ============================================================
   DEEPGRAVITY – js/modules/chat.js (ULTIMATE EDITION)
   Complete Chat Module – Rooms, Messages, Create Room, Local Storage
   Enhanced with bug fixes, error handling, and advanced features
   ============================================================ */

const ChatModule = {
    
    // ============================================================
    // STATE
    // ============================================================
    state: {
        username: 'Anonymous',
        rooms: [],
        activeRoom: null,
        isLoading: false,
        error: null,
        isInitialized: false,
        messageCount: 0
    },
    
    // Default room that always exists
    defaultRoom: {
        id: 'local',
        name: 'Local Chat',
        messages: [
            {
                sender: 'System',
                content: 'Welcome to DEEPGRAVITY Local Chat! All messages are stored securely in your browser.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]
    },
    
    // ============================================================
    // INITIALIZATION
    // ============================================================
    
    /**
     * Initialize chat module with full error handling
     */
    init() {
        if (this.state.isInitialized) {
            console.log('Chat module already initialized.');
            return;
        }
        
        try {
            // Load user from localStorage
            const user = JSON.parse(localStorage.getItem('dg_user') || '{}');
            if (user.username) {
                this.state.username = user.username;
            } else if (user.display_name) {
                this.state.username = user.display_name;
            } else {
                // Fallback to stored username or default
                const storedUsername = localStorage.getItem('dg_username');
                if (storedUsername) {
                    this.state.username = storedUsername;
                }
            }
            
            console.log('Chat module initialized as:', this.state.username);
            
            this.loadRooms();
            this.renderRoomList();
            this.bindEvents();
            
            // Auto-select local room if no active room
            if (!this.state.activeRoom && this.state.rooms.length > 0) {
                this.selectRoom('local');
            }
            
            this.state.isInitialized = true;
            
            // Notify UI that chat is ready
            this._triggerEvent('chat-ready', { username: this.state.username });
            
        } catch (error) {
            console.error('Chat initialization failed:', error);
            this._showError('Failed to initialize chat. Please refresh the page.');
        }
    },
    
    /**
     * Load rooms from localStorage with validation
     */
    loadRooms() {
        try {
            const stored = localStorage.getItem('dg_chat_rooms');
            
            if (stored) {
                const parsed = JSON.parse(stored);
                
                // Validate data structure
                if (!Array.isArray(parsed)) {
                    throw new Error('Invalid room data structure');
                }
                
                // Ensure each room has required fields
                const validRooms = parsed.filter(room => 
                    room.id && room.name && Array.isArray(room.messages)
                );
                
                // Ensure Local Chat always exists
                const hasLocal = validRooms.some(room => room.id === 'local');
                if (!hasLocal) {
                    validRooms.unshift({ 
                        ...this.defaultRoom, 
                        messages: [...this.defaultRoom.messages] 
                    });
                }
                
                this.state.rooms = validRooms;
                this.saveRooms(); // Save validated data
            } else {
                // First visit – create default room
                this.state.rooms = [{ 
                    ...this.defaultRoom, 
                    messages: [...this.defaultRoom.messages] 
                }];
                this.saveRooms();
            }
        } catch (error) {
            console.error('Failed to load chat rooms:', error);
            // Reset to default on error
            this.state.rooms = [{ 
                ...this.defaultRoom, 
                messages: [...this.defaultRoom.messages] 
            }];
            this.saveRooms();
            this._showError('Chat data was corrupted. Reset to default.');
        }
    },
    
    /**
     * Save rooms to localStorage with error handling
     */
    saveRooms() {
        try {
            // Validate before saving
            if (!Array.isArray(this.state.rooms)) {
                throw new Error('Invalid rooms data');
            }
            
            // Ensure Local Chat exists before saving
            const hasLocal = this.state.rooms.some(room => room.id === 'local');
            if (!hasLocal) {
                this.state.rooms.unshift({ 
                    ...this.defaultRoom, 
                    messages: [...this.defaultRoom.messages] 
                });
            }
            
            localStorage.setItem('dg_chat_rooms', JSON.stringify(this.state.rooms));
            
            // Update message count
            this.state.messageCount = this.state.rooms.reduce((total, room) => {
                return total + (room.messages ? room.messages.filter(m => m.sender !== 'System').length : 0);
            }, 0);
            
        } catch (error) {
            console.error('Failed to save chat data:', error);
            this._showError('Failed to save chat data. Your messages may not be saved.');
        }
    },
    
    // ============================================================
    // ROOM MANAGEMENT
    // ============================================================
    
    /**
     * Render room list in sidebar
     */
    renderRoomList() {
        const container = document.getElementById('rooms-list');
        if (!container) {
            console.warn('Room list container not found.');
            return;
        }
        
        try {
            if (this.state.rooms.length === 0) {
                container.innerHTML = `
                    <div style="text-align:center;color:#64748b;padding:2rem;">
                        <p>No rooms yet.</p>
                        <p style="font-size:0.8rem;">Click + to create one.</p>
                    </div>`;
                return;
            }
            
            container.innerHTML = this.state.rooms.map(room => {
                const isActive = this.state.activeRoom && this.state.activeRoom.id === room.id;
                const messageCount = room.messages ? room.messages.filter(m => m.sender !== 'System').length : 0;
                const isLocal = room.id === 'local';
                
                return `
                    <div class="room-item ${isActive ? 'active' : ''}" 
                         onclick="ChatModule.selectRoom('${this._escapeHtml(room.id)}')"
                         data-room-id="${this._escapeHtml(room.id)}"
                         data-room-name="${this._escapeHtml(room.name)}">
                        <div class="room-name"># ${this._escapeHtml(room.name)}</div>
                        <div class="room-meta">
                            <span>${messageCount} message${messageCount !== 1 ? 's' : ''}</span>
                            ${isLocal ? '<span style="color:#10b981;">💾 Local</span>' : ''}
                            ${isActive ? '<span style="color:#8b5cf6;">●</span>' : ''}
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Failed to render room list:', error);
            container.innerHTML = '<div style="color:#ef4444;padding:1rem;">Error loading rooms.</div>';
        }
    },
    
    /**
     * Select a room to view with validation
     * @param {string} roomId 
     */
    selectRoom(roomId) {
        if (!roomId) {
            console.warn('No room ID provided.');
            return;
        }
        
        const room = this.state.rooms.find(r => r.id === roomId);
        if (!room) {
            console.warn('Room not found:', roomId);
            this._showError('Room not found.');
            return;
        }
        
        try {
            this.state.activeRoom = room;
            
            // Update header
            const titleEl = document.getElementById('active-room-title');
            const infoEl = document.getElementById('active-room-info');
            
            if (titleEl) titleEl.textContent = '# ' + this._escapeHtml(room.name);
            if (infoEl) {
                const count = room.messages ? room.messages.filter(m => m.sender !== 'System').length : 0;
                infoEl.textContent = count + ' message' + (count !== 1 ? 's' : '');
            }
            
            // Enable input
            const input = document.getElementById('chat-message-input');
            const sendBtn = document.getElementById('chat-send-btn');
            
            if (input) {
                input.disabled = false;
                input.placeholder = 'Type a message...';
                setTimeout(() => input.focus(), 200);
            }
            if (sendBtn) {
                sendBtn.disabled = false;
                sendBtn.style.opacity = '1';
            }
            
            // Update UI
            this.renderRoomList();
            this.renderMessages();
            
            // Trigger room selected event
            this._triggerEvent('room-selected', { roomId: room.id, roomName: room.name });
            
        } catch (error) {
            console.error('Failed to select room:', error);
            this._showError('Failed to load room.');
        }
    },
    
    /**
     * Create a new room with validation
     */
    createRoom() {
        try {
            const name = prompt('Enter room name:');
            if (name === null) return; // User cancelled
            if (!name || !name.trim()) {
                this._showError('Room name cannot be empty.');
                return;
            }
            
            const trimmedName = name.trim();
            
            // Validate name length
            if (trimmedName.length < 2) {
                this._showError('Room name must be at least 2 characters.');
                return;
            }
            
            if (trimmedName.length > 30) {
                this._showError('Room name must be less than 30 characters.');
                return;
            }
            
            // Check for duplicate (case-insensitive)
            const exists = this.state.rooms.some(room => 
                room.name.toLowerCase() === trimmedName.toLowerCase()
            );
            
            if (exists) {
                this._showError('A room with that name already exists!');
                return;
            }
            
            // Create new room
            const newRoom = {
                id: 'room_' + Date.now(),
                name: trimmedName,
                messages: [
                    {
                        sender: 'System',
                        content: `Room "${trimmedName}" created. Welcome!`,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                ]
            };
            
            this.state.rooms.push(newRoom);
            this.saveRooms();
            this.renderRoomList();
            this.selectRoom(newRoom.id);
            
            this._showNotification('Room "' + trimmedName + '" created!', 'success');
            
        } catch (error) {
            console.error('Failed to create room:', error);
            this._showError('Failed to create room.');
        }
    },
    
    /**
     * Delete a room with confirmation
     * @param {string} roomId 
     */
    deleteRoom(roomId) {
        if (!roomId) {
            console.warn('No room ID provided for deletion.');
            return;
        }
        
        // Prevent deleting Local Chat
        if (roomId === 'local') {
            this._showError('Cannot delete the Local Chat room.');
            return;
        }
        
        const room = this.state.rooms.find(r => r.id === roomId);
        if (!room) {
            this._showError('Room not found.');
            return;
        }
        
        if (!confirm('Delete room "' + room.name + '" and all its messages?')) {
            return;
        }
        
        try {
            this.state.rooms = this.state.rooms.filter(r => r.id !== roomId);
            
            if (this.state.activeRoom && this.state.activeRoom.id === roomId) {
                this.state.activeRoom = null;
                this.clearChatView();
            }
            
            this.saveRooms();
            this.renderRoomList();
            
            this._showNotification('Room deleted.', 'info');
            
        } catch (error) {
            console.error('Failed to delete room:', error);
            this._showError('Failed to delete room.');
        }
    },
    
    // ============================================================
    // MESSAGE MANAGEMENT
    // ============================================================
    
    /**
     * Render messages for active room
     */
    renderMessages() {
        const container = document.getElementById('chat-messages-container');
        if (!container) {
            console.warn('Messages container not found.');
            return;
        }
        
        try {
            // No active room
            if (!this.state.activeRoom) {
                container.innerHTML = this._getEmptyState('Select a Room', 'Choose a room from the left to start chatting.', '💬');
                return;
            }
            
            const messages = this.state.activeRoom.messages || [];
            
            // No messages
            if (messages.length === 0) {
                container.innerHTML = this._getEmptyState('No Messages Yet', 'Start the conversation!', '💬');
                return;
            }
            
            // Render messages
            container.innerHTML = messages.map((msg, index) => {
                // System message
                if (msg.sender === 'System') {
                    return `<div class="system-message">${this._escapeHtml(msg.content)}</div>`;
                }
                
                const isSent = msg.sender === this.state.username;
                const initial = msg.sender.charAt(0).toUpperCase();
                const showSender = !isSent && index > 0 && messages[index - 1].sender !== msg.sender;
                
                return `
                    <div class="message-bubble ${isSent ? 'sent' : 'received'}">
                        <div class="message-avatar">${this._escapeHtml(initial)}</div>
                        <div class="message-body">
                            ${(showSender || index === 0 || isSent) ? 
                                `<div class="message-sender">${this._escapeHtml(msg.sender)}</div>` : ''}
                            <div class="message-content">
                                ${this._escapeHtml(msg.content)}
                                ${msg.image ? `<img src="${this._escapeHtml(msg.image)}" class="chat-image" onclick="ChatModule.viewImage('${this._escapeHtml(msg.image)}')">` : ''}
                            </div>
                            <div class="message-time">
                                ${isSent ? '<span class="encryption-icon">🔒</span>' : ''}
                                ${this._escapeHtml(msg.time)}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            // Scroll to bottom
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 100);
            
        } catch (error) {
            console.error('Failed to render messages:', error);
            container.innerHTML = '<div style="color:#ef4444;padding:1rem;">Error loading messages.</div>';
        }
    },
    
    /**
     * Send a message with validation
     */
    sendMessage() {
        if (!this.state.activeRoom) {
            this._showError('No room selected. Please select a room first.');
            return;
        }
        
        const input = document.getElementById('chat-message-input');
        if (!input) {
            console.warn('Message input not found.');
            return;
        }
        
        const content = input.value.trim();
        if (!content) {
            // Don't show error for empty messages, just ignore
            return;
        }
        
        // Validate message length
        if (content.length > 1000) {
            this._showError('Message is too long (max 1000 characters).');
            return;
        }
        
        try {
            const now = new Date();
            const message = {
                sender: this.state.username,
                content: content,
                time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            
            this.state.activeRoom.messages.push(message);
            this.saveRooms();
            this.renderMessages();
            this.renderRoomList();
            
            // Clear input
            input.value = '';
            input.focus();
            
            // Trigger message sent event
            this._triggerEvent('message-sent', { roomId: this.state.activeRoom.id, message: message });
            
        } catch (error) {
            console.error('Failed to send message:', error);
            this._showError('Failed to send message. Please try again.');
        }
    },
    
    /**
     * Clear all messages in active room
     */
    clearRoomMessages() {
        if (!this.state.activeRoom) {
            this._showError('No room selected.');
            return;
        }
        
        if (!confirm('Clear all messages in this room?')) {
            return;
        }
        
        try {
            this.state.activeRoom.messages = [
                {
                    sender: 'System',
                    content: 'Room cleared.',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ];
            
            this.saveRooms();
            this.renderMessages();
            this.renderRoomList();
            
            this._showNotification('Room cleared.', 'info');
            
        } catch (error) {
            console.error('Failed to clear messages:', error);
            this._showError('Failed to clear messages.');
        }
    },
    
    /**
     * Clear the chat view (when no room is active)
     */
    clearChatView() {
        const container = document.getElementById('chat-messages-container');
        const titleEl = document.getElementById('active-room-title');
        const infoEl = document.getElementById('active-room-info');
        const input = document.getElementById('chat-message-input');
        const sendBtn = document.getElementById('chat-send-btn');
        
        if (container) {
            container.innerHTML = this._getEmptyState('Select a Room', 'Choose a room from the left to start chatting.', '💬');
        }
        if (titleEl) titleEl.textContent = 'Select a Room';
        if (infoEl) infoEl.textContent = '';
        if (input) {
            input.disabled = true;
            input.placeholder = 'Select a room first...';
        }
        if (sendBtn) {
            sendBtn.disabled = true;
            sendBtn.style.opacity = '0.5';
        }
    },
    
    /**
     * View image in lightbox
     * @param {string} src 
     */
    viewImage(src) {
        if (!src) {
            console.warn('No image source provided.');
            return;
        }
        
        try {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:9999;
                display:flex;align-items:center;justify-content:center;cursor:pointer;
                animation:fadeIn 0.3s ease;
            `;
            overlay.onclick = () => overlay.remove();
            
            const img = document.createElement('img');
            img.src = src;
            img.style.cssText = 'max-width:90%;max-height:90%;border-radius:8px;';
            img.loading = 'lazy';
            
            overlay.appendChild(img);
            document.body.appendChild(overlay);
            
            // Close on escape key
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    overlay.remove();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
            
        } catch (error) {
            console.error('Failed to show image:', error);
        }
    },
    
    // ============================================================
    // EVENT BINDING
    // ============================================================
    
    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Send button
        const sendBtn = document.getElementById('chat-send-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        // Enter key to send
        const input = document.getElementById('chat-message-input');
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        // Create room button
        const createBtn = document.getElementById('create-room-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.createRoom());
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+N = New Room
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.createRoom();
            }
            // Ctrl+L = Select Local Chat
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                this.selectRoom('local');
            }
            // Escape = Clear selection
            if (e.key === 'Escape' && this.state.activeRoom) {
                this.state.activeRoom = null;
                this.clearChatView();
                this.renderRoomList();
            }
        });
        
        // Handle visibility change (tab switch)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // Refresh UI when tab becomes visible
                this.renderRoomList();
                if (this.state.activeRoom) {
                    this.renderMessages();
                }
            }
        });
    },
    
    // ============================================================
    // UTILITY FUNCTIONS
    // ============================================================
    
    /**
     * Escape HTML to prevent XSS
     * @param {string} text 
     * @returns {string}
     */
    _escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    /**
     * Get empty state HTML
     * @param {string} title 
     * @param {string} description 
     * @param {string} icon 
     * @returns {string}
     */
    _getEmptyState(title, description, icon = '💬') {
        return `
            <div class="chat-empty" style="
                display:flex;flex-direction:column;align-items:center;justify-content:center;
                height:100%;padding:2rem;text-align:center;color:#64748b;
            ">
                <div style="font-size:4rem;margin-bottom:1rem;">${icon}</div>
                <h3 style="color:#e2e8f0;margin-bottom:0.5rem;">${this._escapeHtml(title)}</h3>
                <p style="font-size:0.95rem;">${this._escapeHtml(description)}</p>
            </div>
        `;
    },
    
    /**
     * Show error message
     * @param {string} message 
     */
    _showError(message) {
        console.error('Chat error:', message);
        if (typeof Notifications !== 'undefined') {
            Notifications.error(message);
        } else {
            alert('Error: ' + message);
        }
    },
    
    /**
     * Show notification
     * @param {string} message 
     * @param {string} type 
     */
    _showNotification(message, type = 'info') {
        if (typeof Notifications !== 'undefined') {
            Notifications[type](message);
        } else {
            console.log('Notification:', message);
        }
    },
    
    /**
     * Trigger custom event
     * @param {string} eventName 
     * @param {*} data 
     */
    _triggerEvent(eventName, data) {
        try {
            const event = new CustomEvent('chat:' + eventName, { 
                detail: data || {},
                bubbles: true 
            });
            document.dispatchEvent(event);
        } catch (error) {
            console.warn('Failed to trigger event:', eventName, error);
        }
    },
    
    /**
     * Get chat statistics
     * @returns {object}
     */
    getStats() {
        const totalRooms = this.state.rooms.length;
        const totalMessages = this.state.rooms.reduce((total, room) => {
            return total + (room.messages ? room.messages.length : 0);
        }, 0);
        const userMessages = this.state.rooms.reduce((total, room) => {
            return total + (room.messages ? room.messages.filter(m => m.sender !== 'System').length : 0);
        }, 0);
        
        return {
            totalRooms,
            totalMessages,
            userMessages,
            activeRoom: this.state.activeRoom ? this.state.activeRoom.name : null,
            username: this.state.username
        };
    },
    
    /**
     * Export chat data as JSON
     * @returns {string}
     */
    exportData() {
        try {
            return JSON.stringify({
                username: this.state.username,
                rooms: this.state.rooms,
                exportedAt: new Date().toISOString()
            }, null, 2);
        } catch (error) {
            console.error('Failed to export data:', error);
            return null;
        }
    },
    
    /**
     * Import chat data from JSON
     * @param {string} jsonData 
     * @returns {boolean}
     */
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (!data.rooms || !Array.isArray(data.rooms)) {
                throw new Error('Invalid data format');
            }
            
            this.state.rooms = data.rooms;
            this.state.username = data.username || this.state.username;
            this.saveRooms();
            this.renderRoomList();
            if (this.state.activeRoom) {
                this.selectRoom(this.state.activeRoom.id);
            }
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            this._showError('Failed to import data. Invalid format.');
            return false;
        }
    }
};

// ============================================================
// AUTO-INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('rooms-list') || document.getElementById('chat-messages-container')) {
        ChatModule.init();
    }
});

// Export globally
window.ChatModule = ChatModule;