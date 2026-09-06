import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepo: Repository<Message>,
    private readonly usersService: UsersService,
  ) {}

  async send(senderId: string, dto: SendMessageDto) {
    if (senderId === dto.receiverId) {
      throw new BadRequestException("O'zingizga xabar yubora olmaysiz");
    }
    const receiver = await this.usersService.findById(dto.receiverId);
    if (!receiver) throw new NotFoundException('Qabul qiluvchi topilmadi');

    const message = this.messagesRepo.create({
      sender: { id: senderId } as any,
      receiver: { id: dto.receiverId } as any,
      content: dto.content,
    });
    return this.messagesRepo.save(message);
  }

  /** Foydalanuvchi bilan xabar almashgan barcha odamlarning ro'yxati, oxirgi xabar bilan. */
  async getConversations(userId: string) {
    const messages = await this.messagesRepo
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where('message.senderId = :userId OR message.receiverId = :userId', { userId })
      .orderBy('message.createdAt', 'DESC')
      .getMany();

    const conversations = new Map<
      string,
      { user: any; lastMessage: Message; unreadCount: number }
    >();

    for (const message of messages) {
      const isSender = message.sender.id === userId;
      const otherUser = isSender ? message.receiver : message.sender;

      if (!conversations.has(otherUser.id)) {
        conversations.set(otherUser.id, {
          user: {
            id: otherUser.id,
            username: otherUser.username,
            steamAvatar: otherUser.steamAvatar,
          },
          lastMessage: message,
          unreadCount: 0,
        });
      }
      if (!isSender && !message.isRead) {
        conversations.get(otherUser.id)!.unreadCount += 1;
      }
    }

    return Array.from(conversations.values());
  }

  /** Ikki foydalanuvchi orasidagi barcha xabarlar, eskisidan yangisiga qarab. */
  async getThread(userId: string, otherUserId: string) {
    const messages = await this.messagesRepo
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where(
        '(message.senderId = :userId AND message.receiverId = :otherUserId) OR (message.senderId = :otherUserId AND message.receiverId = :userId)',
        { userId, otherUserId },
      )
      .orderBy('message.createdAt', 'ASC')
      .getMany();

    // Menga kelgan o'qilmagan xabarlarni "o'qildi" deb belgilaymiz
    const unreadIds = messages
      .filter((m) => m.receiver.id === userId && !m.isRead)
      .map((m) => m.id);
    if (unreadIds.length > 0) {
      await this.messagesRepo.update(unreadIds, { isRead: true });
    }

    return messages;
  }
}
