import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './controller/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { UserRepository } from './repository/user.repository';
import { ResponseService } from '../utils/responses/ResponseService';
import { AdminController } from './controller/admin.controller';
import { AdminService } from './services/admin.service';
import { AdminRepository } from './repository/admin.repository';
import { Permission } from './entities/permission.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission, UserRepository])],
  controllers: [UserController, AdminController],
  providers: [
    UserService,
    UserRepository,
    AdminRepository,
    ResponseService,
    AdminService,
    JwtService
  ],
  exports: [UserService],
})
export class UserModule {}
