import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { AdminService } from '../services/admin.service';
import { ApiResponse } from '../../utils/responses/api-response.dto';
import { AssignPermissionsDto, UpdateUserDto } from '../dto/userDto';
import { Roles } from '../../utils/decorators/roles.decorator';
import { AuthenticationGuard } from '../../auth/guard/authenticaton.guard';
import { AuthorizationGuard } from '../../auth/guard/authorization.guard';

@Controller({ path: 'admin', version: '1' })
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Roles('admin')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Post('/createRole')
  async createRole(@Body('roleName') roleName: string): Promise<ApiResponse> {
    console.log(roleName);
    return this.adminService.createRoles(roleName);
  }
  @Roles('admin')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Post(`/createPermission`)
  async createPermission(
    @Body('permission') permission: string,
  ): Promise<ApiResponse> {
    return this.adminService.createPermissions(permission);
  }
  @Roles('admin')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Post(':roleId/permissions')
  async assignPermissionsToRole(
    @Param('roleId') roleId: string,
    @Body() permissionArray: AssignPermissionsDto,
  ) {
    const { permissionIds } = permissionArray;
    return await this.adminService.assignPermissions(roleId, permissionIds);
  }

  @Roles('admin')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Get(`getUsers`)
  async getUsers(): Promise<ApiResponse> {
    return await this.adminService.getAllUsers();
  }

  @Roles('admin')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Patch(`/:id/deactivateUser`)
  async deactivateUser(@Param('id') id: string): Promise<ApiResponse> {
    // const id = data.id;
    return this.adminService.deactivateUser(id);
  }

  @Roles('admin')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Patch(`/:id/activateUser`)
  async activateUser(@Param() data: { id: string }): Promise<ApiResponse> {
    const id = data.id;
    return this.adminService.activateUser(id);
  }

  /**
   * Endpoint for an admin to update user details.
   * Requires admin authentication and authorization.
   *  data Contains the ID of the user to be updated.
   *  userData The new user data to be applied.
   * @returns An ApiResponse indicating success or failure.
   */
  @Roles('admin')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Patch(`/:id/updateUserByadmin`)
  async updateUserByAdmin(
    @Param('id') id: string,
    @Body() userData: UpdateUserDto,
  ): Promise<ApiResponse> {
    // const id = data.id;
    return this.adminService.updateUserByAdmin(id, userData);
  }

  /**
   * Endpoint to retrieve a specific user by their ID.
   * Requires admin authentication and authorization.
   * data Contains the ID of the user to be retrieved.
   * @ An ApiResponse containing the user details.
   */
  @Roles('admin')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Get(`/:id/getUser`)
  async getUser(@Param() data: { id: string }): Promise<ApiResponse> {
    const id = data.id;
    return this.adminService.getUser(id);
  }
}
