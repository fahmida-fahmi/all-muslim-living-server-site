// src/jobs/jobs.service.ts

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { FilterJobDto } from './dto/filter-job.dto';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // CREATE JOB
  // ============================================
  async create(userId: string, createJobDto: CreateJobDto) {
    const slug = this.generateSlug(createJobDto.title);

    let uniqueSlug = slug;
    let counter = 1;
    while (await this.prisma.job.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter++}`;
    }

    if (createJobDto.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: createJobDto.companyId },
        include: { teamMembers: true },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      const hasAccess =
        company.ownerId === userId ||
        company.teamMembers.some((member) => member.id === userId);

      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this company');
      }
    }

    const jobData: any = {
      title: createJobDto.title,
      slug: uniqueSlug,
      description: createJobDto.description,
      requirements: createJobDto.requirements,
      responsibilities: createJobDto.responsibilities,
      category: createJobDto.category,
      jobType: createJobDto.jobType,
      experience: createJobDto.experience,
      education: createJobDto.education,
      skills: createJobDto.skills ?? [],
      salaryMin: createJobDto.salaryMin,
      salaryMax: createJobDto.salaryMax,
      salaryCurrency: createJobDto.salaryCurrency,
      benefits: createJobDto.benefits ?? [],
      location: createJobDto.location,
      city: createJobDto.city,
      totalPositions: createJobDto.totalPositions,
      isFeatured: createJobDto.isFeatured,
      metaTitle: createJobDto.metaTitle,
      metaDescription: createJobDto.metaDescription,
      poster: {
        connect: { id: userId },
      },
      // ✅ OPTIONAL RELATION
      ...(createJobDto.companyId && {
        company: {
          connect: { id: createJobDto.companyId },
        },
      }),
      applicationDeadline: createJobDto.applicationDeadline
        ? new Date(createJobDto.applicationDeadline)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    return this.prisma.job.create({
      data: jobData,
      include: {
        poster: {
          select: {
            id: true,
            firstName: true,
            email: true,
            avatar: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            city: true,
          },
        },
      },
    });
  }

  // ============================================
  // GET ALL JOBS (with filters & pagination)
  // ============================================
  async findAll(filterDto: FilterJobDto) {
    const {
      search,
      city,
      jobType,
      experience,
      skills,
      salaryMin,
      salaryMax,
      isRemote,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filterDto;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true,
    };

    // Search in title and description
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (jobType) {
      where.jobType = jobType;
    }

    if (experience) {
      where.experience = experience;
    }

    // Filter by skills (has any of the skills)
    if (skills && skills.length > 0) {
      where.skills = {
        hasSome: skills,
      };
    }

    // Salary range filter
    if (salaryMin) {
      where.salaryMin = { gte: parseInt(salaryMin.toString()) };
    }

    if (salaryMax) {
      where.salaryMax = { lte: parseInt(salaryMax.toString()) };
    }

    if (isRemote !== undefined) {
      where.isRemote = isRemote;
    }

    // Check if applicationDeadline hasn't passed
    where.applicationDeadline = {
      gte: new Date(),
    };

    // Execute query with pagination
    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip,
        take: limit,
        include: {
          poster: {
            select: {
              id: true,
              firstName: true,
              avatar: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              city: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      jobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    };
  }

  // ============================================
  // GET SINGLE JOB BY ID
  // ============================================
  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        poster: {
          select: {
            id: true,
            firstName: true,
            email: true,
            avatar: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            description: true,
            city: true,
            website: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Increment view count
    await this.prisma.job.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return job;
  }

  // ============================================
  // GET JOB BY SLUG
  // ============================================
  async findBySlug(slug: string) {
    const job = await this.prisma.job.findUnique({
      where: { slug },
      include: {
        poster: {
          select: {
            id: true,
            firstName: true,
            email: true,
            avatar: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            description: true,
            city: true,
            website: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Increment view count
    await this.prisma.job.update({
      where: { slug },
      data: { views: { increment: 1 } },
    });

    return job;
  }

  // ============================================
  // GET USER'S POSTED JOBS
  // ============================================
  async findUserJobs(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where: { posterId: userId },
        skip,
        take: limit,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.job.count({ where: { posterId: userId } }),
    ]);

    return {
      jobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ============================================
  // GET COMPANY JOBS
  // ============================================
  async findCompanyJobs(companyId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where: { companyId, isActive: true },
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.job.count({ where: { companyId, isActive: true } }),
    ]);

    return {
      jobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ============================================
  // UPDATE JOB
  // ============================================
  async update(id: string, userId: string, updateJobDto: UpdateJobDto) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        company: {
          include: {
            teamMembers: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check if user has permission to update
    const isOwner = job.posterId === userId;
    const isCompanyOwner = job.company?.ownerId === userId;
    const isTeamMember = job.company?.teamMembers.some(
      (member) => member.id === userId,
    );

    if (!isOwner && !isCompanyOwner && !isTeamMember) {
      throw new ForbiddenException(
        'You do not have permission to update this job',
      );
    }

    // Update job
    const updatedJob = await this.prisma.job.update({
      where: { id },
      data: {
        ...updateJobDto,
        applicationDeadline: updateJobDto.applicationDeadline
          ? new Date(updateJobDto.applicationDeadline)
          : undefined,
      },
      include: {
        poster: {
          select: {
            id: true,
            firstName: true,
            avatar: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    return updatedJob;
  }

  // ============================================
  // DELETE JOB (Soft delete - set isActive to false)
  // ============================================
  async remove(id: string, userId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        company: {
          include: {
            teamMembers: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check permission
    const isOwner = job.posterId === userId;
    const isCompanyOwner = job.company?.ownerId === userId;
    const isTeamMember = job.company?.teamMembers.some(
      (member) => member.id === userId,
    );

    if (!isOwner && !isCompanyOwner && !isTeamMember) {
      throw new ForbiddenException(
        'You do not have permission to delete this job',
      );
    }

    // Soft delete
    await this.prisma.job.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Job deleted successfully' };
  }

  // ============================================
  // TOGGLE JOB ACTIVE STATUS
  // ============================================
  async toggleActive(id: string, userId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.posterId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to modify this job',
      );
    }

    const updatedJob = await this.prisma.job.update({
      where: { id },
      data: { isActive: !job.isActive },
    });

    return updatedJob;
  }

  // ============================================
  // GET JOB STATISTICS
  // ============================================
  async getJobStats(jobId: string, userId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.posterId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to view these statistics',
      );
    }

    const [
      totalApplications,
      pendingApplications,
      shortlistedApplications,
      acceptedApplications,
      rejectedApplications,
    ] = await Promise.all([
      this.prisma.jobApplication.count({ where: { jobId } }),
      this.prisma.jobApplication.count({ where: { jobId, status: 'PENDING' } }),
      this.prisma.jobApplication.count({
        where: { jobId, status: 'SHORTLISTED' },
      }),
      this.prisma.jobApplication.count({
        where: { jobId, status: 'ACCEPTED' },
      }),
      this.prisma.jobApplication.count({
        where: { jobId, status: 'REJECTED' },
      }),
    ]);

    return {
      views: job.views,
      totalApplications,
      pendingApplications,
      shortlistedApplications,
      acceptedApplications,
      rejectedApplications,
      isActive: job.isActive,
      applicationDeadline: job.applicationDeadline,
      daysRemaining: job.applicationDeadline
        ? Math.ceil(
            (job.applicationDeadline.getTime() - Date.now()) /
              (1000 * 60 * 60 * 24),
          )
        : null,
    };
  }

  // ============================================
  // SEARCH SIMILAR JOBS
  // ============================================
  async findSimilar(jobId: string, limit = 5) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Find jobs with similar skills or in same city
    const similarJobs = await this.prisma.job.findMany({
      where: {
        id: { not: jobId },
        isActive: true,
        OR: [
          { skills: { hasSome: job.skills } },
          { city: job.city },
          { jobType: job.jobType },
        ],
      },
      take: limit,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return similarJobs;
  }

  // ============================================
  // HELPER: Generate slug from title
  // ============================================
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
