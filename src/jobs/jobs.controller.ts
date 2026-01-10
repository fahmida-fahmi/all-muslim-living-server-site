// src/jobs/jobs.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { FilterJobDto } from './dto/filter-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // ============================================
  // PUBLIC ROUTES
  // ============================================

  // Get all jobs (with filters)
  @Get()
  findAll(@Query() filterDto: FilterJobDto) {
    return this.jobsService.findAll(filterDto);
  }

  // Get job by ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  // Get job by slug
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.jobsService.findBySlug(slug);
  }

  // Get similar jobs
  @Get(':id/similar')
  findSimilar(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.jobsService.findSimilar(id, limit ? parseInt(limit) : 5);
  }

  // Get jobs by company
  @Get('company/:companyId')
  findCompanyJobs(
    @Param('companyId') companyId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.jobsService.findCompanyJobs(
      companyId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  // ============================================
  // PROTECTED ROUTES (Requires Authentication)
  // ============================================

  // Create new job (EMPLOYER, ADMIN only)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER', 'ADMIN')
  create(@Request() req: any, @Body() createJobDto: CreateJobDto) {
    console.log('USER:', req.user);
    return this.jobsService.create(req.user.userId, createJobDto);
  }

  // Get user's posted jobs
  @Get('my/posted')
  @UseGuards(JwtAuthGuard)
  findUserJobs(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.jobsService.findUserJobs(
      req.user.userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  // Update job
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    return this.jobsService.update(id, req.user.id, updateJobDto);
  }

  // Toggle job active status
  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard)
  toggleActive(@Param('id') id: string, @Request() req) {
    return this.jobsService.toggleActive(id, req.user.userId);
  }

  // Get job statistics
  @Get(':id/stats')
  @UseGuards(JwtAuthGuard)
  getJobStats(@Param('id') id: string, @Request() req) {
    return this.jobsService.getJobStats(id, req.user.id);
  }

  // Delete job (soft delete)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.jobsService.remove(id, req.user.id);
  }
}
