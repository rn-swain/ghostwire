/**
 * Ghostwire - Main Application
 * Entry point and app orchestration
 */

const App = {
    init() {
        console.log('👻 Ghostwire initializing...');
        
        UIController.init();
        
        WebRTCManager.on({
            onMessage: (message) => {
                UIController.addMessage(message);
            },
            
            onPeerJoined: (peer) => {
                UIController.addMessage({
                    type: 'system',
                    content: `${peer.nickname} JOINED THE ROOM`,
                    timestamp: Date.now()
                });
                UIController.updatePeerCount(WebRTCManager.getPeers().length + 1);
            },
            
            onPeerLeft: (peer) => {
                UIController.addMessage({
                    type: 'system',
                    content: `${peer.nickname} LEFT THE ROOM`,
                    timestamp: Date.now()
                });
                UIController.updatePeerCount(WebRTCManager.getPeers().length + 1);
            },
            
            onConnectionStateChange: (state) => {
                console.log('Connection state:', state);
                if (state === 'connected') {
                    UIController.showChat(WebRTCManager.roomCode);
                    UIController.hideLoadingJoin();
                } else if (state === 'disconnected') {
                    UIController.showErrorModal('THE PEER DISCONNECTED FROM THE ROOM.');
                    this.leaveRoom();
                    UIController.showScreen('landing');
                }
            },
            
            onTyping: (data) => {
                if (data.isTyping) {
                    UIController.showTyping(data.nickname);
                } else {
                    UIController.hideTyping();
                }
            }
        });
        
        console.log('✅ Ghostwire ready');
    },

    async createRoom() {
        try {
            console.log('Creating room...');
            const roomCode = await WebRTCManager.createRoom();
            console.log('Room created, Code:', roomCode);
            
            UIController.showRoomCreated(roomCode);
        } catch (error) {
            console.error('Failed to create room:', error);
            UIController.showErrorModal('FAILED TO INITIALIZE PEERJS SERVER. PLEASE TRY AGAIN. ' + error);
            UIController.showScreen('landing');
        }
    },

    async joinRoom(code, nickname) {
        try {
            console.log('Joining room with code:', code);
            UIController.showLoadingJoin();
            
            // Timeout if connection takes too long
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Connection timed out. Code may be invalid.")), 10000)
            );
            
            await Promise.race([
                WebRTCManager.joinRoom(code, nickname),
                timeoutPromise
            ]);

        } catch (error) {
            console.error('Failed to join room:', error);
            UIController.hideLoadingJoin();
            UIController.showErrorModal(error.message || 'INVALID ROOM CODE OR CONNECTION FAILED.');
        }
    },

    sendMessage(content) {
        return WebRTCManager.sendMessage(content);
    },

    sendTyping(isTyping) {
        WebRTCManager.sendTyping(isTyping);
    },

    leaveRoom() {
        WebRTCManager.disconnect();
        UIController.clearMessages();
        
        // Formally clear URL hash without reloading the page
        history.pushState('', document.title, window.location.pathname);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

window.App = App;

window.addEventListener('beforeunload', (e) => {
    if (WebRTCManager.isConnected() || WebRTCManager.isCreator) {
        e.preventDefault();
        e.returnValue = 'Leaving will destroy this room and all connections.';
        return e.returnValue;
    }
});
