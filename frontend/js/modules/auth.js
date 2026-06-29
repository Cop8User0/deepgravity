/**
 * DEEPGRAVITY Auth Modules
 */

import { api } from '../api.js';
import { setAuth } from '../auth.js';
import { showToast } from '../notifications.js';
import { loadShellComponents } from '../app.js';
import { copyToClipboard } from '../utils.js';

export function initLoginPage() {
    const form = document.getElementById('login-form');
    if (!form) return;
    
    form.onsubmit = async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        const res = await api.auth.login(username, password);
        if (res.success) {
            setAuth(res.data.token, res.data.user);
            showToast('მოგესალმებით!', 'success');
            
            // Reload components and redirect
            await loadShellComponents();
            location.hash = '#/feed';
            location.reload();
        } else {
            showToast(res.message, 'error');
        }
    };
}

export function initRegisterPage() {
    const form = document.getElementById('register-form');
    if (!form) return;
    
    form.onsubmit = async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const displayName = document.getElementById('register-displayname').value;
        const password = document.getElementById('register-password').value;
        
        const res = await api.auth.register(username, displayName, password);
        if (res.success) {
            showToast('რეგისტრაცია წარმატებულია!', 'success');
            
            // Hide form, show passkey display
            form.style.display = 'none';
            document.getElementById('register-footer').style.display = 'none';
            
            const passkeyBox = document.getElementById('passkey-display');
            const passkeyCode = document.getElementById('generated-passkey');
            
            passkeyBox.style.display = 'block';
            passkeyCode.textContent = res.data.passkey;
            
            // Copy button listener
            document.getElementById('copy-passkey-btn').onclick = () => {
                copyToClipboard(res.data.passkey);
                showToast('Passkey კოპირებულია!', 'info');
            };
        } else {
            showToast(res.message, 'error');
        }
    };
}
