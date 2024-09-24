import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AdminRepository } from '../repository/admin.repository';
import { ApiResponse } from '../../utils/responses/api-response.dto';
import { ResponseService } from '../../utils/responses/ResponseService';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../../utils/constants/message';
import { UpdateUserDto } from '../dto/userDto';
import { UserService } from './user.service';

/**
 * Service for handling administrative tasks.
 */
@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly responseService: ResponseService,
    private readonly userService: UserService,
  ) {}

  /**
   * Creates a new role.
   * @param role - The role to be created.
   * @returns ApiResponse - Response indicating the success or failure of the operation.
   */
  async createRoles(roleName: string): Promise<ApiResponse> {
    const role = await this.userService.getRole({roleName});
    console.log(role, 'role');
    if (role) {
      return this.responseService.error(ERROR_MESSAGES.ROLE_ALREADY_EXISTS);
    }

    console.log(`Creating role ${roleName}`);

    try {
      const result = await this.adminRepository.createRoles(roleName);
      if (typeof result === 'string') {
        return this.responseService.error(result);
      }
      return this.responseService.success(
        SUCCESS_MESSAGES.ROLE_CREATED_SUCCESSFULLY,
        201,
      );
    } catch (error) {
      this.logger.error('Error creating role', error.stack);
      return this.responseService.error(error.message, 500);
    }
  }

  async createPermissions(permission: string): Promise<ApiResponse> {
    try {
      console.log(permission);
      const existingPermissions =
        await this.adminRepository.findPermission(permission);
      if (existingPermissions) {
        return this.responseService.error(
          ERROR_MESSAGES.PERMISSION_ALREADY_EXISTENT,
        );
      }

      await this.adminRepository.createPermissions(permission);
      return this.responseService.success(
        SUCCESS_MESSAGES.PERMISSION_CREATED_SUCCESSFULLY,
      );
    } catch (error) {
      return this.responseService.error(
        ERROR_MESSAGES.PERMISSION_CREATION_FAILED,
      );
    }
  }

  /**
   * Retrieves all users.
   * @returns ApiResponse - Response containing the list of users or an error.
   */
  async getAllUsers(): Promise<ApiResponse> {
    try {
      const users = await this.adminRepository.getAllUsers();
      if (typeof users === 'string') {
        return this.responseService.error(users);
      }
      return this.responseService.success(
        SUCCESS_MESSAGES.USERS_FETCHED_SUCCESSFULLY,
        200,
        users,
      );
    } catch (error) {
      // this.logger.error('Error fetching users', error.message);
      return this.responseService.error(error.message, 500);
    }
  }

  /**
   * Deactivates a user by ID.
   * @param id - The ID of the user to deactivate.
   * @returns ApiResponse - Response indicating the success or failure of the operation.
   */
  async deactivateUser(id: string): Promise<ApiResponse> {
    if (!id) {
      return this.responseService.error(ERROR_MESSAGES.ID_REQUIRED);
    }

    try {
      const result = await this.adminRepository.deactivateUser(id);
      if (typeof result === 'string') {
        return this.responseService.error(result);
      }
      return this.responseService.success(SUCCESS_MESSAGES.USER_DEACTIVATED);
    } catch (error) {
      return this.responseService.error(error.message, 500);
    }
  }

  /**
   * Activates a user by ID.
   * @param id - The ID of the user to activate.
   * @returns ApiResponse - Response indicating the success or failure of the operation.
   */
  async activateUser(id: string): Promise<ApiResponse> {
    if (!id) {
      return this.responseService.error(ERROR_MESSAGES.ID_REQUIRED);
    }

    try {
      const result = await this.adminRepository.activateUser(id);
      if (typeof result === 'string') {
        return this.responseService.error(result);
      }
      return this.responseService.success(SUCCESS_MESSAGES.USER_ACTIVATED);
    } catch (error) {
      return this.responseService.error(error.message, 500);
    }
  }

  /**
   * Updates a user by admin.
   * @param id - The ID of the user to update.
   *  userData - The data to update the user with.
   * @returns ApiResponse - Response indicating the success or failure of the operation.
   */
  async updateUserByAdmin(
    id: string,
    userData: UpdateUserDto,
  ): Promise<ApiResponse> {
    if (!id) {
      return this.responseService.error(ERROR_MESSAGES.ID_REQUIRED);
    }

    try {
      const updatedUser = await this.adminRepository.updateUserByAdmin(
        id,
        userData,
      );
      if (typeof updatedUser === 'string') {
        return this.responseService.error(updatedUser);
      }
      if (!updatedUser) {
        return this.responseService.error(ERROR_MESSAGES.USER_UPDATE_FAILED);
      }
      return this.responseService.success(
        SUCCESS_MESSAGES.USER_UPDATED_SUCCESSFULLY,
        204,
        updatedUser,
      );
    } catch (error) {
      return this.responseService.error(ERROR_MESSAGES.USER_UPDATE_FAILED, 500);
    }
  }

  async getUser(id: string): Promise<ApiResponse> {
    if (!id) {
      return this.responseService.error(ERROR_MESSAGES.ID_REQUIRED);
    }
    try {
      const user = await this.adminRepository.getUserById(id);

      if (!user) {
        return this.responseService.error(
          ERROR_MESSAGES.USER_NOT_FOUND_BY_ID(id),
          404,
        );
      }
      return this.responseService.success(
        SUCCESS_MESSAGES.USER_FETCHED_SUCCESSFULLY,
        200,
        user,
      );
    } catch (error) {
      return this.responseService.error(ERROR_MESSAGES.USER_FETCH_FAILED, 500);
    }
  }

  async assignPermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<void> {
    const id = roleId;
    console.log(roleId)
    const role = await this.userService.getRole({roleId});
    console.log(role,"assignPermissions")
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    await this.adminRepository.assignPermissions(role, permissionIds);
  }
}
