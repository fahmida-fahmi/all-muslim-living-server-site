import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class FilterBiodataDto {
  @IsOptional() @IsNumberString() page?: string;
  @IsOptional() @IsNumberString() limit?: string;
  @IsOptional() @IsString() gender?: string;
  @IsOptional() @IsNumberString() ageFrom?: string;
  @IsOptional() @IsNumberString() ageTo?: string;
  @IsOptional() @IsString() maritalStatus?: string; // comma-separated
  @IsOptional() @IsString() religion?: string; // comma-separated
  @IsOptional() @IsString() educationLevel?: string; // comma-separated
  @IsOptional() @IsString() complexion?: string; // comma-separated
  @IsOptional() @IsString() occupation?: string; // comma-separated
  @IsOptional() @IsString() financialStatus?: string;
  @IsOptional() @IsString() heightFrom?: string;
  @IsOptional() @IsString() heightTo?: string;
  @IsOptional() @IsString() country?: string;
}
