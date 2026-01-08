import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRoomDto: CreateRoomDto) {
    try {
      return await this.prisma.room.create({
        data: createRoomDto,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Room name already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.room.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto) {
    try {
      const room = await this.prisma.room.update({
        where: { id },
        data: updateRoomDto,
      });
      return room;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Room with ID ${id} not found`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Room name already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.room.delete({
        where: { id },
      });
      return { message: 'Room deleted successfully' };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Room with ID ${id} not found`);
      }
      throw error;
    }
  }
}
