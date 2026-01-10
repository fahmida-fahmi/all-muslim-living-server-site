import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SavedJobsService } from './saved-jobs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('saved-jobs')
@UseGuards(JwtAuthGuard)
export class SavedJobsController {
  constructor(private readonly savedJobsService: SavedJobsService) {}

  @Post(':jobId')
  save(@Request() req, @Param('jobId') jobId: string) {
    return this.savedJobsService.save(req.user.userId, jobId);
  }

  @Get()
  findUserSavedJobs(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.savedJobsService.findUserSavedJobs(
      req.user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('check/:jobId')
  isSaved(@Request() req, @Param('jobId') jobId: string) {
    return this.savedJobsService.isSaved(req.user.userId, jobId);
  }

  @Delete(':jobId')
  unsave(@Request() req, @Param('jobId') jobId: string) {
    return this.savedJobsService.unsave(req.user.userId, jobId);
  }
}
