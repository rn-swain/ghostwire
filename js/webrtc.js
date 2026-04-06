/**
 * Ghostwire - WebRTC Manager (powered by PeerJS)
 */

const WebRTCManager = {
    peer: null,
    connection: null,
    peerId: null,
    nickname: '',
    roomCode: '',
    isCreator: false,
    
    // Connected peers tracking
    peers: new Map(), // Only 1-to-1 currently supported, but tracked in Map like before
    
    callbacks: {
        onMessage: null,
        onPeerJoined: null,
        onPeerLeft: null,
        onConnectionStateChange: null,
        onTyping: null
    },

    /**
     * Create a room (Creator)
     * Generate a short Peer ID, connect to PeerJS server, and listen for incoming connections
     */
    createRoom() {
        return new Promise((resolve, reject) => {
            this.isCreator = true;
            this.roomCode = Utils.generateRoomCode(); // e.g. ABC-DEF
            this.nickname = Utils.generateNickname();
            this.peerId = `ghostwire-${this.roomCode}`;

            this.peer = new Peer(this.peerId, {
                debug: 2
            });

            this.peer.on('open', (id) => {
                console.log('Peer created with ID:', id);
                resolve(this.roomCode);
            });

            this.peer.on('connection', (conn) => {
                console.log('Incoming connection from:', conn.peer);
                this._setupConnection(conn);
            });

            this.peer.on('error', (err) => {
                console.error('PeerJS error:', err);
                reject(err);
            });
        });
    },

    /**
     * Join Room (Joiner)
     * Initialize anonymous peer, then connect to creator's short room code
     */
    joinRoom(code, nickname) {
        return new Promise((resolve, reject) => {
            this.isCreator = false;
            this.roomCode = code.toUpperCase();
            this.nickname = nickname || Utils.generateNickname();
            this.peerId = `ghostwire-joiner-${Utils.generateRoomCode()}`;

            this.peer = new Peer(this.peerId, {
                debug: 2
            });

            this.peer.on('open', (id) => {
                console.log('My joiner ID is:', id);
                // Connect to creator
                const remotePeerId = `ghostwire-${this.roomCode}`;
                const conn = this.peer.connect(remotePeerId, {
                    reliable: true
                });

                conn.on('open', () => {
                    console.log('Connected to creator!');
                    this._setupConnection(conn);
                    resolve();
                });

                conn.on('error', (err) => {
                    console.error('Connection error:', err);
                    reject(err);
                });
            });

            this.peer.on('error', (err) => {
                console.error('PeerJS error:', err);
                reject(err);
            });
        });
    },

    /**
     * Setup PeerJS DataConnection events
     */
    _setupConnection(conn) {
        this.connection = conn;

        conn.on('data', (data) => {
            this._handleProtocolMessage(data);
        });

        conn.on('close', () => {
            console.log('Connection closed');
            if (this.callbacks.onConnectionStateChange) {
                this.callbacks.onConnectionStateChange('disconnected');
            }
        });

        conn.on('error', (err) => {
            console.error('Connection error:', err);
        });

        // Trigger connected state change immediately
        if (this.callbacks.onConnectionStateChange) {
            this.callbacks.onConnectionStateChange('connected');
        }

        // Send initial presence message
        this._sendProtocolMessage({
            type: 'presence',
            peerId: this.peerId,
            nickname: this.nickname,
            timestamp: Date.now()
        });
    },

    _handleProtocolMessage(message) {
        switch (message.type) {
            case 'chat':
                if (this.callbacks.onMessage) {
                    this.callbacks.onMessage(message);
                }
                break;
                
            case 'presence':
                if (!this.peers.has(message.peerId)) {
                    this.peers.set(message.peerId, {
                        nickname: message.nickname,
                        avatar: Utils.getAvatarEmoji(message.peerId),
                        color: Utils.getPeerColor(message.peerId),
                        joinedAt: message.timestamp
                    });
                    
                    if (this.callbacks.onPeerJoined) {
                        this.callbacks.onPeerJoined(message);
                    }
                }
                break;
                
            case 'typing':
                if (this.callbacks.onTyping) {
                    this.callbacks.onTyping(message);
                }
                break;
                
            case 'system':
                if (this.callbacks.onMessage) {
                    this.callbacks.onMessage(message);
                }
                break;
        }
    },

    sendMessage(content) {
        const message = {
            id: 'msg-' + Math.random().toString(36).substr(2, 9),
            type: 'chat',
            from: this.peerId,
            nickname: this.nickname,
            content: content,
            timestamp: Date.now()
        };
        
        this._sendProtocolMessage(message);
        return message;
    },

    sendTyping(isTyping) {
        this._sendProtocolMessage({
            type: 'typing',
            from: this.peerId,
            nickname: this.nickname,
            isTyping: isTyping,
            timestamp: Date.now()
        });
    },

    _sendProtocolMessage(message) {
        if (this.connection && this.connection.open) {
            this.connection.send(message);
        }
    },

    getPeers() {
        return Array.from(this.peers.entries()).map(([id, info]) => ({
            id,
            ...info
        }));
    },

    disconnect() {
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
        
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
        
        this.peers.clear();
        this.peerId = null;
        this.nickname = '';
        this.roomCode = '';
        this.isCreator = false;
    },

    isConnected() {
        return this.connection && this.connection.open;
    },

    on(callbacks) {
        Object.assign(this.callbacks, callbacks);
    }
};

window.WebRTCManager = WebRTCManager;
