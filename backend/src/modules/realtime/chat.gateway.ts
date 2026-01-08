import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { MessagesService } from '../messages/messages.service';
import { CreateMessageDto } from '../messages/dto/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly roomClients = new Map<string, Set<string>>(); // roomId -> Set of socketIds

  constructor(private readonly messagesService: MessagesService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove client from all rooms
    this.roomClients.forEach((clients, roomId) => {
      if (clients.has(client.id)) {
        clients.delete(client.id);
        if (clients.size === 0) {
          this.roomClients.delete(roomId);
        }
      }
    });
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const { roomId } = data;
    
    if (!roomId) {
      client.emit('error', { message: 'roomId is required' });
      return;
    }

    // Join the Socket.IO room
    client.join(roomId);

    // Track client in room
    if (!this.roomClients.has(roomId)) {
      this.roomClients.set(roomId, new Set());
    }
    this.roomClients.get(roomId)!.add(client.id);

    this.logger.log(`Client ${client.id} joined room ${roomId}`);
    
    // Notify client
    client.emit('joined_room', { roomId });
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; senderName: string; content: string },
  ) {
    const { roomId, senderName, content } = data;

    if (!roomId || !senderName || !content) {
      client.emit('error', { message: 'roomId, senderName, and content are required' });
      return;
    }

    try {
      // Create message in database
      const message = await this.messagesService.create(roomId, {
        senderName,
        content,
      });

      // Broadcast to all clients in the room
      this.server.to(roomId).emit('new_message', message);

      return { success: true, message };
    } catch (error: any) {
      this.logger.error(`Error sending message: ${error.message}`);
      client.emit('error', { message: error.message || 'Failed to send message' });
      return { success: false, error: error.message };
    }
  }

  // Method to broadcast message when created via REST API
  broadcastNewMessage(roomId: string, message: any) {
    this.server.to(roomId).emit('new_message', message);
    this.logger.log(`Broadcasted new message to room ${roomId}`);
  }
}
