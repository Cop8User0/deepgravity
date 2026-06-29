/* ============================================================
   DEEPGRAVITY – js/modules/messages.js (EXTENDED)
   Private Messages Module – Contacts, Messages, Add/Delete
   ============================================================ */

const MessagesModule = {
    
    // ============================================================
    // STATE
    // ============================================================
    state: {
        username: 'gravity888',
        contacts: [],
        activeContact: null
    },
    
    // Default contacts – pre‑loaded with admin
    defaultContacts: [
        {
            id: 'contact_1',
            name: 'System Admin',
            avatar: '/uploads/profiles/admin.png',
            online: true,
            messages: [
                {
                    from: 'System Admin',
                    content: 'Welcome to DEEPGRAVITY Messages! Use this space for private conversations. All messages are encrypted.',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]
        },
        {
            id: 'contact_2',
            name: 'Security Node',
            avatar: '/uploads/profiles/user1.png',
            online: true,
            messages: [
                {
                    from: 'Security Node',
                    content: 'All systems operational. Encryption active. Network secure.',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]
        }
    ],
    
    // ============================================================
    // INITIALIZATION
    // ============================================================
    
    /**
     * Initialize messages module
     */
    init() {
        console.log('Messages module initialized as:', this.state.username);
        
        this.loadContacts();
        this.renderContacts();
        this.bindEvents();
    },
    
    /**
     * Load contacts from localStorage
     */
    loadContacts() {
        try {
            const stored = localStorage.getItem('dg_contacts');
            
            if (stored) {
                const parsed = JSON.parse(stored);
                this.state.contacts = parsed;
            } else {
                // First visit – use default contacts
                this.state.contacts = JSON.parse(JSON.stringify(this.defaultContacts));
                this.saveContacts();
            }
        } catch (error) {
            console.error('Failed to load contacts:', error);
            this.state.contacts = JSON.parse(JSON.stringify(this.defaultContacts));
            this.saveContacts();
        }
    },
    
    /**
     * Save contacts to localStorage
     */
    saveContacts() {
        try {
            localStorage.setItem('dg_contacts', JSON.stringify(this.state.contacts));
        } catch (error) {
            console.error('Failed to save contacts:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Failed to save messages.');
            }
        }
    },
    
    // ============================================================
    // CONTACT MANAGEMENT
    // ============================================================
    
    /**
     * Render contacts list in sidebar
     */
    renderContacts() {
        const container = document.getElementById('conversations-list');
        if (!container) return;
        
        if (this.state.contacts.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;color:#64748b;padding:2rem;">
                    <p>No contacts yet.</p>
                    <p style="font-size:0.8rem;">Click + to add one.</p>
                </div>`;
            return;
        }
        
        container.innerHTML = this.state.contacts.map(contact => {
            const isActive = this.state.activeContact && this.state.activeContact.id === contact.id;
            const messageCount = contact.messages ? contact.messages.filter(m => m.from !== 'System').length : 0;
            
            return `
                <div class="contact-item ${isActive ? 'active' : ''}" 
                     onclick="MessagesModule.selectContact('${contact.id}')"
                     data-contact-id="${contact.id}">
                    <div style="position:relative;">
                        <img src="${contact.avatar}" class="contact-avatar" alt="${contact.name}">
                        ${contact.online ? '<span class="contact-online-dot"></span>' : ''}
                    </div>
                    <div class="contact-info">
                        <div class="contact-name">${this._escapeHtml(contact.name)}</div>
                        <div class="contact-meta">${messageCount} message${messageCount !== 1 ? 's' : ''}</div>
                    </div>
                    <button class="contact-delete-btn" 
                            onclick="event.stopPropagation();MessagesModule.deleteContact('${contact.id}')"
                            title="Delete contact">&times;</button>
                </div>
            `;
        }).join('');
    },
    
    /**
     * Select a contact to view conversation
     * @param {string} contactId 
     */
    selectContact(contactId) {
        const contact = this.state.contacts.find(c => c.id === contactId);
        if (!contact) return;
        
        this.state.activeContact = contact;
        
        // Update header
        const nameEl = document.getElementById('chat-recipient-name');
        const statusEl = document.getElementById('chat-recipient-status');
        const avatarEl = document.getElementById('chat-recipient-avatar');
        
        if (nameEl) nameEl.textContent = contact.name;
        if (statusEl) {
            statusEl.textContent = contact.online ? 'Online' : 'Offline';
            statusEl.style.color = contact.online ? '#10b981' : '#64748b';
        }
        if (avatarEl) {
            avatarEl.src = contact.avatar;
            avatarEl.style.display = 'block';
        }
        
        // Enable input
        const input = document.getElementById('private-message-input');
        const sendBtn = document.getElementById('private-send-btn');
        
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
        this.renderContacts();
        this.renderMessages();
    },
    
    /**
     * Add a new contact
     */
    addContact() {
        const name = prompt('Enter contact name:');
        if (!name || !name.trim()) return;
        
        const trimmedName = name.trim();
        
        // Check for duplicate
        const exists = this.state.contacts.some(c => 
            c.name.toLowerCase() === trimmedName.toLowerCase()
        );
        
        if (exists) {
            alert('A contact with that name already exists!');
            return;
        }
        
        // Create new contact
        const newContact = {
            id: 'contact_' + Date.now(),
            name: trimmedName,
            avatar: '/uploads/profiles/default.png',
            online: false,
            messages: [
                {
                    from: 'System',
                    content: 'Conversation started with ' + trimmedName + '.',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]
        };
        
        this.state.contacts.push(newContact);
        this.saveContacts();
        this.renderContacts();
        this.selectContact(newContact.id);
        
        if (typeof Notifications !== 'undefined') {
            Notifications.success('Contact "' + trimmedName + '" added!');
        }
    },
    
    /**
     * Delete a contact
     * @param {string} contactId 
     */
    deleteContact(contactId) {
        const contact = this.state.contacts.find(c => c.id === contactId);
        if (!contact) return;
        
        if (!confirm('Delete conversation with "' + contact.name + '"?')) return;
        
        this.state.contacts = this.state.contacts.filter(c => c.id !== contactId);
        
        // If deleted contact was active, clear view
        if (this.state.activeContact && this.state.activeContact.id === contactId) {
            this.state.activeContact = null;
            this.clearChatView();
        }
        
        this.saveContacts();
        this.renderContacts();
        
        if (typeof Notifications !== 'undefined') {
            Notifications.info('Contact deleted.');
        }
    },
    
    // ============================================================
    // MESSAGE MANAGEMENT
    // ============================================================
    
    /**
     * Render messages for active contact
     */
    renderMessages() {
        const container = document.getElementById('private-messages-container');
        if (!container) return;
        
        // No active contact
        if (!this.state.activeContact) {
            container.innerHTML = `
                <div class="messages-empty">
                    <div class="empty-icon">💬</div>
                    <h3>Select a Conversation</h3>
                    <p>Choose a contact from the left to start messaging.</p>
                </div>`;
            return;
        }
        
        const messages = this.state.activeContact.messages || [];
        
        // No messages
        if (messages.length === 0) {
            container.innerHTML = `
                <div class="messages-empty">
                    <div class="empty-icon">💬</div>
                    <h3>No Messages Yet</h3>
                    <p>Start the conversation!</p>
                </div>`;
            return;
        }
        
        // Render messages
        container.innerHTML = messages.map((msg, index) => {
            // System message
            if (msg.from === 'System') {
                return `<div style="text-align:center;color:#64748b;font-size:0.8rem;font-style:italic;padding:8px;">${this._escapeHtml(msg.content)}</div>`;
            }
            
            const isSent = msg.from === this.state.username || msg.from === 'me';
            const senderName = isSent ? this.state.username : (msg.from || this.state.activeContact.name);
            const initial = senderName.charAt(0).toUpperCase();
            const showSender = !isSent && (index === 0 || messages[index - 1].from !== msg.from);
            
            return `
                <div class="message-bubble ${isSent ? 'sent' : 'received'}">
                    <div class="message-avatar">${initial}</div>
                    <div class="message-body">
                        ${(showSender || index === 0 || isSent) ? 
                            `<div class="message-sender">${this._escapeHtml(senderName)}</div>` : ''}
                        <div class="message-content">
                            ${this._escapeHtml(msg.content)}
                        </div>
                        <div class="message-time">
                            ${isSent ? '<span style="font-size:0.6rem;">🔒</span>' : ''}
                            ${msg.time}
                        </div>
                        ${isSent ? '<div class="encryption-badge">E2E Encrypted</div>' : ''}
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
        if (!this.state.activeContact) return;
        
        const input = document.getElementById('private-message-input');
        if (!input) return;
        
        const content = input.value.trim();
        if (!content) return;
        
        // Create message
        const now = new Date();
        const message = {
            from: this.state.username,
            content: content,
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        // Add to contact's messages
        this.state.activeContact.messages.push(message);
        
        // Save
        this.saveContacts();
        
        // Update UI
        this.renderMessages();
        this.renderContacts();
        
        // Clear input
        input.value = '';
        input.focus();
    },
    
    /**
     * Clear the chat view when no contact is active
     */
    clearChatView() {
        const container = document.getElementById('private-messages-container');
        const nameEl = document.getElementById('chat-recipient-name');
        const statusEl = document.getElementById('chat-recipient-status');
        const avatarEl = document.getElementById('chat-recipient-avatar');
        const input = document.getElementById('private-message-input');
        const sendBtn = document.getElementById('private-send-btn');
        
        if (container) {
            container.innerHTML = `
                <div class="messages-empty">
                    <div class="empty-icon">💬</div>
                    <h3>Select a Conversation</h3>
                    <p>Choose a contact from the left to start messaging.</p>
                </div>`;
        }
        if (nameEl) nameEl.textContent = 'Select a Conversation';
        if (statusEl) statusEl.textContent = '';
        if (avatarEl) avatarEl.style.display = 'none';
        if (input) {
            input.disabled = true;
            input.placeholder = 'Select a contact first...';
        }
        if (sendBtn) {
            sendBtn.disabled = true;
            sendBtn.style.opacity = '0.5';
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
        const sendBtn = document.getElementById('private-send-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        // Enter key to send
        const input = document.getElementById('private-message-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        // Add contact button
        const addBtn = document.getElementById('add-contact-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addContact());
        }
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
    if (document.getElementById('conversations-list') || document.getElementById('private-messages-container')) {
        MessagesModule.init();
    }
});

// Export globally
window.MessagesModule = MessagesModule;