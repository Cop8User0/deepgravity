/* ============================================================
   DEEPGRAVITY – js/modules/emoji.js
   Simple Emoji Picker Module (No Gender/Flag Politics)
   ============================================================ */

const EmojiModule = {
    
    // Emoji categories – only universal symbols, no political flags
    emojis: {
        'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😪', '😴', '🥱', '😷', '🤒', '🤕', '🤢', '🤮', '🥴', '😵', '🤯', '🥳', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖'],
        
        'Gestures': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄'],
        
        'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '💌', '💋'],
        
        'Objects': ['💼', '📁', '📂', '📝', '📌', '📎', '🖇️', '📏', '📐', '✂️', '🔒', '🔓', '🔏', '🔐', '🔑', '🗝️', '🔨', '⛏️', '⚒️', '🛠️', '🗡️', '⚔️', '💣', '🧨', '🔪', '🗿', '⚰️', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕯️', '💡', '🔦', '🏮', '📔', '📕', '📖', '📗', '📘', '📙', '📚', '📓', '📒', '📃', '📜', '📄', '📰', '🗞️', '📑', '🔖', '🏷️', '💰', '💴', '💵', '💶', '💷', '💸', '💳', '💎'],
        
        'Symbols': ['⚠️', '🚸', '⛔', '🚫', '🚳', '🚭', '🚯', '🚱', '🚷', '📵', '🔞', '☢️', '☣️', '⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️', '↕️', '↔️', '↩️', '↪️', '⤴️', '⤵️', '🔃', '🔄', '🔙', '🔚', '🔛', '🔜', '🔝', '🛐', '⚛️', '🕉️', '✡️', '☸️', '☯️', '✝️', '☦️', '☪️', '☮️', '🕎', '🔯', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '⛎', '🔀', '🔁', '🔂', '▶️', '⏩', '⏭️', '⏯️', '◀️', '⏪', '⏮️', '🔼', '⏫', '🔽', '⏬', '⏸️', '⏹️', '⏺️', '⏏️', '🎦', '🔅', '🔆', '📶', '📳', '📴', '♻️', '✅', '❌', '❎', '➕', '➖', '➗', '✖️', '❓', '❔', '❗', '❕', '💯', '🔰', '🔱', '©️', '®️', '™️'],
        
        // Only country flags – no political/ideological flags
        'Country Flags': ['🏁', '🚩', '🎌', '🏴', '🏴‍☠️', '🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇩🇪', '🇫🇷', '🇯🇵', '🇰🇷', '🇨🇳', '🇮🇳', '🇧🇷', '🇷🇺', '🇬🇪', '🇺🇦', '🇹🇷', '🇮🇹', '🇪🇸', '🇲🇽', '🇦🇷', '🇿🇦', '🇪🇺', '🇺🇳', '🇨🇭', '🇸🇪', '🇳🇴', '🇩🇰', '🇫🇮', '🇳🇱', '🇧🇪', '🇦🇹', '🇵🇱', '🇨🇿', '🇷🇴', '🇬🇷', '🇵🇹', '🇮🇪', '🇭🇺', '🇧🇬', '🇭🇷', '🇷🇸', '🇸🇰', '🇸🇮', '🇱🇹', '🇱🇻', '🇪🇪', '🇮🇸', '🇦🇱', '🇲🇰', '🇲🇩', '🇦🇲', '🇦🇿', '🇰🇿', '🇺🇿', '🇹🇲', '🇰🇬', '🇹🇯', '🇲🇳', '🇮🇱', '🇸🇦', '🇦🇪', '🇶🇦', '🇰🇼', '🇧🇭', '🇴🇲', '🇯🇴', '🇱🇧', '🇪🇬', '🇲🇦', '🇩🇿', '🇹🇳', '🇱🇾', '🇳🇬', '🇿🇲', '🇰🇪', '🇪🇹', '🇹🇿', '🇺🇬', '🇬🇭', '🇨🇮', '🇸🇳', '🇨🇲']
    },
    
    // Current active input element
    activeInput: null,
    
    /**
     * Initialize emoji picker
     */
    init() {
        console.log('Emoji module initialized');
    },
    
    /**
     * Show emoji picker near an input element
     * @param {HTMLElement} inputElement - The input/textarea to insert emoji into
     */
    showPicker(inputElement) {
        this.activeInput = inputElement;
        
        // Remove existing picker
        this.removePicker();
        
        // Create picker container
        const picker = document.createElement('div');
        picker.className = 'emoji-picker';
        picker.id = 'emoji-picker';
        picker.style.cssText = `
            position: absolute;
            bottom: 60px;
            left: 20px;
            background: #1a1a2e;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 12px;
            z-index: 1000;
            max-width: 360px;
            max-height: 300px;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0,0,0,0.6);
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            gap: 6px;
        `;
        
        // Add emojis
        const allEmojis = Object.values(this.emojis).flat();
        
        // Show first 80 emojis
        const displayEmojis = allEmojis.slice(0, 80);
        
        displayEmojis.forEach(emoji => {
            const btn = document.createElement('button');
            btn.textContent = emoji;
            btn.style.cssText = `
                width: 36px;
                height: 36px;
                font-size: 1.3rem;
                background: rgba(255,255,255,0.03);
                border: 1px solid transparent;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            `;
            btn.onmouseover = () => {
                btn.style.background = 'rgba(139,92,246,0.2)';
                btn.style.borderColor = 'rgba(139,92,246,0.3)';
                btn.style.transform = 'scale(1.2)';
            };
            btn.onmouseout = () => {
                btn.style.background = 'rgba(255,255,255,0.03)';
                btn.style.borderColor = 'transparent';
                btn.style.transform = 'scale(1)';
            };
            btn.onclick = () => {
                this.insertEmoji(emoji);
                this.removePicker();
            };
            picker.appendChild(btn);
        });
        
        // Position picker near input
        const inputRect = inputElement.getBoundingClientRect();
        picker.style.position = 'fixed';
        picker.style.top = (inputRect.top - 320) + 'px';
        picker.style.left = inputRect.left + 'px';
        
        document.body.appendChild(picker);
        
        // Close picker when clicking outside
        setTimeout(() => {
            document.addEventListener('click', this._closeHandler);
        }, 100);
    },
    
    /**
     * Insert emoji into active input
     * @param {string} emoji 
     */
    insertEmoji(emoji) {
        if (!this.activeInput) return;
        
        const start = this.activeInput.selectionStart;
        const end = this.activeInput.selectionEnd;
        const text = this.activeInput.value;
        
        this.activeInput.value = text.substring(0, start) + emoji + text.substring(end);
        
        // Move cursor after emoji
        this.activeInput.selectionStart = start + emoji.length;
        this.activeInput.selectionEnd = start + emoji.length;
        
        this.activeInput.focus();
    },
    
    /**
     * Remove picker from DOM
     */
    removePicker() {
        const existing = document.getElementById('emoji-picker');
        if (existing) {
            existing.remove();
        }
        document.removeEventListener('click', this._closeHandler);
    },
    
    /**
     * Close picker when clicking outside
     */
    _closeHandler(e) {
        const picker = document.getElementById('emoji-picker');
        if (picker && !picker.contains(e.target)) {
            EmojiModule.removePicker();
        }
    }
};

// Export globally
window.EmojiModule = EmojiModule;