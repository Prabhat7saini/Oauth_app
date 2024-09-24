import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { AdminService } from '../services/admin.service';
import { ApiResponse } from '../../utils/responses/api-response.dto';
import { AssignPermissionsDto } from '../dto/userDto';
import { Roles } from "../../utils/decorators/roles.decorator";
import { AuthenticationGuard } from '../../auth/guard/authenticaton.guard';
import { AuthorizationGuard } from '../../auth/guard/authorization.guard';

@Controller({ path: 'admin', version: '1' })
export class AdminController {
  constructor(private readonly adminService: AdminService) { }
  @Roles("admin")
  @UseGuards(AuthenticationGuard,AuthorizationGuard)
  @Post('/createRole')
  async createRole(@Body('roleName') roleName: string): Promise<ApiResponse> {
    console.log(roleName);
    return this.adminService.createRoles(roleName);
  }
  @Roles("admin")
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Post(`/createPermission`)
  async createPermission(
    @Body('permission') permission: string,
  ): Promise<ApiResponse> {
    return this.adminService.createPermissions(permission);
  }
  @Roles("admin")
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Post(':roleId/permissions')
  async assignPermissionsToRole(
    @Param('roleId') roleId: string,
    @Body() permissionArray: AssignPermissionsDto,
  ) {
    const { permissionIds } = permissionArray;
    return await this.adminService.assignPermissions(roleId, permissionIds);
  }
}
