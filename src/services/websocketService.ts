import AsyncStorage from "@react-native-async-storage/async-storage";

// For React Native, we'll use a native WebSocket implementation
// In production, you might want to use socket.io-client

const API_BASE_URL = __DEV__
  ? "ws://192.168.1.100:5000" // Replace with your computer's IP address
  : "wss://your-production-api.com"; // Replace with production URL

type EventCallback = (data: any) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private isConnecting = false;
  private pingInterval: NodeJS.Timeout | null = null;

  // Connect to WebSocket server
  async connect(): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }

    if (this.isConnecting) {
      console.log("WebSocket connection in progress");
      return;
    }

    this.isConnecting = true;

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.warn("No auth token available for WebSocket");
        this.isConnecting = false;
        return;
      }

      this.socket = new WebSocket(`${API_BASE_URL}/ws?token=${token}`);

      this.socket.onopen = () => {
        console.log("✅ WebSocket connected");
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.startPing();
        this.emit("connected", {});
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const { type, payload } = data;

          if (type) {
            this.emit(type, payload);
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      this.socket.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        this.isConnecting = false;
      };

      this.socket.onclose = (event) => {
        console.log("🔌 WebSocket disconnected:", event.code, event.reason);
        this.isConnecting = false;
        this.stopPing();
        this.emit("disconnected", { code: event.code, reason: event.reason });

        // Attempt reconnection
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay =
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
          console.log(
            `🔄 Attempting reconnection in ${delay}ms (attempt ${this.reconnectAttempts})`
          );
          setTimeout(() => this.connect(), delay);
        } else {
          console.error("Max reconnection attempts reached");
          this.emit("max_reconnect_reached", {});
        }
      };
    } catch (error) {
      console.error("Failed to establish WebSocket connection:", error);
      this.isConnecting = false;
    }
  }

  // Send ping to keep connection alive
  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  // Subscribe to an event
  on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  // Emit an event to listeners
  private emit(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Remove event listener
  off(event: string, callback?: EventCallback): void {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
    } else {
      this.listeners.delete(event);
    }
  }

  // Subscribe to notifications
  onNotification(callback: EventCallback): () => void {
    return this.on("notification", callback);
  }

  // Subscribe to order updates
  onOrderUpdate(callback: EventCallback): () => void {
    return this.on("order_update", callback);
  }

  // Subscribe to payment updates
  onPaymentUpdate(callback: EventCallback): () => void {
    return this.on("payment_update", callback);
  }

  // Subscribe to chat messages
  onChatMessage(callback: EventCallback): () => void {
    return this.on("chat_message", callback);
  }

  // Subscribe to auction updates
  onAuctionUpdate(callback: EventCallback): () => void {
    return this.on("auction_update", callback);
  }

  // Send a message through WebSocket
  send(type: string, payload: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    } else {
      console.warn("WebSocket not connected, cannot send message");
    }
  }

  // Disconnect
  disconnect(): void {
    this.stopPing();
    if (this.socket) {
      this.socket.close(1000, "User initiated disconnect");
      this.socket = null;
      console.log("🔌 WebSocket disconnected manually");
    }
    this.listeners.clear();
    this.reconnectAttempts = 0;
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
const websocketService = new WebSocketService();
export default websocketService;
