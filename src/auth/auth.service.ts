import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  Req,
} from '@nestjs/common';
import { ChangePasswordDto, LoginDto, RegisterDto } from './dto/authDto';
import { ResponseService } from '../utils/responses/ResponseService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants/message';
import { ApiResponse } from '../utils/responses/api-response.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
// import { AuthRepository } from './repo/auth.repository';

import { CustomRequest } from '../utils/interface/type';
import { UserService } from '../user/services/user.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private saltRounds = 12;

  constructor(
    private readonly userService: UserService,
    private readonly responseService: ResponseService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    // private readonly authRepository: AuthRepository,
  ) {}

  /**
   * Registers a new user with different role other then admin.
   * userData - The details of the user to be registered.
   * @returns An ApiResponse indicating the result of the registration operation.
   */
  async register(userData: RegisterDto): Promise<ApiResponse> {
    try {
      let role;
      console.log(userData.roleName);
      try {
        role = await this.userService.getRole({ roleName: userData.roleName });
        console.log(role, 'role');
        if (!role) {
          return this.responseService.error(
            ERROR_MESSAGES.ROLE_NOT_FOUND_ERROR(userData.roleName),
          );
        }
      } catch (error) {
        return this.responseService.error(error.message);
      }

      try {
        const existingUser = await this.userService.getUser({
          email: userData.email,
        });
        if (existingUser) {
          return this.responseService.error(
            ERROR_MESSAGES.USER_ALREADY_EXISTS,
            409,
          );
        }
      } catch (error) {
        this.logger.debug(`Error finding user: ${error.message}`);
        return this.responseService.error(ERROR_MESSAGES.UNEXPECTED_ERROR, 500);
      }

      // Register the new user

      const handPassword = await bcrypt.hash(
        userData.password,
        this.saltRounds,
      );
      userData.password = handPassword;
      delete userData.roleName;
      try {
        await this.userService.register(userData, role);
      } catch (error) {
        return;
      }

      return this.responseService.success(
        SUCCESS_MESSAGES.USER_CREATED_SUCCESSFULLY,
        201,
      );
    } catch (error) {
      this.logger.error('User registration failed', error.message, error.stack);
      return this.responseService.error(ERROR_MESSAGES.UNEXPECTED_ERROR, 500);
    }
  }

  /**
       * Logs in a user and generates an access token.
       * loginData - The login credentials (email and password) for authentication.
       * @returns An ApiResponse with the login result and access token if successful.
      //  */
  async login(loginData: LoginDto): Promise<ApiResponse> {
    try {
      const { email, password } = loginData;

      // Find the user by email
      const existingUser = await this.userService.getUser({ email });
      if (!existingUser) {
        return this.responseService.error(ERROR_MESSAGES.USER_NOT_FOUND, 404);
      }

      // Check if the user account is active
      if (!existingUser.isActive) {
        return this.responseService.error(ERROR_MESSAGES.USER_INACTIVE, 400);
      }

      // Verify the provided password
      const isPasswordValid = await bcrypt.compare(
        password,
        existingUser.password,
      );
      if (!isPasswordValid) {
        return this.responseService.error(
          ERROR_MESSAGES.INVALID_CREDENTIALS,
          401,
        );
      }

      // Prepare the user object excluding sensitive data
      const {
        password: _,
        isActive,
        deletedAt,
        refreshToken,
        ...userWithoutSensitiveData
      } = existingUser;

      const payload = {
        id: existingUser.id,
        role: existingUser.roles[0].roleName,
      };

      const accessToken = await this.generateToken(payload, '60m');
      return this.responseService.success(
        SUCCESS_MESSAGES.USER_LOGIN_SUCCESSFULLY,
        200,
        { user: userWithoutSensitiveData, accessToken },
      );
    } catch (error) {
      // this.logger.error('Login failed', error.message, error.stack);
      return this.responseService.error(ERROR_MESSAGES.UNEXPECTED_ERROR, 500);
    }
  }

  /**
       * Generates a JWT token.
       * @param payload - The payload to be encoded in the JWT token.
       * @param expiresIn - The expiration time of the token (e.g., '60m').
       * @returns The generated JWT token as a string.
      //  */
  private async generateToken(
    payload: object,
    expiresIn: string,
  ): Promise<string> {
    try {
      return this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn,
      });
    } catch (error) {
      // this.logger.error('Token generation failed', error.message, error.stack);
      throw new InternalServerErrorException('Failed to generate token');
    }
  }

  /**
   * Change Password .
   *
   * @returns The change password response .
   */

  // async changePassword(
  //   @Req() req: CustomRequest,
  //   changePasswordData: ChangePasswordDto,
  // ): Promise<ApiResponse> {
  //   const id = req.user.id;

  //   try {
  //     if (
  //       changePasswordData.newPassword !== changePasswordData.confirmPassword
  //     ) {
  //       return this.responseService.error(
  //         ERROR_MESSAGES.PASSWORDS_DO_NOT_MATCH,
  //         400,
  //       );
  //     }
  //     const existingUser = await this.userRepository.findUser({ id });
  //     if (!existingUser) {
  //       return this.responseService.error(ERROR_MESSAGES.USER_NOT_FOUND, 404);
  //     }

  //     const isOldPasswordValid = await bcrypt.compare(
  //       changePasswordData.oldPassword,
  //       existingUser.password,
  //     );
  //     if (!isOldPasswordValid) {
  //       return this.responseService.error(
  //         ERROR_MESSAGES.INVALID_OLD_PASSWORD,
  //         400,
  //       );
  //     }

  //     const hashedPassword = await bcrypt.hash(
  //       changePasswordData.newPassword,
  //       12,
  //     );
  //     existingUser.password = hashedPassword;

  //     await this.userRepository.save(existingUser);

  //     return this.responseService.success(SUCCESS_MESSAGES.PASSWORD_CHANGED);
  //   } catch (error) {
  //     // console.error('Error changing password:', error);
  //     return this.responseService.error(ERROR_MESSAGES.UNEXPECTED_ERROR, 500);
  //   }
  // }
}
