import { io, Socket } from 'socket.io-client';

const serveIp = 'http://127.0.0.1:7382';
export let socket: Socket;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectDelay = 3000;

function connectWebSocket(userId: string): Socket {
  const socket = io(serveIp, {
    reconnectionAttempts: maxReconnectAttempts,
    reconnectionDelay: reconnectDelay,
    transports: ['websocket'],
    query: {
      userId
    }
  });

  socket.on('connect', () => {
    console.log('Connected to Socket.IO server');
    reconnectAttempts = 0;
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.IO Error:', error);
    console.error('Connection details:', {
      url: serveIp,
      transports: ['websocket'],
      timestamp: new Date().toISOString()
    });

    if (reconnectAttempts < maxReconnectAttempts) {
      console.log(`Attempting to reconnect (${reconnectAttempts + 1}/${maxReconnectAttempts})...`);
      reconnectAttempts++;
    } else {
      console.error('Max reconnection attempts reached');
      console.error('Please check if the server is running and listening on port 7382');
    }
  });

  socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
      console.log(`Connection closed by server, reason=${reason}`);
    } else {
      console.error(`Connection abruptly closed. Reason: ${reason || 'unknown'}`);
    }
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function sendMessage(message: string, receiver?: string, sender?: string,) {
  console.log('Attempting to send message:', receiver);
  console.log('Socket.IO connection state:', socket.connected);

  if (socket.connected) {
    try {
      socket.emit('message', {
        message,
        sender,
        receiver,
        timestamp: new Date()
      });
      console.log('Message sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  } else {
    console.error('Cannot send message - Socket.IO not connected');
    return false;
  }
}

// const userSocketMap = new Map<string, Socket>();

export function initWebSocket(userId: string) {
  socket = connectWebSocket(userId);
  return socket;
}
