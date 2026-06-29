/* ============================================================
   DEEPGRAVITY – js/modules/upload.js
   File Upload Module
   ============================================================ */

const UploadModule = {
    
    // Current state
    state: {
        uploading: false,
        progress: 0,
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
    },
    
    /**
     * Initialize upload module
     */
    init() {
        console.log('Upload module initialized');
    },
    
    /**
     * Upload a file to the server
     * @param {File} file - The file to upload
     * @param {string} type - Upload type ('post', 'profile', 'chat')
     * @returns {Promise<object>} Upload result
     */
    async uploadFile(file, type = 'post') {
        // Validate
        const validation = this.validateFile(file);
        if (!validation.valid) {
            if (window.Notifications) {
                Notifications.error(validation.message);
            }
            return { success: false, message: validation.message };
        }
        
        this.state.uploading = true;
        this.state.progress = 0;
        
        try {
            // In a real app, this would use FormData and fetch
            // For demo, we'll simulate upload with a data URL
            const dataUrl = await this._readFileAsDataURL(file);
            
            // Simulate upload progress
            await this._simulateProgress();
            
            this.state.uploading = false;
            this.state.progress = 100;
            
            return {
                success: true,
                data: {
                    url: dataUrl,
                    filename: file.name,
                    size: file.size,
                    type: file.type,
                    uploaded_at: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Upload failed:', error);
            this.state.uploading = false;
            this.state.progress = 0;
            
            return { success: false, message: 'Upload failed. Please try again.' };
        }
    },
    
    /**
     * Upload multiple files
     * @param {FileList} files 
     * @param {string} type 
     * @returns {Promise<Array>}
     */
    async uploadMultiple(files, type = 'post') {
        const results = [];
        
        for (const file of files) {
            const result = await this.uploadFile(file, type);
            results.push(result);
        }
        
        return results;
    },
    
    /**
     * Validate file before upload
     * @param {File} file 
     * @returns {object}
     */
    validateFile(file) {
        if (!file) {
            return { valid: false, message: 'No file selected.' };
        }
        
        // Check file type
        if (this.state.allowedTypes.length > 0 && !this.state.allowedTypes.includes(file.type)) {
            return { 
                valid: false, 
                message: `File type "${file.type}" is not allowed. Allowed types: ${this.state.allowedTypes.join(', ')}` 
            };
        }
        
        // Check file size
        if (file.size > this.state.maxSize) {
            const maxMB = this.state.maxSize / (1024 * 1024);
            const fileMB = (file.size / (1024 * 1024)).toFixed(1);
            return { 
                valid: false, 
                message: `File is too large (${fileMB}MB). Maximum size is ${maxMB}MB.` 
            };
        }
        
        // Check if file is empty
        if (file.size === 0) {
            return { valid: false, message: 'File is empty.' };
        }
        
        return { valid: true, message: 'File is valid.' };
    },
    
    /**
     * Create a preview URL for an image file
     * @param {File} file 
     * @returns {Promise<string>}
     */
    async createPreview(file) {
        return await this._readFileAsDataURL(file);
    },
    
    /**
     * Get file extension
     * @param {string} filename 
     * @returns {string}
     */
    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    },
    
    /**
     * Get file size as human-readable string
     * @param {number} bytes 
     * @returns {string}
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    /**
     * Check if file is an image
     * @param {File} file 
     * @returns {boolean}
     */
    isImage(file) {
        return file.type.startsWith('image/');
    },
    
    /**
     * Check if file is a video
     * @param {File} file 
     * @returns {boolean}
     */
    isVideo(file) {
        return file.type.startsWith('video/');
    },
    
    /**
     * Read file as data URL
     * @param {File} file 
     * @returns {Promise<string>}
     */
    _readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    },
    
    /**
     * Simulate upload progress (for demo)
     * @returns {Promise<void>}
     */
    _simulateProgress() {
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 30;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    this.state.progress = 100;
                    resolve();
                } else {
                    this.state.progress = Math.floor(progress);
                }
            }, 300);
        });
    },
    
    /**
     * Get current upload progress
     * @returns {number}
     */
    getProgress() {
        return this.state.progress;
    },
    
    /**
     * Check if upload is in progress
     * @returns {boolean}
     */
    isUploading() {
        return this.state.uploading;
    },
    
    /**
     * Cancel current upload
     */
    cancelUpload() {
        this.state.uploading = false;
        this.state.progress = 0;
    }
};

// Export globally
window.UploadModule = UploadModule;