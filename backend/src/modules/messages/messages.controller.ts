import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ChatGateway } from '../realtime/chat.gateway';

@ApiTags('messages')
@Controller('rooms/:roomId/messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Send a message to a chatroom' })
  @ApiParam({ name: 'roomId', description: 'Room UUID' })
  @ApiResponse({ status: 201, description: 'Message created successfully' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async create(
    @Param('roomId') roomId: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    const message = await this.messagesService.create(roomId, createMessageDto);
    // Broadcast via WebSocket
    this.chatGateway.broadcastNewMessage(roomId, message);
    return message;
  }

  @Get()
  @ApiOperation({ summary: 'Get all messages in a chatroom' })
  @ApiParam({ name: 'roomId', description: 'Room UUID' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Skip N messages (pagination)' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Take N messages (pagination)' })
  @ApiResponse({ status: 200, description: 'List of messages' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  findAll(
    @Param('roomId') roomId: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(100), ParseIntPipe) take?: number,
  ) {
    return this.messagesService.findAll(roomId, skip, take);
  }
}

@ApiTags('messages')
@Controller('messages')
export class MessagesDeleteController {
  constructor(private readonly messagesService: MessagesService) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a message by ID' })
  @ApiParam({ name: 'id', description: 'Message UUID' })
  @ApiResponse({ status: 204, description: 'Message deleted successfully' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  remove(@Param('id') id: string) {
    return this.messagesService.remove(id);
  }
}
