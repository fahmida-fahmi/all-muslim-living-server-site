import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class JobApplicationsService {
  constructor(private prisma: PrismaService) {}

  // Apply for a job
  async create(
    userId: string,
    createApplicationDto: CreateJobApplicationDto,
    resumeFile?: Express.Multer.File,
  ) {
    const { jobId, coverLetter, portfolio, expectedSalary, availableFrom } =
      createApplicationDto;

    // Check if job exists and is active
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (!job.isActive) {
      throw new BadRequestException(
        'This job is no longer accepting applications',
      );
    }

    // Check if deadline has passed
    if (job.applicationDeadline && job.applicationDeadline < new Date()) {
      throw new BadRequestException('Application deadline has passed');
    }

    // Check if user already applied
    const existingApplication = await this.prisma.jobApplication.findUnique({
      where: {
        jobId_applicantId: {
          jobId,
          applicantId: userId,
        },
      },
    });

    if (existingApplication) {
      throw new BadRequestException('You have already applied for this job');
    }

    // Create application
    const application = await this.prisma.jobApplication.create({
      data: {
        jobId,
        applicantId: userId,
        coverLetter,
        portfolio,
        expectedSalary: expectedSalary
          ? parseInt(expectedSalary.toString())
          : null,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        resume: resumeFile?.path,
      },
      include: {
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
      },
    });

    // Increment applications count
    await this.prisma.job.update({
      where: { id: jobId },
      data: { applicationsCount: { increment: 1 } },
    });

    return application;
  }

  async findAll(page = 1, limit = 10, status?: ApplicationStatus) {
    const skip = (page - 1) * limit;

    const whereCondition: any = {};

    if (status) {
      whereCondition.status = status;
    }

    const [applications, total] = await Promise.all([
      this.prisma.jobApplication.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              slug: true,
              location: true,
              jobType: true,
            },
          },
          applicant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),

      this.prisma.jobApplication.count({
        where: whereCondition,
      }),
    ]);

    return {
      success: true,
      data: applications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get user's applications with filters
  async findUserApplications(
    userId: string,
    status?: ApplicationStatus,
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;

    const where: any = { applicantId: userId };
    if (status) {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      this.prisma.jobApplication.findMany({
        where,
        skip,
        take: limit,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              slug: true,
              location: true,
              jobType: true,
              salaryMin: true,
              salaryMax: true,
              salaryCurrency: true,
              company: {
                select: {
                  id: true,
                  name: true,
                  logo: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.jobApplication.count({ where }),
    ]);

    return {
      applications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get single application
  async findOne(id: string, userId: string) {
    const application = await this.prisma.jobApplication.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.applicantId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this application',
      );
    }

    return application;
  }

  // Withdraw application
  async withdraw(id: string, userId: string) {
    const application = await this.prisma.jobApplication.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.applicantId !== userId) {
      throw new ForbiddenException(
        'You can only withdraw your own applications',
      );
    }

    if (application.status === 'ACCEPTED') {
      throw new BadRequestException('Cannot withdraw an accepted application');
    }

    await this.prisma.jobApplication.update({
      where: { id },
      data: { status: 'WITHDRAWN' },
    });

    await this.prisma.job.update({
      where: { id: application.jobId },
      data: { applicationsCount: { decrement: 1 } },
    });

    return { message: 'Application withdrawn successfully' };
  }
}
