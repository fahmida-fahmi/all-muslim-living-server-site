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

  @IsOptional()
  @IsInt()
  @Min(0)
  expectedSalary?: number;

  @IsOptional()
  @IsDateString()
  availableFrom?: string;
}
