import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEnum,
  Min,
  IsDateString,
  IsBoolean,
  IsArray,
  ValidateIf,
  IsIn,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { JobType } from '../../common/enums';

export class CreateJobDto {
  // ================= BASIC =================
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  requirements: string;

  @IsOptional()
  @IsString()
  responsibilities?: string;

  @IsOptional()
  @IsString()
  category?: string;

  // ================= JOB DETAILS =================
  @IsEnum(JobType)
  @IsIn(Object.values(JobType))
  jobType: JobType;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  education?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').map((s) => s.trim()) : value,
  )
  skills?: string[];

  // ================= SALARY =================
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  salaryMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  @ValidateIf((o) => o.salaryMin !== undefined)
  salaryMax?: number;

  @IsOptional()
  @IsString()
  salaryCurrency?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').map((s) => s.trim()) : value,
  )
  benefits?: string[];

  // ================= LOCATION =================
  @IsString()
  @IsNotEmpty()
  location: string;

  @IsOptional()
  @IsString()
  city?: string;

  // ================= APPLICATION =================
  @IsOptional()
  @IsDateString()
  applicationDeadline?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  totalPositions?: number;

  // ================= STATUS =================
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isFeatured?: boolean;

  // ================= SEO =================
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  // ================= RELATION =================
  @IsOptional()
  @IsString()
  companyId?: string;
}
