import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole, Gender } from '../../common/enums';
// Create your own enum that matches Prisma's UserRole
// export enum UserRoleEnum {
//   USER = 'USER',
//   JOB_SEEKER = 'JOB_SEEKER',
//   EMPLOYER = 'EMPLOYER',
//   SERVICE_PROVIDER = 'SERVICE_PROVIDER',
//   BUSINESS_OWNER = 'BUSINESS_OWNER',
//   WRITER = 'WRITER',
//   EVENT_ORGANIZER = 'EVENT_ORGANIZER',
//   CHARITY_ORG = 'CHARITY_ORG',
//   VOLUNTEER = 'VOLUNTEER',
//   PRAYER_PLACE_ADMIN = 'PRAYER_PLACE_ADMIN',
//   MATRIMONY_SEEKER = 'MATRIMONY_SEEKER',
//   ADMIN = 'ADMIN',
//   SUPER_ADMIN = 'SUPER_ADMIN',
// }

// export enum Gender {
//   MALE = 'MALE',
//   FEMALE = 'FEMALE',
//   PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
// }

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole; // Use your own enum here

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  lastLoginAt?: Date;
}
