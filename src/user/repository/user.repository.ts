import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../../utils/constants/message';
import * as bcrypt from 'bcryptjs';
import { SignUpDto, UpdateUserDto } from '../dto/userDto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '../entities/role.entity';
import { FindUser } from 'src/utils/interface/type';
@Injectable()
export class UserRepository {
  private saltRounds = 12;
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) { }

  //  Finds a user by email or ID.
  async findUser({ email, id }: FindUser): Promise<User | null> {
    // Ensure either email or id is provided
    if (!email && !id) {
      throw new Error(ERROR_MESSAGES.REQUIRED_ID_OR_EMAIL);
    }

    // Define the query object with relations to include
    const query: {
      where: { email?: string; id?: string };
      relations: string[];
    } = { where: {}, relations: ['roles'] };

    // Add email or id to the query object if provided
    if (email) {
      query.where.email = email;
    }
    if (id) {
      query.where.id = id;
    }

    try {
      // Find the user based on the query
      const user = await this.userRepository.findOne(query);
      // console.log(user, 'find user');

      return user || null;
    } catch (error) {
      if (error.code) {
        console.error('Database error:', error);
        throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
      } else {
        console.error('Unexpected error:', error);
        throw new Error(ERROR_MESSAGES.UNEXPECTED_ERROR);
      }
    }
  }
  async findRole({ roleName, roleId }: { roleName?: string; roleId?: string }): Promise<Role | null> {

    const query: {
      where: { roleName?: string; id?: string };
      relations: string[];
    } = { where: {}, relations: ['permissions'] };

    // Add roleName or id to the query object if provided
    if (roleName) {
      query.where.roleName = roleName;
    }
    if (roleId) {
      query.where.id = roleId;
    }

    try {
      // Find the role based on the query
      const role = await this.roleRepository.findOne(query);

      return role || null;
    } catch (error) {
      if (error.code) {
        console.error('Database error:', error);
        throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
      } else {
        console.error('Unexpected error:', error);
        throw new Error(ERROR_MESSAGES.UNEXPECTED_ERROR);
      }
    }
  }


  async register(userData: SignUpDto, role: Role): Promise<void> {
    try {
      const user = this.userRepository.create({
        ...userData,
        roles: [role],
      });
      await this.userRepository.save(user);
    } catch (error) {
      // this.logger.error('User registration failed', error.message, error.stack);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.USER_CREATION_FAILED,
      );
    }
  }

  /**
   * Creates a new admin with the given data.
   *  adminData - The data for the admin to be created.
   * @returns The created admin entity.
   */
  async createAdmin(adminData: SignUpDto): Promise<User> {
    const roleName = 'admin';
    try {
      // Find the role entity for 'admin'
      const roleEntity = await this.roleRepository.findOne({
        where: { roleName },
      });
      if (!roleEntity) {
        // this.logger.warn(`Role '${roleName}' does not exist.`);
        throw new BadRequestException('Role does not exist');
      }

      // Hash the admin password before saving
      const hashedPassword = await bcrypt.hash(
        adminData.password,
        this.saltRounds,
      );

      // Create and save the new admin
      const user = this.userRepository.create({
        ...adminData,
        password: hashedPassword,
        roles: [roleEntity],
      });
      return await this.userRepository.save(user);
    } catch (error) {
      // this.logger.error('Admin creation failed', error.message, error.stack);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.USER_CREATION_FAILED,
      );
    }
  }

  /**
   * Updates a user's details.
   * @param {string} id - ID of the user to update.
   * userData - Data to update the user with.
   *  - Returns the updated user.
   */
  async updateUserDetails(
    id: string,
    userData: UpdateUserDto,
  ): Promise<User | string> {
    try {
      const user = await this.findUser({ id });

      if (!user.isActive) {
        // this.logger.warn(
        //   `You are not update the user details because the user are not active`,
        // );
        return ERROR_MESSAGES.NOT_ALLOWED_TO_UPDATE_INACTIVE_USER;
      }
      if (!user) {
        // this.logger.warn(
        //   `inside the update by admin User with ID ${id} not found.`,
        // );
        return ERROR_MESSAGES.USER_NOT_FOUND;
      }
      if (user.roles[0].roleName === 'admin') {
        // this.logger.warn(`Update not allowed for admin user `);
        return ERROR_MESSAGES.ADMIN_UPDATE_NOT_ALLOWED;
      }

      await this.userRepository.update(id, userData);

      const updatedUser = await this.findUser({ id });
      // this.logger.log(`User with ID ${id} updated successfully.`);
      return updatedUser;
    } catch (error) {
      // this.logger.error(
      //   `Failed to update user with ID ${id}: ${error.message}`,
      // );
      throw new InternalServerErrorException(error.message);
    }
  }

  async softDeleteUser(id: string): Promise<Boolean> {
    try {
      // Execute the soft delete by updating the `deletedAt` field
      const result = await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({ deletedAt: new Date() })
        .where('id = :id AND deletedAt IS NULL', { id })
        .execute();

      if (result.affected === 0) {
        console.warn(`User with ID ${id} not found or already deleted.`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error during soft delete operation:', error);
      return false;
    }
  }
}
