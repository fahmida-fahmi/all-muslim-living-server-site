// // src/jobs/job-applications.service.ts

// import {
//   Injectable,
//   NotFoundException,
//   BadRequestException,
//   ForbiddenException,
// } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import { CreateJobApplicationDto } from './dto/create-job-application.dto';
// import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
// import { ApplicationStatus } from '@prisma/client';

// @Injectable()
// export class JobApplicationsService {
//   constructor(private prisma: PrismaService) {}

//   // ============================================
//   // CREATE APPLICATION
//   // ============================================
//   async create(
//     userId: string,
//     createApplicationDto: CreateJobApplicationDto,
//     resumeFile?: Express.Multer.File,
//   ) {
//     const { jobId, coverLetter, portfolio, expectedSalary, availableFrom } =
//       createApplicationDto;

//     // Check if job exists and is active
//     const job = await this.prisma.job.findUnique({
//       where: { id: jobId },
//       include: { poster: true },
//     });

//     if (!job) {
//       throw new NotFoundException('Job not found');
//     }

//     if (!job.isActive) {
//       throw new BadRequestException(
//         'This job is no longer accepting applications',
//       );
//     }

//     // Check if applicationDeadline has passed
//     if (job.applicationDeadline && job.applicationDeadline < new Date()) {
//       throw new BadRequestException(
//         'Application applicationDeadline has passed',
//       );
//     }

//     // Check if user already applied
//     const existingApplication = await this.prisma.jobApplication.findUnique({
//       where: {
//         jobId_applicantId: {
//           jobId,
//           applicantId: userId,
//         },
//       },
//     });

//     if (existingApplication) {
//       throw new BadRequestException('You have already applied for this job');
//     }

//     // Create application
//     const application = await this.prisma.jobApplication.create({
//       data: {
//         jobId,
//         applicantId: userId,
//         coverLetter,
//         portfolio,
//         expectedSalary: expectedSalary
//           ? parseInt(expectedSalary.toString())
//           : null,
//         availableFrom: availableFrom ? new Date(availableFrom) : null,
//         resume: resumeFile?.path,
//       },
//       include: {
//         applicant: {
//           select: {
//             id: true,
//             firstName: true,
//             email: true,
//             phone: true,
//             avatar: true,
//           },
//         },
//         job: {
//           select: {
//             id: true,
//             title: true,
//             company: {
//               select: {
//                 id: true,
//                 name: true,
//                 logo: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     // Increment applications count
//     await this.prisma.job.update({
//       where: { id: jobId },
//       data: { applicationsCount: { increment: 1 } },
//     });

//     // TODO: Send notification to job poster

//     return application;
//   }

//   // ============================================
//   // GET USER'S APPLICATIONS
//   // ============================================
//   async findUserApplications(userId: string, page = 1, limit = 10) {
//     const skip = (page - 1) * limit;

//     const [applications, total] = await Promise.all([
//       this.prisma.jobApplication.findMany({
//         where: { applicantId: userId },
//         skip,
//         take: limit,
//         include: {
//           job: {
//             select: {
//               id: true,
//               title: true,
//               slug: true,
//               location: true,
//               jobType: true,
//               salaryMin: true,
//               salaryMax: true,
//               company: {
//                 select: {
//                   id: true,
//                   name: true,
//                   logo: true,
//                 },
//               },
//             },
//           },
//         },
//         orderBy: { createdAt: 'desc' },
//       }),
//       this.prisma.jobApplication.count({ where: { applicantId: userId } }),
//     ]);

//     return {
//       applications,
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     };
//   }

//   // ============================================
//   // GET JOB APPLICATIONS (for employer)
//   // ============================================
//   async findJobApplications(
//     jobId: string,
//     userId: string,
//     status?: ApplicationStatus,
//     page = 1,
//     limit = 10,
//   ) {
//     // Check if user owns the job
//     const job = await this.prisma.job.findUnique({
//       where: { id: jobId },
//       include: {
//         company: {
//           include: {
//             teamMembers: true,
//           },
//         },
//       },
//     });

//     if (!job) {
//       throw new NotFoundException('Job not found');
//     }

//     const isOwner = job.posterId === userId;
//     const isCompanyOwner = job.company?.ownerId === userId;
//     const isTeamMember = job.company?.teamMembers.some(
//       (member) => member.id === userId,
//     );

//     if (!isOwner && !isCompanyOwner && !isTeamMember) {
//       throw new ForbiddenException(
//         'You do not have permission to view these applications',
//       );
//     }

//     const skip = (page - 1) * limit;

//     const where: any = { jobId };
//     if (status) {
//       where.status = status;
//     }

//     const [applications, total] = await Promise.all([
//       this.prisma.jobApplication.findMany({
//         where,
//         skip,
//         take: limit,
//         include: {
//           applicant: {
//             select: {
//               id: true,
//               firstName: true,
//               email: true,
//               phone: true,
//               avatar: true,
//             },
//           },
//         },
//         orderBy: { createdAt: 'desc' },
//       }),
//       this.prisma.jobApplication.count({ where }),
//     ]);

//     return {
//       applications,
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     };
//   }

