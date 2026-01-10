import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';

export class CreateJobApplicationDto {
  @IsString()
  jobId: string;

  @IsOptional()
  @IsString()
  coverLetter?: string;

  @IsOptional()
  @IsString()
  portfolio?: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  expectedSalary: number;

  @IsOptional()
  @IsDateString()
  availableFrom?: string;
}
