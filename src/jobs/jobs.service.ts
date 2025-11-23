import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { QueryJobDto } from './dto/query-job.dto';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async createJob(companyId: string, createJobDto: CreateJobDto) {
    // Validate salary range if both are provided
    if (createJobDto.salaryMin && createJobDto.salaryMax) {
      if (createJobDto.salaryMin > createJobDto.salaryMax) {
        throw new ForbiddenException(
          'Minimum salary cannot be greater than maximum salary',
        );
      }
    }

    const job = await this.prisma.job.create({
      data: {
        ...createJobDto,
        companyId,
      },
      include: {
        company: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return {
      message: 'Job created successfully',
      job,
    };
  }

  async updateJob(
    jobId: string,
    companyId: string,
    updateJobDto: UpdateJobDto,
  ) {
    // Check if job exists
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check if the company owns this job
    if (job.companyId !== companyId) {
      throw new ForbiddenException('You are not authorized to update this job');
    }

    // Validate salary range if both are provided
    if (updateJobDto.salaryMin && updateJobDto.salaryMax) {
      if (updateJobDto.salaryMin > updateJobDto.salaryMax) {
        throw new ForbiddenException(
          'Minimum salary cannot be greater than maximum salary',
        );
      }
    }

    const updatedJob = await this.prisma.job.update({
      where: { id: jobId },
      data: updateJobDto,
      include: {
        company: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return {
      message: 'Job updated successfully',
      job: updatedJob,
    };
  }

  // Get single job by ID
  async getJobById(jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: {
          select: {
            id: true,
            email: true,
            role: true,
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

    return job;
  }

  // Get all jobs with filters, search, and pagination
  async getAllJobs(queryDto: QueryJobDto) {
    const {
      search,
      category,
      type,
      location,
      salaryMin,
      salaryMax,
      isClosed,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Search in title and description
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (type) {
      where.type = type;
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (salaryMin !== undefined || salaryMax !== undefined) {
      where.AND = where.AND || [];

      if (salaryMin !== undefined) {
        where.AND.push({
          OR: [{ salaryMax: { gte: salaryMin } }, { salaryMax: null }],
        });
      }

      if (salaryMax !== undefined) {
        where.AND.push({
          OR: [{ salaryMin: { lte: salaryMax } }, { salaryMin: null }],
        });
      }
    }

    if (isClosed !== undefined) {
      where.isClosed = isClosed;
    }

    // Get total count for pagination
    const total = await this.prisma.job.count({ where });

    // Get jobs with pagination
    const jobs = await this.prisma.job.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        company: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    return {
      data: jobs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get jobs posted by a specific company
  async getJobsByCompany(companyId: string, queryDto: any) {
    const { page = 1, limit = 10, isClosed } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = { companyId };

    if (isClosed !== undefined) {
      where.isClosed = isClosed;
    }

    const total = await this.prisma.job.count({ where });

    const jobs = await this.prisma.job.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    return {
      data: jobs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
