import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { UserService } from './users/users.service';
import { AuthModule } from './auth/auth.module';
import { JobsModule } from './jobs/jobs.module';
import { CompanyController } from './company/company.controller';
import { CompanyService } from './company/company.service';
import { JobApplicationsModule } from './job-applications/job-applications.module';
import { SavedJobsController } from './saved-jobs/saved-jobs.controller';
import { SavedJobsService } from './saved-jobs/saved-jobs.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    JobsModule,
    JobApplicationsModule,
  ],
  controllers: [AppController, CompanyController, SavedJobsController],
  providers: [AppService, UserService, CompanyService, SavedJobsService],
})
export class AppModule {}
