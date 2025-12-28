import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // Connect to WebSocket server
  connect(token: string) {
    if (this.socket?.connected) {
      console.log("WebSocket already connected");
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ WebSocket connected");
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 WebSocket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ WebSocket connection error:", error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("Max reconnection attempts reached");
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
    });

    // Ping/pong for connection health
    this.socket.on("pong", () => {
      // Connection is healthy
    });
  }

  // Subscribe to notifications
  onNotification(callback: (notification: any) => void) {
    if (!this.socket) {
      console.warn("Socket not connected");
      return;
    }

    this.socket.on("notification", callback);
  }

  // Subscribe to order updates
  onOrderUpdate(callback: (update: any) => void) {
    if (!this.socket) return;
    this.socket.on("order_update", callback);
  }

  // Subscribe to payment updates
  onPaymentUpdate(callback: (update: any) => void) {
    if (!this.socket) return;
    this.socket.on("payment_update", callback);
  }

  // Remove specific listener
  off(event: string, callback?: (...args: any[]) => void) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  // Send ping to keep connection alive
  ping() {
    if (this.socket?.connected) {
      this.socket.emit("ping");
    }
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log("🔌 WebSocket disconnected manually");
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket instance (for advanced usage)
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const wsService = new WebSocketService();
