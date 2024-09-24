import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminSignUpDto, LoginDto, RegisterDto } from './dto/authDto';
import { ApiResponse } from '../utils/responses/api-response.dto';
import { ResponseService } from '../utils/responses/ResponseService';
import { ERROR_MESSAGES } from 'src/utils/constants/message';

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
}
