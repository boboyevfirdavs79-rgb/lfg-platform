import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SteamAuthController } from './steam-auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { RequireSteamGuard } from './require-steam.guard';

@Module({
  imports: [
    UsersModule,
    IntegrationsModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-change-me',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, JwtStrategy, RequireSteamGuard],
  controllers: [AuthController, SteamAuthController],
  exports: [AuthService, RequireSteamGuard],
})
export class AuthModule {}
