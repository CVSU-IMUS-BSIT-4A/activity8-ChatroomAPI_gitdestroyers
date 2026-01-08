import { Module, forwardRef } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [forwardRef(() => MessagesModule)],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class RealtimeModule {}
