/* ============================================================
   DEEPGRAVITY – js/notifications.js
   Toast Notification System
   ============================================================ */

const Notifications = {
    
    /**
     * Show a toast notification
     * @param {string} message - Notification message
     * @param {string} type - Type: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duration in milliseconds (default 4000)
     */
    show: function(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Choose icon by type
        let icon = 'ℹ️';
        switch (type) {
            case 'success': icon = '✅'; break;
            case 'error':   icon = '❌'; break;
            case 'warning': icon = '⚠️'; break;
            case 'info':    icon = '💬'; break;
        }
        
        // Create toast ID for tracking
        const toastId = 'toast-' + Date.now();
        toast.setAttribute('data-toast-id', toastId);
        
        // Build toast content
        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
            <div class="toast-progress"></div>
        `;
        
        // Add to container
        container.appendChild(toast);
        
        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.add('fade-out');
                toast.addEventListener('transitionend', () => {
                    if (toast.parentElement) {
                        toast.remove();
                    }
                });
            }
        }, duration);
    },
    
    /**
     * Show success toast
     * @param {string} message 
     */
    success: function(message) {
        this.show(message, 'success');
    },
    
    /**
     * Show error toast
     * @param {string} message 
     */
    error: function(message) {
        this.show(message, 'error');
    },
    
    /**
     * Show warning toast
     * @param {string} message 
     */
    warning: function(message) {
        this.show(message, 'warning');
    },
    
    /**
     * Show info toast
     * @param {string} message 
     */
    info: function(message) {
        this.show(message, 'info');
    },
    
    /**
     * Clear all toasts
     */
    clearAll: function() {
        const container = document.getElementById('toast-container');
        if (container) {
            container.innerHTML = '';
        }
    }
};

// Export globally
window.Notifications = Notifications;