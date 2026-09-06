import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

/**
 * Post yaratish yoki e'longa so'rov yuborish kabi amallar uchun Steam
 * akkounti ulangan bo'lishi shart. JwtAuthGuard'dan KEYIN ishlatilishi kerak.
 */
@Injectable()
export class RequireSteamGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const userId = req.user?.userId;
    if (!userId) return false;

    const user = await this.usersService.findById(userId);
    if (!user?.steamId) {
      throw new ForbiddenException(
        'Bu amal uchun avval Steam akkountingizni ulashingiz kerak',
      );
    }
    return true;
  }
}
