import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { IsPasswordComplex } from '../../utils/decorators/is-password-complex.decorator';

export class AdminSignUpDto {
  @IsEmail({}, { message: 'Email must be a valid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'name  must be a string' })
  @IsNotEmpty({ message: 'name is required' })
  name: string;

  @IsNotEmpty({ message: 'Age is required' })
  @IsNumber({}, { message: 'Age must be a number' })
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

export class RegisterDto extends AdminSignUpDto {
  @IsString({ message: 'Role  must be a string' })
  @IsNotEmpty({ message: 'Role is required' })
  roleName: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Email must be a valid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @IsPasswordComplex({
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long',
  })
  password: string;
}

export class ChangePasswordDto {
  @IsString({ message: 'Old password must be a string' })
  @IsNotEmpty({ message: 'Old password is required' })
  oldPassword: string;

  @IsString({ message: 'New password must be a string' })
  @IsNotEmpty({ message: 'New password is required' })
  @IsPasswordComplex({
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long',
  })
  newPassword: string;
  @IsString({ message: 'Confirm password must be a string' })
  @IsNotEmpty({ message: 'Confirm password is required' })
  confirmPassword: string;
}
