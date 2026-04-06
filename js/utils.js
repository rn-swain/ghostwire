/**
 * Ghostwire - Utility Functions
 * Helper functions for code generation, encoding, and general utilities
 */

const Utils = {
    /**
     * Generate a random room code (format: ABC-DEF-GHI)
     * @returns {string} Room code
     */
    generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const groups = 3;
        const charsPerGroup = 3;
        
        let code = '';
        for (let g = 0; g < groups; g++) {
            for (let c = 0; c < charsPerGroup; c++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            if (g < groups - 1) code += '-';
        }
        return code;
    },

    /**
     * Generate a random peer ID
     * @returns {string} UUID-like peer ID
     */
    generatePeerId() {
        return crypto.randomUUID ? crypto.randomUUID() : 
            'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                const r = Math.random() * 16 | 0;
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
    },

    /**
     * Generate a random nickname
     * @returns {string} Anonymous ghost nickname
     */
    generateNickname() {
        const adjectives = ['Ghostly', 'Spooky', 'Silent', 'Shadow', 'Phantom', 
            'Mysterious', 'Hidden', 'Invisible', 'Quiet', 'Swift', 'Dark', 'Ethereal'];
        const nouns = ['Ghost', 'Spirit', 'Shadow', 'Wisp', 'Specter', 
            'Soul', 'Presence', 'Echo', 'Drift', 'Mist', 'Shade', 'Echo'];
        
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const num = Math.floor(Math.random() * 999);
        
        return `${adj} ${noun} ${num}`;
    },

    /**
     * Generate an emoji avatar from peer ID
     * @param {string} peerId - Peer identifier
     * @returns {string} Emoji avatar
     */
    getAvatarEmoji(peerId) {
        const emojis = ['👻', '🎃', '🦇', '🕸️', '🕷️', '🧛', '🧟', '💀', 
            '🦉', '🌑', '⭐', '🔮', '🌙', '⚡', '🔥', '💨'];
        
        // Hash peerId to get consistent emoji
        let hash = 0;
        for (let i = 0; i < peerId.length; i++) {
            hash = ((hash << 5) - hash) + peerId.charCodeAt(i);
            hash |= 0;
        }
        
        return emojis[Math.abs(hash) % emojis.length];
    },

    /**
     * Get color from peer ID for consistent user colors
     * @param {string} peerId - Peer identifier
     * @returns {string} CSS color
     */
    getPeerColor(peerId) {
        const colors = [
            '#7c3aed', // Purple
            '#ec4899', // Pink
            '#f59e0b', // Amber
            '#10b981', // Emerald
            '#3b82f6', // Blue
            '#8b5cf6', // Violet
            '#ef4444', // Red
            '#06b6d4', // Cyan
        ];
        
        let hash = 0;
        for (let i = 0; i < peerId.length; i++) {
            hash = ((hash << 5) - hash) + peerId.charCodeAt(i);
            hash |= 0;
        }
        
        return colors[Math.abs(hash) % colors.length];
    },

    /**
     * Encode SDP for sharing (compress + base64)
     * @param {RTCSessionDescription} sdp - SDP object
     * @returns {string} Encoded string
     */
    encodeSDP(sdp) {
        const data = JSON.stringify({
            type: sdp.type,
            sdp: sdp.sdp
        });
        // Compress by removing unnecessary whitespace
        return btoa(data);
    },

    /**
     * Decode shared SDP string
     * @param {string} encoded - Encoded SDP
     * @returns {object|null} Decoded SDP or null if invalid
     */
    decodeSDP(encoded) {
        try {
            const data = atob(encoded.trim());
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to decode SDP:', e);
            return null;
        }
    },

    /**
     * Compress large SDP for shorter codes
     * @param {string} sdp - SDP string
     * @returns {string} Compressed
     */
    compressSDP(sdp) {
        // Remove ICE candidates to make it shorter (they'll be sent later)
        return sdp.replace(/a=candidate:[^\r\n]+\r\n/g, '');
    },

    /**
     * Format timestamp to readable time
     * @param {number} timestamp - Unix timestamp
     * @returns {string} Formatted time
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    },

    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                document.execCommand('copy');
                return true;
            } catch (e) {
                console.error('Copy failed:', e);
                return false;
            } finally {
                document.body.removeChild(textarea);
            }
        }
    },

    /**
     * Show temporary notification
     * @param {string} message - Message to show
     * @param {number} duration - Duration in ms
     */
    showNotification(message, duration = 2000) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg-tertiary);
            color: var(--text-primary);
            padding: 0.75rem 1.5rem;
            border-radius: var(--radius-full);
            font-size: 0.9rem;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
};

// Make available globally
window.Utils = Utils;
