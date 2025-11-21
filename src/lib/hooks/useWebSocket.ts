/**
 * useWebSocket Hook
 * - WebSocket 연결
 * - 양방향 통신
 * - 자동 재연결
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseWebSocketOptions {
  enabled?: boolean;
  reconnect?: boolean;
  reconnectDelay?: number;
  heartbeatInterval?: number;
}

export function useWebSocket<T = any>(
  url: string,
  options: UseWebSocketOptions = {}
) {
  const {
    enabled = true,
    reconnect = true,
    reconnectDelay = 5000,
    heartbeatInterval = 30000,
  } = options;

  const [messages, setMessages] = useState<T[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!enabled) return;
    
    try {
      const wsUrl = `ws://localhost:3000/api/ws${url}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('[WebSocket] Connection opened:', url);
        setIsConnected(true);
        setError(null);
        
        // Heartbeat 시작
        if (heartbeatInterval > 0) {
          heartbeatIntervalRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'ping' }));
            }
          }, heartbeatInterval);
        }
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as T;
          
          // Pong 메시지는 무시
          if ((message as any).type === 'pong') {
            return;
          }
          
          setMessages((prev) => [...prev, message]);
        } catch (err) {
          console.error('[WebSocket] Failed to parse message:', err);
        }
      };
      
      ws.onerror = (err) => {
        console.error('[WebSocket] Connection error:', err);
        setError(new Error('WebSocket connection failed'));
      };
      
      ws.onclose = () => {
        console.log('[WebSocket] Connection closed');
        setIsConnected(false);
        
        // Heartbeat 정리
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }
        
        // 자동 재연결
        if (reconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('[WebSocket] Attempting to reconnect...');
            connect();
          }, reconnectDelay);
        }
      };
      
      wsRef.current = ws;
    } catch (err) {
      console.error('[WebSocket] Failed to create connection:', err);
      setError(err as Error);
    }
  }, [url, enabled, reconnect, reconnectDelay, heartbeatInterval]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const send = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Cannot send message, connection not open');
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    messages,
    isConnected,
    error,
    send,
    clearMessages,
    reconnect: connect,
    disconnect,
  };
}

