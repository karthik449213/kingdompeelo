import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/lib/utils';

const WS_URL = import.meta.env.VITE_WS_URL || API_BASE_URL;

let socket: Socket | null = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      socket = io(WS_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      socket.on('connect', () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      });
    }

    return () => {
      // Don't disconnect on unmount - keep connection alive
    };
  }, []);

  return { socket, isConnected };
}

export function useOrderUpdates(onNewOrder: (order: any) => void, onStatusUpdate: (data: any) => void) {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('new_order', onNewOrder);
    socket.on('order_status_updated', onStatusUpdate);

    return () => {
      socket?.off('new_order', onNewOrder);
      socket?.off('order_status_updated', onStatusUpdate);
    };
  }, [socket, isConnected, onNewOrder, onStatusUpdate]);

  return { socket, isConnected };
}

export function useDashboardSocket() {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join admin dashboard room
    socket.emit('join_dashboard', {});

    return () => {
      socket?.emit('leave_dashboard', {});
    };
  }, [socket, isConnected]);

  return { socket, isConnected };
}

export function playNotificationSound() {
  // Create a simple beep sound
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800; // 800 Hz
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}

export default useSocket;
