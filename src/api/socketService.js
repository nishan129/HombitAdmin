import { io } from "socket.io-client";
import { host } from "./config";

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(userId, role) {
    if (!this.socket) {
      this.socket = io(host, {
        transports: ["websocket", "polling"], // Explicitly set both transports
        withCredentials: true, // If needed for authentication (e.g., session cookies)
        extraHeaders: {
          "my-custom-header": "abcd", // Optional: add any custom headers if needed
        },
      });
      this.socket.emit("userConnected", { userId, role });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketService();