//   // ============================================
//   // GET SINGLE APPLICATION
//   // ============================================
//   async findOne(id: string, userId: string) {
//     const application = await this.prisma.jobApplication.findUnique({
//       where: { id },
//       include: {
//         applicant: {
//           select: {
//             id: true,
//             firstName: true,
//             email: true,
//             phone: true,
//             avatar: true,
//             bio: true,
//           },
//         },
//         job: {
//           include: {
//             poster: {
//               select: {
//                 id: true,
//                 firstName: true,
//                 email: true,
//               },
//             },
//             company: {
//               select: {
//                 id: true,
//                 name: true,
//                 logo: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!application) {
//       throw new NotFoundException('Application not found');
//     }

//     // Check if user has permission to view
//     const isApplicant = application.applicantId === userId;
//     const isJobPoster = application.job.posterId === userId;

//     if (!isApplicant && !isJobPoster) {
//       throw new ForbiddenException(
//         'You do not have permission to view this application',
//       );
//     }

//     return application;
//   }

//   // ============================================
//   // UPDATE APPLICATION STATUS (employer only)
//   // ============================================
//   async updateStatus(
//     id: string,
//     userId: string,
//     updateStatusDto: UpdateApplicationStatusDto,
//   ) {
//     const application = await this.prisma.jobApplication.findUnique({
//       where: { id },
//       include: {
//         job: {
//           include: {
//             company: {
//               include: {
//                 teamMembers: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!application) {
//       throw new NotFoundException('Application not found');
//     }

//     // Check permission
//     const isJobPoster = application.job.posterId === userId;
//     const isCompanyOwner = application.job.company?.ownerId === userId;
//     const isTeamMember = application.job.company?.teamMembers.some(
//       (member) => member.id === userId,
//     );

//     if (!isJobPoster && !isCompanyOwner && !isTeamMember) {
//       throw new ForbiddenException(
//         'You do not have permission to update this application',
//       );
//     }

//     // Update application
//     const updatedApplication = await this.prisma.jobApplication.update({
//       where: { id },
//       data: {
//         status: updateStatusDto.status,
//         adminNotes: updateStatusDto.adminNotes,
//         reviewedAt: new Date(),
//         reviewedBy: userId,
//       },
//       include: {
//         applicant: {
//           select: {
//             id: true,
//             firstName: true,
//             email: true,
//           },
//         },
//       },
//     });

//     // TODO: Send notification to applicant

//     return updatedApplication;
//   }

//   // ============================================
//   // WITHDRAW APPLICATION (applicant only)
//   // ============================================
//   async withdraw(id: string, userId: string) {
//     const application = await this.prisma.jobApplication.findUnique({
//       where: { id },
//     });

//     if (!application) {
//       throw new NotFoundException('Application not found');
//     }

//     if (application.applicantId !== userId) {
//       throw new ForbiddenException(
//         'You can only withdraw your own applications',
//       );
//     }

//     if (application.status === 'ACCEPTED') {
//       throw new BadRequestException('Cannot withdraw an accepted application');
//     }

//     // Update status to WITHDRAWN
//     const updatedApplication = await this.prisma.jobApplication.update({
//       where: { id },
//       data: { status: 'WITHDRAWN' },
//     });

//     // Decrement applications count
//     await this.prisma.job.update({
//       where: { id: application.jobId },
//       data: { applicationsCount: { decrement: 1 } },
//     });

//     return updatedApplication;
//   }

//   // ============================================
//   // DELETE APPLICATION
//   // ============================================
//   async remove(id: string, userId: string) {
//     const application = await this.prisma.jobApplication.findUnique({
//       where: { id },
//     });

//     if (!application) {
//       throw new NotFoundException('Application not found');
//     }

//     if (application.applicantId !== userId) {
//       throw new ForbiddenException('You can only delete your own applications');
//     }

//     await this.prisma.jobApplication.delete({ where: { id } });

//     // Decrement applications count
//     await this.prisma.job.update({
//       where: { id: application.jobId },
//       data: { applicationsCount: { decrement: 1 } },
//     });

//     return { message: 'Application deleted successfully' };
//   }

//   // ============================================
//   // GET APPLICATION STATISTICS
//   // ============================================
//   async getApplicationStats(jobId: string, userId: string) {
//     // Check permission
//     const job = await this.prisma.job.findUnique({
//       where: { id: jobId },
//     });

//     if (!job) {
//       throw new NotFoundException('Job not found');
//     }

//     if (job.posterId !== userId) {
//       throw new ForbiddenException(
//         'You do not have permission to view these statistics',
//       );
//     }

//     const [
//       total,
//       pending,
//       reviewing,
//       shortlisted,
//       interviewed,
//       accepted,
//       rejected,
//       withdrawn,
//     ] = await Promise.all([
//       this.prisma.jobApplication.count({ where: { jobId } }),
//       this.prisma.jobApplication.count({ where: { jobId, status: 'PENDING' } }),
//       this.prisma.jobApplication.count({
//         where: { jobId, status: 'REVIEWING' },
//       }),
//       this.prisma.jobApplication.count({
//         where: { jobId, status: 'SHORTLISTED' },
//       }),
//       this.prisma.jobApplication.count({
//         where: { jobId, status: 'INTERVIEWED' },
//       }),
//       this.prisma.jobApplication.count({
//         where: { jobId, status: 'ACCEPTED' },
//       }),
//       this.prisma.jobApplication.count({
//         where: { jobId, status: 'REJECTED' },
//       }),
//       this.prisma.jobApplication.count({
//         where: { jobId, status: 'WITHDRAWN' },
//       }),
//     ]);

//     return {
//       total,
//       pending,
//       reviewing,
//       shortlisted,
//       interviewed,
//       accepted,
//       rejected,
//       withdrawn,
//     };
//   }
// }
