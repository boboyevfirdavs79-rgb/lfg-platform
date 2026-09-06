import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Bu email allaqachon ro\'yxatdan o\'tgan');
    }
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      username: dto.username,
      email: dto.email,
      password: hashed,
      region: dto.region,
    });
    return this.buildToken(user.id, user.email, user.username);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email yoki parol noto\'g\'ri');
    }
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Email yoki parol noto\'g\'ri');
    }
    return this.buildToken(user.id, user.email, user.username);
  }

  private buildToken(sub: string, email: string, username: string) {
    const payload = { sub, email, username };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: sub, email, username },
    };
  }
}
