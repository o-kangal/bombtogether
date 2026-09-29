import { PEER_PREFIX, ROOM_CODE_ALPHABET } from './config.js';
import { state } from './state.js';

let peer = null;
let connection = null;

export function generateRoomCode() {
    let code = '';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * ROOM_CODE_ALPHABET.length);
        code += ROOM_CODE_ALPHABET[randomIndex];
    }
    return code;
}

export function initHost(roomCode, onPeerConnected, onError) {
    closeNetwork();
    peer = new window.Peer(PEER_PREFIX + roomCode);

    peer.on('open', () => {
        state.role = "HOST";
    });

    peer.on('connection', (conn) => {
        connection = conn;
        setupConnectionListeners(onPeerConnected);
    });

    peer.on('error', (err) => {
        if (onError) onError(err);
    });
}

export function joinRoom(roomCode, onConnected, onError) {
    closeNetwork();
    peer = new window.Peer();

    peer.on('open', () => {
        state.role = "CLIENT";
        connection = peer.connect(PEER_PREFIX + roomCode.toUpperCase().trim(), {
            reliable: true
        });
        setupConnectionListeners(onConnected);
    });

    peer.on('error', (err) => {
        if (onError) onError(err);
    });
}

function setupConnectionListeners(onReady) {
    if (!connection) return;

    let triggered = false;
    const notifyReady = () => {
        if (!triggered && onReady) {
            triggered = true;
            onReady();
        }
    };

    // Immediate check if DataChannel is already established
    if (connection.open) {
        notifyReady();
    } else {
        connection.on('open', notifyReady);
    }

    connection.on('data', (data) => {
        handleIncomingData(data);
    });

    connection.on('close', () => {
        state.gameState = "GAME_OVER";
    });
}

export function sendNetworkData(packet) {
    if (connection && connection.open) {
        connection.send(packet);
    }
}

let onSnapshotReceived = null;
let onEventReceived = null;

export function setNetworkCallbacks({ onSnapshot, onEvent }) {
    onSnapshotReceived = onSnapshot;
    onEventReceived = onEvent;
}

function handleIncomingData(data) {
    if (data.type === "SNAPSHOT" && onSnapshotReceived) {
        onSnapshotReceived(data.payload);
    } else if (data.type === "INPUT" && state.role === "HOST") {
        state.remoteKeys = data.payload;
    } else if (data.type === "EVENT" && onEventReceived) {
        onEventReceived(data.payload);
    }
}

export function closeNetwork() {
    if (connection) {
        connection.close();
        connection = null;
    }
    if (peer) {
        peer.destroy();
        peer = null;
    }
}