// // src/jobs/job-applications.controller.ts

// import {
//   Controller,
//   Get,
//   Post,
//   Put,
//   Delete,
//   Body,
//   Param,
//   Query,
//   UseGuards,
//   Request,
//   UseInterceptors,
//   UploadedFile,
//   Patch,
// } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { JobApplicationsService } from './job-applications.service';
// import { CreateJobApplicationDto } from './dto/create-job-application.dto';
// import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { diskStorage } from 'multer';
// import { extname } from 'path';
// import { ApplicationStatus } from '@prisma/client';

// @Controller('job-applications')
// export class JobApplicationsController {
//   constructor(private readonly applicationService: JobApplicationsService) {}

//   // ============================================
//   // APPLY FOR JOB
//   // ============================================
//   @Post()
//   @UseGuards(JwtAuthGuard)
//   @UseInterceptors(
//     FileInterceptor('resume', {
//       storage: diskStorage({
//         destination: './uploads/resumes',
//         filename: (req, file, cb) => {
//           const uniqueSuffix =
//             Date.now() + '-' + Math.round(Math.random() * 1e9);
//           const ext = extname(file.originalname);
//           cb(null, `resume-${uniqueSuffix}${ext}`);
//         },
//       }),
//       fileFilter: (req, file, cb) => {
//         const allowedTypes = /pdf|doc|docx/;
//         const extname = allowedTypes.test(file.originalname.toLowerCase());
//         const mimetype = allowedTypes.test(file.mimetype);

//         if (extname && mimetype) {
//           return cb(null, true);
//         }
//         cb(new Error('Only PDF and DOC files are allowed!'), false);
//       },
//       limits: {
//         fileSize: 5 * 1024 * 1024, // 5MB
//       },
//     }),
//   )
//   create(
//     @Request() req,
//     @Body() createApplicationDto: CreateJobApplicationDto,
//     @UploadedFile() resumeFile: Express.Multer.File,
//   ) {
//     return this.applicationService.create(
//       req.user.id,
//       createApplicationDto,
//       resumeFile,
//     );
//   }

//   // ============================================
//   // GET MY APPLICATIONS
//   // ============================================
//   @Get('my')
//   @UseGuards(JwtAuthGuard)
//   findUserApplications(
//     @Request() req,
//     @Query('page') page?: string,
//     @Query('limit') limit?: string,
//   ) {
//     return this.applicationService.findUserApplications(
//       req.user.id,
//       page ? parseInt(page) : 1,
//       limit ? parseInt(limit) : 10,
//     );
//   }

//   // ============================================
//   // GET APPLICATIONS FOR A JOB (employer)
//   // ============================================
//   @Get('job/:jobId')
//   @UseGuards(JwtAuthGuard)
//   findJobApplications(
//     @Param('jobId') jobId: string,
//     @Request() req,
//     @Query('status') status?: ApplicationStatus,
//     @Query('page') page?: string,
//     @Query('limit') limit?: string,
//   ) {
//     return this.applicationService.findJobApplications(
//       jobId,
//       req.user.id,
//       status,
//       page ? parseInt(page) : 1,
//       limit ? parseInt(limit) : 10,
//     );
//   }

//   // ============================================
//   // GET APPLICATION STATISTICS
//   // ============================================
//   @Get('job/:jobId/stats')
//   @UseGuards(JwtAuthGuard)
//   getApplicationStats(@Param('jobId') jobId: string, @Request() req) {
//     return this.applicationService.getApplicationStats(jobId, req.user.id);
//   }

//   // ============================================
//   // GET SINGLE APPLICATION
//   // ============================================
//   @Get(':id')
//   @UseGuards(JwtAuthGuard)
//   findOne(@Param('id') id: string, @Request() req) {
//     return this.applicationService.findOne(id, req.user.id);
//   }

//   // ============================================
//   // UPDATE APPLICATION STATUS (employer)
//   // ============================================
//   @Patch(':id/status')
//   @UseGuards(JwtAuthGuard)
//   updateStatus(
//     @Param('id') id: string,
//     @Request() req,
//     @Body() updateStatusDto: UpdateApplicationStatusDto,
//   ) {
//     return this.applicationService.updateStatus(
//       id,
//       req.user.id,
//       updateStatusDto,
//     );
//   }

//   // ============================================
//   // WITHDRAW APPLICATION
//   // ============================================
//   @Patch(':id/withdraw')
//   @UseGuards(JwtAuthGuard)
//   withdraw(@Param('id') id: string, @Request() req) {
//     return this.applicationService.withdraw(id, req.user.id);
//   }

//   // ============================================
//   // DELETE APPLICATION
//   // ============================================
//   @Delete(':id')
//   @UseGuards(JwtAuthGuard)
//   remove(@Param('id') id: string, @Request() req) {
//     return this.applicationService.remove(id, req.user.id);
//   }
// }
