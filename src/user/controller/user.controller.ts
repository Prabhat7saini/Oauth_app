import { Body, Controller, Delete, Patch, Req, UseGuards } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CustomRequest } from 'src/utils/interface/type';
import { ApiResponse } from 'src/utils/responses/api-response.dto';
import { UpdateUserDto } from '../dto/userDto';
import { AuthenticationGuard } from 'src/auth/guard/authenticaton.guard';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) { }

  @UseGuards(AuthenticationGuard)
  @Patch(`update-user`)
  async updateUser(@Req() req: CustomRequest, @Body() userData: UpdateUserDto): Promise<ApiResponse> {
    // const userData:UpdateUserDto= req.body;
    return this.userService.updateUser(userData, req)
  }
  @UseGuards(AuthenticationGuard)
  @Delete('delete')
  async deleteUser(@Req() req: CustomRequest): Promise<ApiResponse> {
    return this.userService.softDeleteUser(req);
  }
}
