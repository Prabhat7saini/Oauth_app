import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AdminSignUpDto,
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  RessetPasswordDto,
} from './dto/authDto';
import { ApiResponse } from '../utils/responses/api-response.dto';
import { ResponseService } from '../utils/responses/ResponseService';
import { ERROR_MESSAGES } from 'src/utils/constants/message';
import { AuthenticationGuard } from './guard/authenticaton.guard';
import { CustomRequest } from '../utils/interface/type';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly responseService: ResponseService,
  ) {}
  @Post(`/admin/signUp`)
  async registerAdmin(
    @Body() signUpData: AdminSignUpDto,
  ): Promise<ApiResponse> {
    const userData: RegisterDto = { ...signUpData, roleName: 'admin' };
    return this.authService.register(userData);
  }

  @Post(`/signUP`)
  async registerUser(@Body() signUpData: RegisterDto): Promise<ApiResponse> {
    if (signUpData.roleName === 'admin') {
      return this.responseService.error(ERROR_MESSAGES.REGISTER_NOT_ALLOWED);
    }

    return this.authService.register(signUpData);
  }

  @Post('/login')
  async login(@Body() loginData: LoginDto): Promise<ApiResponse> {
    return this.authService.login(loginData);
  }
  @UseGuards(AuthenticationGuard)
  @Post('/changePassword')
  async changePassword(
    @Req() req: CustomRequest,
    @Body() changePasswordData: ChangePasswordDto,
  ): Promise<ApiResponse> {
    return await this.authService.changePassword(req, changePasswordData);
  }

  @UseGuards(AuthenticationGuard)
  @Post(`refreshToken`)
  async refreshToken(@Req() req: CustomRequest): Promise<ApiResponse> {
    return await this.authService.refreshToken(req);
  }

  // Generate reset token for password reset functionality
  @Post(`reset-password-token`)
  async generateResetToken(@Body('email') email: string): Promise<ApiResponse> {
    return await this.authService.generateResetToken(email);
  }

  @Post(':id/reset-password')
  async resetPassword(
    @Body() resetPasswordData: RessetPasswordDto,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    return await this.authService.resetPassword(resetPasswordData, id);
  }
}
