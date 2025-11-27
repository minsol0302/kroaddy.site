/**
 * useSSE Hook
 * - Server-Sent Events 연결
 * - 실시간 데이터 수신
 * - 자동 재연결
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseSSEOptions {
  enabled?: boolean;
  reconnect?: boolean;
  reconnectDelay?: number;
}

export function useSSE<T>(
  endpoint: string,
  options: UseSSEOptions = {}
) {
  const {
    enabled = true,
    reconnect = true,
    reconnectDelay = 5000,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!enabled) return;
    
    try {
      // EventSource 연결
      const url = `/api/sse${endpoint}`;
      const eventSource = new EventSource(url);
      
      eventSource.onopen = () => {
        console.log('[SSE] Connection opened:', endpoint);
        setIsConnected(true);
        setError(null);
      };
      
      eventSource.onmessage = (event) => {
        try {
          const newData = JSON.parse(event.data) as T;
          setData((prev) => [...prev, newData]);
        } catch (err) {
          console.error('[SSE] Failed to parse message:', err);
        }
      };
      
      eventSource.onerror = (err) => {
        console.error('[SSE] Connection error:', err);
        setIsConnected(false);
        setError(new Error('SSE connection failed'));
        
        // 자동 재연결
        if (reconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('[SSE] Attempting to reconnect...');
            connect();
          }, reconnectDelay);
        }
      };
      
      eventSourceRef.current = eventSource;
    } catch (err) {
      console.error('[SSE] Failed to create EventSource:', err);
      setError(err as Error);
    }
  }, [endpoint, enabled, reconnect, reconnectDelay]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const clearData = () => {
    setData([]);
  };

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    data,
    isConnected,
    error,
    clearData,
    reconnect: connect,
    disconnect,
  };
}

