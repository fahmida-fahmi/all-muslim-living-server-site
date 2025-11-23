import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { QueryJobDto } from './dto/query-job.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// Import your auth guard (adjust path as needed)
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';

@Controller('jobs')
// @UseGuards(JwtAuthGuard, RolesGuard) // Uncomment when you have auth guards
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  // @Roles('COMPANY') // Uncomment to restrict to company role only
  async createJob(
    @Body() createJobDto: CreateJobDto,
    @Request() req: any, // Contains authenticated user info
  ) {
    // Assuming req.user contains the authenticated user with id
    console.log('REQ USER = ', req.user);

    const companyId = req.user.userId;
    return this.jobsService.createJob(companyId, createJobDto);
  }

  @Patch(':id')
  // @Roles('COMPANY') // Uncomment to restrict to company role only
  async updateJob(
    @Param('id') jobId: string,
    @Body() updateJobDto: UpdateJobDto,
    @Request() req: any,
  ) {
    const companyId = req.user.userId;
    return this.jobsService.updateJob(jobId, companyId, updateJobDto);
  }

  @Get()
  async getAllJobs(@Query() queryDto: QueryJobDto) {
    return this.jobsService.getAllJobs(queryDto);
  }

  @Get('company/my-jobs')
  // @Roles('COMPANY') // Uncomment to restrict to company role only
  async getMyJobs(@Query() queryDto: QueryJobDto, @Request() req: any) {
    const companyId = req.user.userId;
    return this.jobsService.getJobsByCompany(companyId, queryDto);
  }

  @Get(':id')
  async getJobById(@Param('id') jobId: string) {
    return this.jobsService.getJobById(jobId);
  }
}
