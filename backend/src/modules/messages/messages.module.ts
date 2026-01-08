import { Module, forwardRef } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController, MessagesDeleteController } from './messages.controller';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [forwardRef(() => RealtimeModule)],
  controllers: [MessagesController, MessagesDeleteController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
