import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ClientNats } from '@nestjs/microservices';
import { verify } from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthenticationGuard implements CanActivate {
  private readonly logger = new Logger(WsAuthenticationGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== 'ws') {
      return true;
    }
    const client: Socket = context.switchToWs().getClient();

    try {
      WsAuthenticationGuard.validateToken(client);
      return true;
    } catch (error) {
      this.logger.error('Authentication failed', error);
      return false;
    }
  }

  static validateToken(client: Socket) {
    const token =
      client.handshake.headers.authorization?.split(' ')[1] ||
      client.handshake.auth.token;
    // console.log('validateToken', token,client.handshake.auth.token);
    // const request = context.switchToHttp().getRequest();
    if (!token) {
      throw new Error('Token not provided');
    }

    try {
      const payload = verify(token, '12333qwer'); // Replace with your actual secret
      client.handshake.auth.user = payload;

      console.log(payload);
      // client.handshake.user = payload; // Now TypeScript should not complain here
      return payload;
    } catch (error) {
      console.log(error.message, 'error wsgraud');
      throw new Error('Invalid token');
    }
  }
}
