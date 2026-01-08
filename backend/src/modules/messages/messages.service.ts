import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(roomId: string, createMessageDto: CreateMessageDto) {
    // Verify room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    return this.prisma.message.create({
      data: {
        roomId,
        ...createMessageDto,
      },
      include: {
        room: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(roomId: string, skip?: number, take?: number) {
    // Verify room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    return this.prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
      skip,
      take,
    });
  }

  async remove(id: string) {
    try {
      await this.prisma.message.delete({
        where: { id },
      });
      return { message: 'Message deleted successfully' };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Message with ID ${id} not found`);
      }
      throw error;
    }
  }
}
