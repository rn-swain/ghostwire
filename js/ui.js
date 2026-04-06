/**
 * Ghostwire - UI Controller (Bento Grid Version)
 */

const UIController = {
    screens: {
        landing: null,
        create: null,
        join: null,
        chat: null
    },
    
    currentScreen: 'landing',
    messages: [],
    typingTimeout: null,

    init() {
        this.screens.landing = document.getElementById('landing-screen');
        this.screens.create = document.getElementById('create-screen');
        this.screens.join = document.getElementById('join-screen');
        this.screens.chat = document.getElementById('chat-screen');
        
        this._bindEvents();
        this._checkUrlForRoomCode();
    },

    _bindEvents() {
        // Landing Screen
        document.getElementById('btn-create').addEventListener('click', () => {
            this.showScreen('create');
            App.createRoom();
        });
        
        document.getElementById('btn-join').addEventListener('click', () => {
            this.showScreen('join');
        });
        
        // Navigation Back
        document.getElementById('btn-back-create').addEventListener('click', () => {
            this.showScreen('landing');
            App.leaveRoom(); // Cancel creation
        });
        
        document.getElementById('btn-back-join').addEventListener('click', () => {
            this.showScreen('landing');
        });
        
        // Create Screen Actions
        document.getElementById('btn-copy-code').addEventListener('click', () => {
            const code = document.getElementById('room-code').textContent;
            Utils.copyToClipboard(code);
            Utils.showNotification('ROOM CODE COPIED');
        });
        
        document.getElementById('btn-copy-link').addEventListener('click', () => {
            const link = document.getElementById('room-link').value;
            Utils.copyToClipboard(link);
            Utils.showNotification('URL LINK COPIED');
        });
        
        // Join Screen Actions
        document.getElementById('btn-join-room').addEventListener('click', () => {
            const code = document.getElementById('join-code').value.trim().toUpperCase();
            const nickname = document.getElementById('nickname').value.trim();
            
            if (!code) {
                Utils.showNotification('ENTER A ROOM CODE');
                return;
            }
            
            App.joinRoom(code, nickname);
        });

        // Error Modal Close
        document.getElementById('btn-close-error').addEventListener('click', () => {
            document.getElementById('connection-error-modal').classList.add('hidden');
        });

        // Chat Screen Actions
        document.getElementById('btn-leave').addEventListener('click', () => {
            if (confirm('DESTROY SESSION? LOGS WILL BE PURGED.')) {
                App.leaveRoom();
                this.showScreen('landing');
            }
        });
        
        document.getElementById('btn-send').addEventListener('click', () => {
            this._sendMessage();
        });
        
        document.getElementById('message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this._sendMessage();
            }
        });
        
        document.getElementById('message-input').addEventListener('input', () => {
            App.sendTyping(true);
            if (this.typingTimeout) clearTimeout(this.typingTimeout);
            this.typingTimeout = setTimeout(() => {
                App.sendTyping(false);
            }, 2000);
        });
        
        // QR Scanner Logic
        let html5QrcodeScanner = null;
        
        document.getElementById('btn-scan-qr').addEventListener('click', () => {
            const qrReaderElement = document.getElementById('qr-reader');
            qrReaderElement.classList.remove('hidden');
            document.getElementById('btn-scan-qr').classList.add('hidden');
            document.getElementById('btn-stop-scan').classList.remove('hidden');

            html5QrcodeScanner = new Html5QrcodeScanner(
                "qr-reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
            
            html5QrcodeScanner.render((decodedText, decodedResult) => {
                console.log("Scanned:", decodedText);
                
                // If it's a URL, extract the hash code
                if (decodedText.includes('#')) {
                    document.getElementById('join-code').value = decodedText.split('#')[1];
                } else {
                    document.getElementById('join-code').value = decodedText;
                }
                
                if (html5QrcodeScanner) {
                    html5QrcodeScanner.clear();
                }
                qrReaderElement.classList.add('hidden');
                document.getElementById('btn-scan-qr').classList.remove('hidden');
                document.getElementById('btn-stop-scan').classList.add('hidden');

                Utils.showNotification('QR SCANNED - JOINING...');
                document.getElementById('btn-join-room').click();
            }, (error) => {
                // Ignore empty scans
            });
        });

        document.getElementById('btn-stop-scan').addEventListener('click', () => {
            if (html5QrcodeScanner) {
                html5QrcodeScanner.clear();
            }
            document.getElementById('qr-reader').classList.add('hidden');
            document.getElementById('btn-scan-qr').classList.remove('hidden');
            document.getElementById('btn-stop-scan').classList.add('hidden');
        });
    },

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            if (screen) screen.classList.remove('active');
        });
        
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
            this.currentScreen = screenName;
        }

        // Reset creation UI if leaving creation screen
        if (screenName !== 'create') {
            document.getElementById('create-status-box').classList.remove('hidden');
            document.getElementById('create-ready-controls').classList.add('hidden');
            document.getElementById('create-qr-box').classList.add('hidden');
            document.getElementById('create-status-text').textContent = 'ESTABLISHING NETWORK...';
            document.getElementById('create-status-text').classList.add('blink');
        }
    },

    _checkUrlForRoomCode() {
        const hash = window.location.hash.slice(1);
        if (hash) {
            document.getElementById('join-code').value = hash.toUpperCase();
            this.showScreen('join');
            // Auto-focus nickname so they know to fill it out
            document.getElementById('nickname').focus();
        }
    },

    showRoomCreated(roomCode) {
        document.getElementById('create-status-box').classList.add('hidden');
        document.getElementById('create-ready-controls').classList.remove('hidden');
        document.getElementById('create-qr-box').classList.remove('hidden');
        
        document.getElementById('room-code').textContent = roomCode;
        
        const baseUrl = window.location.origin + window.location.pathname;
        const fullUrl = `${baseUrl}#${roomCode}`;
        document.getElementById('room-link').value = fullUrl;
        
        // Generate QR code encoding the URL
        const qrContainer = document.getElementById('qr-code');
        qrContainer.innerHTML = '';
        new QRCode(qrContainer, {
            text: fullUrl,
            width: 200,
            height: 200,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.L
        });
    },

    showLoadingJoin() {
        const btn = document.getElementById('btn-join-room');
        btn.textContent = 'CONNECTING...';
        btn.disabled = true;
    },

    hideLoadingJoin() {
        const btn = document.getElementById('btn-join-room');
        btn.textContent = 'CONNECT';
        btn.disabled = false;
    },

    showErrorModal(message) {
        document.getElementById('error-message').textContent = message;
        document.getElementById('connection-error-modal').classList.remove('hidden');
    },

    showChat(roomCode) {
        this.showScreen('chat');
        document.getElementById('chat-room-name').textContent = roomCode;
    },

    addMessage(message, isOwn = false) {
        const container = document.getElementById('chat-messages');
        
        const messageEl = document.createElement('div');
        messageEl.className = `message ${isOwn ? 'own' : 'other'}`;
        
        if (message.type === 'system') {
            messageEl.className = 'system-message neo-box';
            messageEl.innerHTML = `${message.content}`;
        } else {
            const time = Utils.formatTime(message.timestamp);
            const avatar = isOwn ? '' : Utils.getAvatarEmoji(message.from);
            
            messageEl.innerHTML = `
                <div class="message-header">
                    ${!isOwn ? `<span>${avatar} ${message.nickname}</span>` : '<span>YOU</span>'}
                </div>
                <div class="message-content">${this._escapeHtml(message.content)}</div>
                <div class="message-time">${time}</div>
            `;
        }
        
        container.appendChild(messageEl);
        container.scrollTop = container.scrollHeight;
        
        this.messages.push(message);
    },

    showTyping(nickname) {
        const indicator = document.getElementById('typing-indicator');
        const text = document.getElementById('typing-text');
        text.textContent = `${nickname} IS TYPING...`;
        indicator.classList.remove('hidden');
    },

    hideTyping() {
        document.getElementById('typing-indicator').classList.add('hidden');
    },

    updatePeerCount(count) {
        document.getElementById('peer-count').textContent = `${count} PEERS`;
    },

    _sendMessage() {
        const input = document.getElementById('message-input');
        const content = input.value.trim();
        
        if (!content) return;
        
        const message = App.sendMessage(content);
        this.addMessage(message, true);
        
        input.value = '';
        App.sendTyping(false);
    },

    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    clearMessages() {
        document.getElementById('chat-messages').innerHTML = `
            <div class="system-message neo-box">
                CONNECTED - CHAT IS LIVE & P2P.
            </div>
        `;
        this.messages = [];
    }
};

window.UIController = UIController;
