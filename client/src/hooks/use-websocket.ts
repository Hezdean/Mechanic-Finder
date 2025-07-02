import { useEffect, useRef, useState } from 'react';
import { useAuth } from './use-auth';
import { queryClient } from '@/lib/queryClient';
import { useToast } from './use-toast';

interface WebSocketMessage {
  event: string;
  data: any;
  timestamp: string;
}

export const useWebSocket = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = () => {
    if (!token || !user) {
      return;
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Authenticate with the server
        ws.send(JSON.stringify({
          type: 'auth',
          token: token
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          if (token && user) {
            connect();
          }
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  };

  const handleMessage = (message: WebSocketMessage) => {
    console.log('WebSocket message received:', message);

    switch (message.event) {
      case 'auth_success':
        console.log('WebSocket authenticated successfully');
        break;

      case 'auth_error':
        console.error('WebSocket authentication failed:', message.data);
        toast({
          title: "Connection Error",
          description: "Failed to establish real-time connection",
          variant: "destructive"
        });
        break;

      case 'job_created':
        // Invalidate jobs list for mechanics
        if (user?.role === 'mechanic') {
          queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
          toast({
            title: "New Job Available",
            description: `${message.data.title} - ${message.data.vehicle}`,
          });
        }
        break;

      case 'bid_received':
        // Invalidate job details for job owner
        if (user?.id === message.data.job.userId) {
          queryClient.invalidateQueries({ queryKey: [`/api/jobs/${message.data.job.id}`] });
          queryClient.invalidateQueries({ queryKey: [`/api/jobs?userId=${user.id}`] });
          toast({
            title: "New Bid Received",
            description: `${message.data.mechanic.firstName} ${message.data.mechanic.lastName} bid $${message.data.bid.amount}`,
          });
        }
        break;

      case 'bid_accepted':
        // Invalidate relevant queries for mechanic
        if (user?.id === message.data.bid.mechanicId) {
          queryClient.invalidateQueries({ queryKey: [`/api/jobs/${message.data.job.id}`] });
          queryClient.invalidateQueries({ queryKey: ['/api/mechanic/bids'] });
          queryClient.invalidateQueries({ queryKey: ['/api/messages/unread'] });
          toast({
            title: "Bid Accepted! 🎉",
            description: `Your bid for "${message.data.job.title}" was accepted!`,
          });
        }
        break;

      case 'bid_rejected':
        // Invalidate relevant queries for mechanic
        if (user?.id === message.data.bid.mechanicId) {
          queryClient.invalidateQueries({ queryKey: [`/api/jobs/${message.data.job.id}`] });
          queryClient.invalidateQueries({ queryKey: ['/api/mechanic/bids'] });
          queryClient.invalidateQueries({ queryKey: ['/api/messages/unread'] });
          toast({
            title: "Bid Not Selected",
            description: `Another mechanic was selected for "${message.data.job.title}"`,
            variant: "destructive"
          });
        }
        break;

      case 'job_updated':
        // Invalidate job details and user's jobs list
        if (user?.id === message.data.userId) {
          queryClient.invalidateQueries({ queryKey: [`/api/jobs/${message.data.id}`] });
          queryClient.invalidateQueries({ queryKey: [`/api/jobs?userId=${user.id}`] });
          toast({
            title: "Job Updated",
            description: `"${message.data.title}" status changed to ${message.data.status.replace('_', ' ')}`,
          });
        }
        break;

      case 'mechanic_arrival_verified':
        // Invalidate job details for customer
        if (user?.id === message.data.job.userId) {
          queryClient.invalidateQueries({ queryKey: [`/api/jobs/${message.data.job.id}`] });
          toast({
            title: "Mechanic Arrival Verified ✓",
            description: "Payment is now available for this job",
          });
        }
        break;

      case 'arrival_confirmed':
        // Invalidate job details for mechanic
        if (user?.id === message.data.job.assignedMechanicId) {
          queryClient.invalidateQueries({ queryKey: [`/api/jobs/${message.data.job.id}`] });
          toast({
            title: "Arrival Confirmed ✓",
            description: "Customer has verified your arrival",
          });
        }
        break;

      default:
        console.log('Unhandled WebSocket message:', message);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  };

  // Connect when user and token are available
  useEffect(() => {
    if (token && user) {
      connect();
    } else {
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [token, user]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    connect,
    disconnect
  };
};