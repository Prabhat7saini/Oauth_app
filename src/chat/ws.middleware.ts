import { Socket } from 'socket.io';
import { WsAuthenticationGuard } from 'src/auth/guard/wsauthentication.guard';

export type ISocketMiddleware = (
  client: Socket,
  next: (err?: Error) => void,
) => void;

export const SocketAuthMiddleware = (): ISocketMiddleware => {
  // const guard = new WsAuthenticationGuard();

  return (client, next) => {
    try {
      const token = WsAuthenticationGuard.validateToken(client); // Call the validateToken method
      //   console.log(token)
      next(); // Proceed to the next middleware if the token is valid
    } catch (error) {
      next(error); // Pass the error to the next middleware
    }
  };
};
