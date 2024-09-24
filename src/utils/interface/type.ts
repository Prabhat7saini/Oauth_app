import { User } from '../../user/entities/user.entity';

interface JwtPayload {
  id: string;
  role: string;
}

export interface CustomRequest extends Request {
  user?: JwtPayload;
}

export interface FindUser {
  email?: string;
  id?: string;
}
export interface Users {
  user: User;
}

export interface IfindROle {
  roleId?: string;
  roleName?: string;
}
