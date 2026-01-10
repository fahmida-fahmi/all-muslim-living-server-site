// import {
//   Injectable,
//   NotFoundException,
//   BadRequestException,
// } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';

// @Injectable()
// export class SavedJobsService {
//   constructor(private prisma: PrismaService) {}

//   // Save a job
//   async save(userId: string, jobId: string) {
//     // Check if job exists
//     const job = await this.prisma.job.findUnique({ where: { id: jobId } });
//     if (!job) {
//       throw new NotFoundException('Job not found');
//     }

//     // Check if already saved
//     const existing = await this.prisma.savedJob.findUnique({
//       where: {
//         userId_jobId: {
//           userId,
//           jobId,
//         },
//       },
//     });

//     if (existing) {
//       throw new BadRequestException('Job already saved');
//     }

//     const savedJob = await this.prisma.savedJob.create({
//       data: {
//         userId,
//         jobId,
//       },
//       include: {
//         job: {
//           include: {
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

//     return savedJob;
//   }

//   // Get user's saved jobs
//   async findUserSavedJobs(userId: string, page = 1, limit = 10) {
//     const skip = (page - 1) * limit;

//     const [savedJobs, total] = await Promise.all([
//       this.prisma.savedJob.findMany({
//         where: { userId },
//         skip,
//         take: limit,
//         include: {
//           job: {
//             include: {
//               company: {
//                 select: {
//                   id: true,
//                   name: true,
//                   logo: true,
//                 },
//               },
//               _count: {
//                 select: {
//                   applications: true,
//                 },
//               },
//             },
//           },
//         },
//         orderBy: { createdAt: 'desc' },
//       }),
//       this.prisma.savedJob.count({ where: { userId } }),
//     ]);

//     return {
//       savedJobs,
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     };
//   }

//   // Unsave a job
//   async unsave(userId: string, jobId: string) {
//     const savedJob = await this.prisma.savedJob.findUnique({
//       where: {
//         userId_jobId: {
//           userId,
//           jobId,
//         },
//       },
//     });

//     if (!savedJob) {
//       throw new NotFoundException('Saved job not found');
//     }

//     await this.prisma.savedJob.delete({
//       where: {
//         userId_jobId: {
//           userId,
//           jobId,
//         },
//       },
//     });

//     return { message: 'Job removed from saved list' };
//   }

//   // Check if job is saved by user
//   async isSaved(userId: string, jobId: string) {
//     const savedJob = await this.prisma.savedJob.findUnique({
//       where: {
//         userId_jobId: {
//           userId,
//           jobId,
//         },
//       },
//     });

//     return { isSaved: !!savedJob };
//   }
// }
