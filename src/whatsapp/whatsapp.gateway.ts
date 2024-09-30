import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WhatsappService } from './whatsapp.service';
import { forwardRef, Inject } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins for testing, change this in production
    credentials: true,
  },
})
export class WhatsappGateway {
  @WebSocketServer() server: Server;

  constructor(
    @Inject(forwardRef(() => WhatsappService))
    private readonly whatsappService: WhatsappService,
  ) {}
  // When a user registers, generate and send the QR code immediately
  @SubscribeMessage('registerUser')
  handleRegisterUser(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('regiter');
    this.whatsappService.generateQrCodeForUser(userId, client.id); // Generate the QR for this user
  }

  // Emit the QR code to the specific user using their socket ID
  emitQrCodeToUser(socketId: string, qrCodeData: string) {
    console.log(`Emitting QR Code to socket ID: ${socketId}`); // Debugging log to ensure the correct socket ID
    this.server.to(socketId).emit('qrCode', { qrCodeData });
  }

  // Notify frontend that the QR code has been scanned successfully
  emitQrScannedToUser(socketId: string) {
    this.server.to(socketId).emit('qrScanned');
  }
}
