import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JobApplicationsService } from './job-applications.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApplicationStatus } from '@prisma/client';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('job-applications')
@UseGuards(JwtAuthGuard)
export class JobApplicationsController {
  constructor(private readonly applicationService: JobApplicationsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('resume', {
      storage: diskStorage({
        destination: './uploads/resumes',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `resume-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx/;
        const isValid = allowedTypes.test(file.originalname.toLowerCase());
        if (isValid) {
          cb(null, true);
        } else {
          cb(new Error('Only PDF and DOC files are allowed!'), false);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  create(
    @Request() req,
    @Body() createApplicationDto: CreateJobApplicationDto,
    @UploadedFile() resumeFile: Express.Multer.File,
  ) {
    return this.applicationService.create(
      req.user.userId,
      createApplicationDto,
      resumeFile,
    );
  }

  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.applicationService.findAll(+page, +limit);
  }

  @Get('my')
  findUserApplications(
    @Request() req,
    @Query('status') status?: ApplicationStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.applicationService.findUserApplications(
      req.user.userId,
      status,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.applicationService.findOne(id, req.user.userId);
  }

  @Patch(':id/withdraw')
  withdraw(@Param('id') id: string, @Request() req) {
    return this.applicationService.withdraw(id, req.user.userId);
  }
}
