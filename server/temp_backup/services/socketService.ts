import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { AuthPayload } from '../types';

interface AuthenticatedSocket extends Socket {
  user?: AuthPayload;
}

export const socketHandler = (io: SocketIOServer): void => {
  // Authentication middleware for Socket.IO
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.user?.username} (${socket.user?.userId})`);

    // Join user-specific room
    if (socket.user) {
      socket.join(`user:${socket.user.userId}`);
      socket.join(`role:${socket.user.role}`);
    }

    // Handle order updates
    socket.on('order:update', (data) => {
      console.log('Order update received:', data);
      // Broadcast to all connected clients except sender
      socket.broadcast.emit('order:updated', {
        ...data,
        timestamp: new Date().toISOString(),
        updatedBy: socket.user?.username,
      });
    });

    // Handle inventory updates
    socket.on('inventory:update', (data) => {
      console.log('Inventory update received:', data);
      // Broadcast to all connected clients
      io.emit('inventory:updated', {
        ...data,
        timestamp: new Date().toISOString(),
        updatedBy: socket.user?.username,
      });
    });

    // Handle sync status updates
    socket.on('sync:status', (data) => {
      console.log('Sync status update:', data);
      // Broadcast to user's devices only
      socket.to(`user:${socket.user?.userId}`).emit('sync:statusUpdated', {
        ...data,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle low stock alerts
    socket.on('inventory:lowStock', (data) => {
      console.log('Low stock alert:', data);
      // Send to admin and manager roles only
      io.to('role:admin').to('role:manager').emit('inventory:lowStockAlert', {
        ...data,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle new order notifications
    socket.on('order:new', (data) => {
      console.log('New order notification:', data);
      // Broadcast to all kitchen/preparation staff
      socket.broadcast.emit('order:newOrder', {
        ...data,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle payment updates
    socket.on('payment:update', (data) => {
      console.log('Payment update:', data);
      // Broadcast payment status update
      io.emit('payment:updated', {
        ...data,
        timestamp: new Date().toISOString(),
        updatedBy: socket.user?.username,
      });
    });

    // Handle client ping for connection health
    socket.on('ping', (callback) => {
      if (typeof callback === 'function') {
        callback({
          serverTime: new Date().toISOString(),
          status: 'ok',
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.user?.username} - Reason: ${reason}`);
    });

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to Smoocho Bill server',
      serverTime: new Date().toISOString(),
      user: socket.user,
    });
  });

  // Emit periodic system updates
  setInterval(() => {
    io.emit('system:heartbeat', {
      timestamp: new Date().toISOString(),
      connectedClients: io.sockets.sockets.size,
    });
  }, 30000); // Every 30 seconds
};

// Utility function to emit events from other parts of the application
export const emitToAllClients = (io: SocketIOServer, event: string, data: any): void => {
  io.emit(event, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

export const emitToUser = (io: SocketIOServer, userId: string, event: string, data: any): void => {
  io.to(`user:${userId}`).emit(event, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

export const emitToRole = (io: SocketIOServer, role: string, event: string, data: any): void => {
  io.to(`role:${role}`).emit(event, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};