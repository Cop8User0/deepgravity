/* ============================================================
   DEEPGRAVITY – js/modules/chat.js (EXTENDED EDITION)
   Complete Chat Module – Rooms, Messages, Create Room, Local Storage
   ============================================================ */

const ChatModule = {
    
    // ============================================================
    // STATE
    // ============================================================
    state: {
        username: 'gravity888',
        rooms: [],
        activeRoom: null,
        isLoading: false,
        error: null
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
     * Initialize chat module
     */
    init() {
        console.log('Chat module initialized as:', this.state.username);
        
        this.loadRooms();
        this.renderRoomList();
        this.bindEvents();
    },
    
    /**
     * Load rooms from localStorage
     */
    loadRooms() {
        try {
            const stored = localStorage.getItem('dg_chat_rooms');
            
            if (stored) {
                const parsed = JSON.parse(stored);
                
                // Ensure Local Chat always exists
                const hasLocal = parsed.some(room => room.id === 'local');
                if (!hasLocal) {
                    parsed.unshift({ ...this.defaultRoom, messages: [...this.defaultRoom.messages] });
                }
                
                this.state.rooms = parsed;
            } else {
                // First visit – create default room
                this.state.rooms = [{ ...this.defaultRoom, messages: [...this.defaultRoom.messages] }];
                this.saveRooms();
            }
        } catch (error) {
            console.error('Failed to load chat rooms:', error);
            this.state.rooms = [{ ...this.defaultRoom, messages: [...this.defaultRoom.messages] }];
            this.saveRooms();
        }
    },
    
    /**
     * Save rooms to localStorage
     */
    saveRooms() {
        try {
            localStorage.setItem('dg_chat_rooms', JSON.stringify(this.state.rooms));
        } catch (error) {
            console.error('Failed to save chat rooms:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Failed to save chat data.');
            }
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
        if (!container) return;
        
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
            
            return `
                <div class="room-item ${isActive ? 'active' : ''}" 
                     onclick="ChatModule.selectRoom('${room.id}')"
                     data-room-id="${room.id}">
                    <div class="room-name"># ${this._escapeHtml(room.name)}</div>
                    <div class="room-meta">
                        <span>${messageCount} message${messageCount !== 1 ? 's' : ''}</span>
                        ${room.id === 'local' ? '<span style="color:#10b981;">💾 Local</span>' : ''}
                    </div>
                </div>
            `;
        }).join('');
    },
    
    /**
     * Select a room to view
     * @param {string} roomId 
     */
    selectRoom(roomId) {
        const room = this.state.rooms.find(r => r.id === roomId);
        if (!room) return;
        
        this.state.activeRoom = room;
        
        // Update header
        const titleEl = document.getElementById('active-room-title');
        const infoEl = document.getElementById('active-room-info');
        
        if (titleEl) titleEl.textContent = '# ' + room.name;
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
    },
    
    /**
     * Create a new room
     */
    createRoom() {
        const name = prompt('Enter room name:');
        if (!name || !name.trim()) return;
        
        const trimmedName = name.trim();
        
        // Check for duplicate
        const exists = this.state.rooms.some(room => 
            room.name.toLowerCase() === trimmedName.toLowerCase()
        );
        
        if (exists) {
            alert('A room with that name already exists!');
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
        
        if (typeof Notifications !== 'undefined') {
            Notifications.success('Room "' + trimmedName + '" created!');
        }
    },
    
    /**
     * Delete a room
     * @param {string} roomId 
     */
    deleteRoom(roomId) {
        // Prevent deleting Local Chat
        if (roomId === 'local') {
            alert('Cannot delete the Local Chat room.');
            return;
        }
        
        const room = this.state.rooms.find(r => r.id === roomId);
        if (!room) return;
        
        if (!confirm('Delete room "' + room.name + '" and all its messages?')) return;
        
        this.state.rooms = this.state.rooms.filter(r => r.id !== roomId);
        
        // If deleted room was active, clear active room
        if (this.state.activeRoom && this.state.activeRoom.id === roomId) {
            this.state.activeRoom = null;
            this.clearChatView();
        }
        
        this.saveRooms();
        this.renderRoomList();
        
        if (typeof Notifications !== 'undefined') {
            Notifications.info('Room deleted.');
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
        if (!container) return;
        
        // No active room
        if (!this.state.activeRoom) {
            container.innerHTML = `
                <div class="chat-empty">
                    <div class="empty-icon">💬</div>
                    <h3>Select a Room</h3>
                    <p>Choose a room from the left to start chatting.</p>
                </div>`;
            return;
        }
        
        const messages = this.state.activeRoom.messages || [];
        
        // No messages
        if (messages.length === 0) {
            container.innerHTML = `
                <div class="chat-empty">
                    <div class="empty-icon">💬</div>
                    <h3>No Messages Yet</h3>
                    <p>Start the conversation!</p>
                </div>`;
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
                    <div class="message-avatar">${initial}</div>
                    <div class="message-body">
                        ${(showSender || index === 0 || isSent) ? 
                            `<div class="message-sender">${this._escapeHtml(msg.sender)}</div>` : ''}
                        <div class="message-content">
                            ${this._escapeHtml(msg.content)}
                            ${msg.image ? `<img src="${this._escapeHtml(msg.image)}" class="chat-image" onclick="ChatModule.viewImage('${this._escapeHtml(msg.image)}')">` : ''}
                        </div>
                        <div class="message-time">
                            ${isSent ? '<span class="encryption-icon">🔒</span>' : ''}
                            ${msg.time}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Scroll to bottom
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    },
    
    /**
     * Send a message
     */
    sendMessage() {
        if (!this.state.activeRoom) return;
        
        const input = document.getElementById('chat-message-input');
        if (!input) return;
        
        const content = input.value.trim();
        if (!content) return;
        
        // Create message
        const now = new Date();
        const message = {
            sender: this.state.username,
            content: content,
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        // Add to room
        this.state.activeRoom.messages.push(message);
        
        // Save
        this.saveRooms();
        
        // Update UI
        this.renderMessages();
        this.renderRoomList();
        
        // Clear input
        input.value = '';
        input.focus();
    },
    
    /**
     * Clear all messages in active room
     */
    clearRoomMessages() {
        if (!this.state.activeRoom) return;
        
        if (!confirm('Clear all messages in this room?')) return;
        
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
        
        if (typeof Notifications !== 'undefined') {
            Notifications.info('Room cleared.');
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
            container.innerHTML = `
                <div class="chat-empty">
                    <div class="empty-icon">💬</div>
                    <h3>Select a Room</h3>
                    <p>Choose a room from the left to start chatting.</p>
                </div>`;
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
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:9999;
            display:flex;align-items:center;justify-content:center;cursor:pointer;
        `;
        overlay.onclick = () => overlay.remove();
        
        const img = document.createElement('img');
        img.src = src;
        img.style.cssText = 'max-width:90%;max-height:90%;border-radius:8px;';
        
        overlay.appendChild(img);
        document.body.appendChild(overlay);
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
            input.addEventListener('keypress', (e) => {
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
        });
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
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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