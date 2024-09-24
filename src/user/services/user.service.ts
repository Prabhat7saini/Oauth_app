import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { CustomRequest, FindUser, IfindROle } from '../../utils/interface/type';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { SignUpDto, UpdateUserDto } from '../dto/userDto';
import { ApiResponse } from 'src/utils/responses/api-response.dto';
import { ResponseService } from 'src/utils/responses/ResponseService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from 'src/utils/constants/message';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly responseService: ResponseService,
  ) {}

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
      const user = await this.userRepository.findUser(
        email ? { email } : { id },
      );
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getRole({ roleName, roleId }: IfindROle): Promise<Role> {
    try {
      console.log(`getRole ${roleName}`);
      const role = await this.userRepository.findRole({ roleName });
      return role;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async saveUser(user: User): Promise<User> {
    try {
      return await this.userRepository.saveUser(user);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateUser(
    user: UpdateUserDto,
    req: CustomRequest,
  ): Promise<ApiResponse> {
    try {
      const { id } = req.user;
      const user = await this.getUser({ id });
      if (!user) {
        // this.logger.warn(
        //   `inside the update by admin User with ID ${id} not found.`,
        // );
        return this.responseService.error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      if (!user.isActive) {
        // this.logger.warn(
        //   `You are not update the user details because the user are not active`,
        // );
        return this.responseService.error(
          ERROR_MESSAGES.NOT_ALLOWED_TO_UPDATE_INACTIVE_USER,
        );
      }
      const updateUser = await this.userRepository.updateUserDetails(id, user);
      return this.responseService.success(
        SUCCESS_MESSAGES.USER_UPDATED_SUCCESSFULLY,
        200,
        updateUser,
      );
    } catch (error) {
      console.log('error updating uesr', error.message);
      return this.responseService.error(ERROR_MESSAGES.UNEXPECTED_ERROR);
    }
  }

  async softDeleteUser(req: CustomRequest): Promise<ApiResponse> {
    try {
      await this.userRepository.softDeleteUser(req.user.id);
      return this.responseService.success(
        SUCCESS_MESSAGES.USER_DELETED_SUCCESSFULLY,
      );
    } catch (error) {
      return this.responseService.error(ERROR_MESSAGES.USER_UPDATE_FAILED);
    }
  }
}
