// src/jobs/dto/filter-job.dto.ts

import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  IsBoolean,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { JobType } from '@prisma/client';

export class FilterJobDto {
  // ============================================
  // SEARCH & FILTER
  // ============================================

  @IsOptional()
  @IsString()
  search?: string; // Search in title and description

  @IsOptional()
  @IsString()
  city?: string; // Filter by city

  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType; // FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, REMOTE

  @IsOptional()
  @IsString()
  experience?: string; // e.g., "2-5 years", "Fresher"

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    // Handle both single string and array
    if (typeof value === 'string') {
      return [value];
    }
    return value;
  })
  skills?: string[]; // Filter by skills (has any of these)

  // ============================================
  // SALARY RANGE
  // ============================================

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  salaryMin?: number; // Minimum salary

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  salaryMax?: number; // Maximum salary

  // ============================================
  // LOCATION
  // ============================================

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isRemote?: boolean; // Filter remote jobs

  // ============================================
  // PAGINATION
  // ============================================

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1; // Page number (default: 1)

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10; // Items per page (default: 10, max: 100)

  // ============================================
  // SORTING
  // ============================================

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt'; // Sort by field (createdAt, views, salaryMin, salaryMax)

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc'; // Sort order (asc or desc)
}

// ============================================
// USAGE EXAMPLES
// ============================================

/*
Example 1: Search for React jobs in Dhaka
GET /jobs?search=developer&city=Dhaka&skills=React&page=1&limit=10

Example 2: Remote jobs with 2-5 years experience
GET /jobs?isRemote=true&experience=2-5 years

Example 3: High salary full-time jobs
GET /jobs?jobType=FULL_TIME&salaryMin=100000&sortBy=salaryMax&sortOrder=desc

Example 4: Multiple skills filter
GET /jobs?skills=React&skills=Node.js&skills=TypeScript

Example 5: Latest jobs
GET /jobs?sortBy=createdAt&sortOrder=desc&page=1&limit=20
*/
