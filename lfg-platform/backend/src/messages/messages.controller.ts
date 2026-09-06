import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  getConversations(@Req() req: any) {
    return this.messagesService.getConversations(req.user.userId);
  }

  @Get('thread/:userId')
  getThread(@Param('userId') otherUserId: string, @Req() req: any) {
    return this.messagesService.getThread(req.user.userId, otherUserId);
  }

  @Post()
  send(@Body() dto: SendMessageDto, @Req() req: any) {
    return this.messagesService.send(req.user.userId, dto);
  }
}
