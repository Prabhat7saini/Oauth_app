import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { FindUser, IfindROle } from '../../utils/interface/type';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { SignUpDto } from '../dto/userDto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async register(userData: SignUpDto, role: Role): Promise<void> {
    try {
      // Attempt to create the user
      await this.userRepository.register(userData, role);
    } catch (error) {
      // Log the error for debugging purposes
      console.error('Error occurred during user registration:', error);

      // Throw a generic error response
      throw new HttpException(
        'An error occurred while registering the user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUser({ email, id }: FindUser): Promise<User> {
    try {
      const user = await this.userRepository.findUser({ email });
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getRole({roleName,roleId}: IfindROle): Promise<Role> {
    try {
      console.log(`getRole ${roleName}`);
      const role = await this.userRepository.findRole({ roleName });
      return role;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
