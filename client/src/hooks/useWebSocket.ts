import React, { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react';
import { WebSocketMessage } from '@shared/schema';

type WebSocketContextType = {
  sendMessage: (message: any) => void;
  lastMessage: WebSocketMessage | null;
  connected: boolean;
};

const WebSocketContext = createContext<WebSocketContextType>({
  sendMessage: () => {},
  lastMessage: null,
  connected: false,
});

export const useWebSocket = () => useContext(WebSocketContext);

type WebSocketProviderProps = {
  children: ReactNode;
};

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const connectWebSocket = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
    };
    
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        setLastMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        connectWebSocket();
      }, 2000);
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      socket.close();
    };
    
    socketRef.current = socket;
    
    return () => {
      socket.close();
    };
  }, []);
  
  useEffect(() => {
    const cleanup = connectWebSocket();
    
    return () => {
      cleanup();
      socketRef.current = null;
    };
  }, [connectWebSocket]);
  
  const sendMessage = useCallback((message: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);
  
  const value = {
    sendMessage,
    lastMessage,
    connected
  };
  
  return React.createElement(
    WebSocketContext.Provider,
    { value },
    children
  );
}
