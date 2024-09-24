import {
  Injectable,
  Logger,
  InternalServerErrorException,
  Req,
} from '@nestjs/common';
import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  RessetPasswordDto,
} from './dto/authDto';
import { ResponseService } from '../utils/responses/ResponseService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants/message';
import { ApiResponse } from '../utils/responses/api-response.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CustomRequest } from '../utils/interface/type';
import { UserService } from '../user/services/user.service';
import { createForgotPasswordEmailBody } from '../utils/emailTemplates/resetPassword';
import { createVerificationEmailBody } from '../utils/emailTemplates/sendOtp';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private saltRounds = 12;

  constructor(
    private readonly userService: UserService,
    private readonly responseService: ResponseService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
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

      const payloadAccessToken = {
        id: existingUser.id,
        role: existingUser.roles[0].roleName,
      };
      const RefreshToken = await this.generateToken(
        { id: existingUser.id },
        '2d',
      );
      const accessToken = await this.generateToken(payloadAccessToken, '60m');
      existingUser.refreshToken = RefreshToken;
      await this.userService.saveUser(existingUser);
      return this.responseService.success(
        SUCCESS_MESSAGES.USER_LOGIN_SUCCESSFULLY,
        200,
        { user: userWithoutSensitiveData, accessToken, RefreshToken },
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

  async changePassword(
    @Req() req: CustomRequest,
    changePasswordData: ChangePasswordDto,
  ): Promise<ApiResponse> {
    try {
      const id = req.user.id;
      if (
        changePasswordData.newPassword !== changePasswordData.confirmPassword
      ) {
        return this.responseService.error(
          ERROR_MESSAGES.PASSWORDS_DO_NOT_MATCH,
          400,
        );
      }
      const existingUser = await this.userService.getUser({ id });
      if (!existingUser) {
        return this.responseService.error(ERROR_MESSAGES.USER_NOT_FOUND, 404);
      }

      const isOldPasswordValid = await bcrypt.compare(
        changePasswordData.oldPassword,
        existingUser.password,
      );
      if (!isOldPasswordValid) {
        return this.responseService.error(
          ERROR_MESSAGES.INVALID_OLD_PASSWORD,
          400,
        );
      }

      const hashedPassword = await bcrypt.hash(
        changePasswordData.newPassword,
        12,
      );
      existingUser.password = hashedPassword;

      await this.userService.saveUser(existingUser);

      return this.responseService.success(SUCCESS_MESSAGES.PASSWORD_CHANGED);
    } catch (error) {
      console.error('Error changing password:', error);
      return this.responseService.error(ERROR_MESSAGES.UNEXPECTED_ERROR, 500);
    }
  }

  async refreshToken(req: CustomRequest): Promise<ApiResponse> {
    try {
      const id = req.user.id;
      const existingUser = await this.userService.getUser({ id });
      if (!existingUser) {
        return this.responseService.error(ERROR_MESSAGES.USER_NOT_FOUND, 404);
      }
      if (!existingUser.isActive) {
        return this.responseService.error(ERROR_MESSAGES.USER_INACTIVE, 400);
      }
      const payloadAccessToken = {
        id: existingUser.id,
        role: existingUser.roles[0].roleName,
      };
      const RefreshToken = await this.generateToken(
        { id: existingUser.id },
        '2d',
      );
      const accessToken = await this.generateToken(payloadAccessToken, '60m');
      existingUser.refreshToken = RefreshToken;
      await this.userService.saveUser(existingUser);
      return this.responseService.success(
        SUCCESS_MESSAGES.USER_LOGIN_SUCCESSFULLY,
        200,
        { accessToken, RefreshToken },
      );
    } catch (error) {}
  }

  async generateResetToken(email: string) {
    try {
      const existingUser = await this.userService.getUser({ email });
      if (!existingUser) {
        return this.responseService.error(ERROR_MESSAGES.USER_NOT_FOUND);
      }
      if (!existingUser.isActive) {
        return this.responseService.error(ERROR_MESSAGES.USER_INACTIVE, 400);
      }
      const token = existingUser.id;
      // existingUser.refreshToken = token;
      existingUser.reSetPasswordExpires = new Date(Date.now() + 5 * 60 * 1000);
      const url = `http://localhost:3000/update-password/${token}`;

      // Todo send mail notification code
      const htmlBody = createForgotPasswordEmailBody({ resetLink: url });
      await this.emailService.sendMail(
        existingUser.email,
        'password forget link',
        htmlBody,
      );

      await this.userService.saveUser(existingUser);
      return this.responseService.success(
        SUCCESS_MESSAGES.RESET_PASSWORD_TOKEN_GENERATED,
        200,
        { token },
      );
    } catch (error) {
      this.logger.error(
        'Error generating reset password token:',
        error.message,
      );
      return this.responseService.error(
        ERROR_MESSAGES.FAILD_REST_PASSWORD_TOKEN_GENERATED,
      );
    }
  }

  async resetPassword(
    resetPasswordData: RessetPasswordDto,
    id: string,
  ): Promise<ApiResponse> {
    try {
      if (resetPasswordData.confirmPassword !== resetPasswordData.newPassword) {
        return this.responseService.error(
          ERROR_MESSAGES.PASSWORDS_DO_NOT_MATCH,
        );
      }
      const existingUser = await this.userService.getUser({ id });
      if (!existingUser) {
        return this.responseService.error(ERROR_MESSAGES.USER_NOT_FOUND);
      }
      if (!existingUser.isActive) {
        return this.responseService.error(ERROR_MESSAGES.USER_INACTIVE, 400);
      }
      if (existingUser.reSetPasswordExpires < new Date()) {
        return this.responseService.error(
          ERROR_MESSAGES.RESET_TOKEN_EXPIRED,
          401,
        );
      }
      const hashedPassword = await bcrypt.hash(
        resetPasswordData.newPassword,
        12,
      );
      existingUser.password = hashedPassword;

      await this.userService.saveUser(existingUser);

      return this.responseService.success(SUCCESS_MESSAGES.PASSWORD_CHANGED);
    } catch (error) {
      this.logger.debug(error.message);
      return this.responseService.error(ERROR_MESSAGES.RESETPASSWORD_FAILD);
    }
  }
}
