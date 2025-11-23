import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3, { message: 'First name must be at least 3 characters' })
  firstName: string;

  @IsString()
  @MinLength(3, { message: 'Last name must be at least 3 characters' })
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/(?=.*[a-z])/, {
    message: 'Password must contain at least one lowercase letter',
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number' })
  @Matches(/(?=.*[!@#$%^&*(),.?":{}|<>])/, {
    message: 'Password must contain at least one special character',
  })
  @Matches(/^\S+$/, { message: 'Password cannot contain spaces' })
  password: string;

  @IsString()
  @Matches(/^(\+8801|01)[0-9]{9}$/, {
    message: 'Enter a valid Bangladeshi phone number',
  })
  phone: string;

  @IsOptional()
  avatar?: string;
}
