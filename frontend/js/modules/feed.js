/* ============================================================
   DEEPGRAVITY – js/modules/feed.js (COMPLETE)
   Post Text, Image, Video + Lightbox + Confirm Dialog
   ============================================================ */
const FeedModule = {
    
    state: {
        posts: [],
        currentMedia: null,  // { type: 'image'|'video', dataUrl, file }
        isLoading: false
    },

    // ------------------------------------------------------------
    //  INIT
    // ------------------------------------------------------------
    init() {
        console.log('Feed module initialized');
        this.loadPosts();
        this.renderFeed();
        this.bindEvents();
    },

    loadPosts() {
        try {
            const stored = localStorage.getItem('dg_posts');
            if (stored) {
                this.state.posts = JSON.parse(stored);
            } else {
                this.state.posts = [
                    {
                        id: 'demo_1',
                        content: 'Welcome to DEEPGRAVITY! This is a secure, anonymous social platform.',
                        media: null,
                        time: new Date(Date.now() - 86400000).toLocaleString(),
                        author: 'Anonymous'
                    }
                ];
                this.savePosts();
            }
        } catch (e) {
            this.state.posts = [];
        }
    },

    savePosts() {
        try {
            if (this.state.posts.length > 50) this.state.posts = this.state.posts.slice(0, 50);
            localStorage.setItem('dg_posts', JSON.stringify(this.state.posts));
        } catch (e) {}
    },

    // ------------------------------------------------------------
    //  RENDER
    // ------------------------------------------------------------
    renderFeed() {
        const container = document.getElementById('feed-posts');
        if (!container) return;

        if (this.state.posts.length === 0) {
            container.innerHTML = `<div class="feed-empty"><div class="empty-icon">📝</div><h3>No Posts Yet</h3><p>Be the first to share!</p></div>`;
            return;
        }

        container.innerHTML = this.state.posts.map((post, index) => {
            let mediaHtml = '';
            if (post.media) {
                if (post.media.type === 'image') {
                    mediaHtml = `<img src="${post.media.dataUrl}" class="post-image" onclick="FeedModule.viewImage('${post.media.dataUrl}')" loading="lazy">`;
                } else if (post.media.type === 'video') {
                    mediaHtml = `<video controls class="post-video" preload="metadata"><source src="${post.media.dataUrl}"></video>`;
                }
            }
            return `
                <div class="post-card" data-post-id="${post.id || index}">
                    <div class="post-header">
                        <div class="post-avatar">👤</div>
                        <div class="post-meta">
                            <span class="post-author">${this._esc(post.author || 'Anonymous')}</span>
                            <span class="post-time">${post.time}</span>
                        </div>
                        <button class="post-delete-btn" onclick="FeedModule.deletePost(${index})" title="Delete">&times;</button>
                    </div>
                    ${post.content ? `<div class="post-content">${this._esc(post.content)}</div>` : ''}
                    ${mediaHtml}
                </div>`;
        }).join('');
    },

    // ------------------------------------------------------------
    //  POST CREATION
    // ------------------------------------------------------------
    handleFileSelect(input, type) {
        const file = input.files[0];
        if (!file) return;
        if (type === 'image' && !file.type.startsWith('image/')) return this._error('Only images allowed');
        if (type === 'video' && !file.type.startsWith('video/')) return this._error('Only videos allowed');
        if (file.size > 10 * 1024 * 1024) return this._error('Max 10MB');

        const reader = new FileReader();
        reader.onload = (e) => {
            this.state.currentMedia = { type, dataUrl: e.target.result };
            this._showPreview(type, e.target.result);
        };
        reader.readAsDataURL(file);
    },

    _showPreview(type, dataUrl) {
        const container = document.getElementById('media-preview-container');
        const img = document.getElementById('image-preview');
        const vid = document.getElementById('video-preview');
        const rmBtn = document.getElementById('remove-media-btn');
        if (container) container.style.display = 'block';
        if (rmBtn) rmBtn.style.display = 'flex';
        if (type === 'image') {
            if (img) { img.src = dataUrl; img.style.display = 'block'; }
            if (vid) vid.style.display = 'none';
        } else {
            if (vid) { vid.src = dataUrl; vid.style.display = 'block'; }
            if (img) img.style.display = 'none';
        }
    },

    removeMedia() {
        this.state.currentMedia = null;
        document.getElementById('media-preview-container').style.display = 'none';
        document.getElementById('image-preview').style.display = 'none';
        document.getElementById('video-preview').style.display = 'none';
        document.getElementById('remove-media-btn').style.display = 'none';
        document.getElementById('image-input').value = '';
        document.getElementById('video-input').value = '';
    },

    createPost() {
        const textarea = document.getElementById('post-input');
        if (!textarea) return;
        const content = textarea.value.trim();
        if (!content && !this.state.currentMedia) return this._error('Add text or media');

        const post = {
            id: 'post_' + Date.now(),
            content,
            media: this.state.currentMedia ? { type: this.state.currentMedia.type, dataUrl: this.state.currentMedia.dataUrl } : null,
            time: new Date().toLocaleString(),
            author: 'Anonymous'
        };
        this.state.posts.unshift(post);
        this.savePosts();
        this.renderFeed();
        textarea.value = '';
        this.removeMedia();
        textarea.focus();
        if (window.Notifications) Notifications.success('Post published!');
    },

    // ------------------------------------------------------------
    //  DELETE with animated confirm dialog
    // ------------------------------------------------------------
    showConfirmDialog(title, message, onConfirm) {
        const existing = document.getElementById('custom-confirm-dialog');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'custom-confirm-dialog';
        Object.assign(overlay.style, {
            position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)',
            display:'flex', alignItems:'center', justifyContent:'center', zIndex:10000,
            animation:'fadeIn 0.2s ease'
        });

        const card = document.createElement('div');
        Object.assign(card.style, {
            background:'#12121a', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'20px',
            padding:'30px', maxWidth:'420px', width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.6)',
            animation:'slideDown 0.3s cubic-bezier(0.34,1.56,0.64,1)', textAlign:'center'
        });

        const icon = document.createElement('div');
        icon.textContent = '⚠️';
        Object.assign(icon.style, { fontSize:'3rem', marginBottom:'16px', animation:'pulse 1.5s infinite' });

        const titleEl = document.createElement('h3');
        titleEl.textContent = title;
        Object.assign(titleEl.style, { color:'#e2e8f0', fontWeight:700, marginBottom:'8px' });

        const msgEl = document.createElement('p');
        msgEl.textContent = message;
        Object.assign(msgEl.style, { color:'#94a3b8', fontSize:'0.9rem', marginBottom:'24px' });

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        Object.assign(cancelBtn.style, {
            padding:'10px 24px', background:'rgba(255,255,255,0.05)', color:'#94a3b8',
            border:'1px solid rgba(255,255,255,0.1)', borderRadius:'24px', fontWeight:600, cursor:'pointer'
        });
        cancelBtn.onclick = () => { overlay.style.opacity='0'; setTimeout(()=>overlay.remove(),200); };

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        Object.assign(deleteBtn.style, {
            padding:'10px 24px', background:'rgba(239,68,68,0.15)', color:'#ef4444',
            border:'1px solid rgba(239,68,68,0.3)', borderRadius:'24px', fontWeight:600, cursor:'pointer'
        });
        deleteBtn.onclick = () => { overlay.remove(); if(onConfirm) onConfirm(); };

        card.append(icon, titleEl, msgEl, cancelBtn, deleteBtn);
        overlay.appendChild(card);
        document.body.appendChild(overlay);

        overlay.addEventListener('click', e => { if(e.target===overlay) overlay.remove(); });
        document.addEventListener('keydown', function esc(e) { if(e.key==='Escape') { overlay.remove(); document.removeEventListener('keydown',esc); } });
    },

    deletePost(index) {
        this.showConfirmDialog('Delete Post', 'This action cannot be undone.', () => {
            this.state.posts.splice(index, 1);
            this.savePosts();
            this.renderFeed();
            if (window.Notifications) Notifications.info('Post deleted.');
        });
    },

    // ------------------------------------------------------------
    //  IMAGE LIGHTBOX
    // ------------------------------------------------------------
    viewImage(src) {
        const existing = document.getElementById('custom-lightbox');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'custom-lightbox';
        Object.assign(overlay.style, {
            position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', backdropFilter:'blur(10px)',
            display:'flex', alignItems:'center', justifyContent:'center', zIndex:10001,
            animation:'fadeIn 0.25s ease', cursor:'zoom-out'
        });

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        Object.assign(closeBtn.style, {
            position:'absolute', top:'20px', right:'20px', width:'48px', height:'48px',
            background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)',
            borderRadius:'50%', color:'white', fontSize:'1.8rem', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', zIndex:10
        });

        const img = document.createElement('img');
        img.src = src;
        Object.assign(img.style, {
            maxWidth:'92%', maxHeight:'90vh', objectFit:'contain', borderRadius:'12px',
            boxShadow:'0 20px 60px rgba(0,0,0,0.6)', animation:'zoomIn 0.3s cubic-bezier(0.34,1.56,0.64,1)'
        });

        overlay.append(closeBtn, img);
        document.body.appendChild(overlay);

        const close = () => { overlay.style.opacity='0'; setTimeout(()=>overlay.remove(),200); };
        overlay.addEventListener('click', e => { if(e.target===overlay||e.target===closeBtn) close(); });
        document.addEventListener('keydown', function esc(e) { if(e.key==='Escape') { close(); document.removeEventListener('keydown',esc); } });
        document.body.style.overflow = 'hidden';
        const observer = new MutationObserver(() => { if(!document.contains(overlay)) { document.body.style.overflow=''; observer.disconnect(); } });
        observer.observe(document.body, { childList:true });
    },

    // ------------------------------------------------------------
    //  BIND EVENTS
    // ------------------------------------------------------------
    bindEvents() {
        document.getElementById('post-submit-btn')?.addEventListener('click', ()=>this.createPost());
        document.getElementById('image-input')?.addEventListener('change', (e)=>this.handleFileSelect(e.target,'image'));
        document.getElementById('video-input')?.addEventListener('change', (e)=>this.handleFileSelect(e.target,'video'));
        document.getElementById('remove-media-btn')?.addEventListener('click', ()=>this.removeMedia());
        const ta = document.getElementById('post-input');
        ta?.addEventListener('keydown', e => { if(e.ctrlKey && e.key==='Enter') { e.preventDefault(); this.createPost(); } });
        ta?.addEventListener('dragover', e => e.preventDefault());
        ta?.addEventListener('drop', e => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) this.handleFileSelect({files:[file]}, 'image');
            else if (file.type.startsWith('video/')) this.handleFileSelect({files:[file]}, 'video');
        });
    },

    _esc(text) { const d=document.createElement('div'); d.textContent=text; return d.innerHTML; },
    _error(msg) { if(window.Notifications) Notifications.error(msg); else alert(msg); }
};

// Auto-init
document.addEventListener('DOMContentLoaded', ()=>{
    if (document.getElementById('feed-posts') || document.getElementById('post-input')) FeedModule.init();
});
window.FeedModule = FeedModule;