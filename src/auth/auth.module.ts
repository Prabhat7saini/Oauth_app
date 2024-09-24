import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { ResponseService } from '../utils/responses/ResponseService';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthenticationGuard } from './guard/authenticaton.guard';
import { AuthorizationGuard } from './guard/authorization.guard';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot(), // Ensure ConfigModule is imported
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    ResponseService,
    JwtService,
    AuthenticationGuard,
    AuthorizationGuard,
  ],
  exports: [AuthenticationGuard, AuthorizationGuard],
})
export class AuthModule {}
