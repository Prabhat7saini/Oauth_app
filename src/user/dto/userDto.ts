import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { IsPasswordComplex } from '../../utils/decorators/is-password-complex.decorator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  address?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'Age must be a number' })
  @Min(1, { message: 'Age must be greater than zero' })
  age?: number;
}

export class SignUpDto {
  @IsEmail({}, { message: 'Email must be a valid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'name  must be a string' })
  @IsNotEmpty({ message: 'name is required' })
  name: string;

  @IsNotEmpty({ message: 'Age is required' })
  @IsNumberString({}, { message: 'Age must be a number' })
  // @IsPositive({ message: 'Age must be a non-negative number' })
  @Min(1, { message: 'Age must be greater than zero' })
  age: number;

  @IsString({ message: 'Address  must be a string' })
  address: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @IsPasswordComplex({
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long',
  })
  password: string;
}

export class AssignPermissionsDto {
  @IsArray()
  @IsUUID('all', { each: true })
  permissionIds: string[];
}
