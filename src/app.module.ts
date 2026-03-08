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
import { BiodataService } from './biodata/biodata.service';
import { BiodataModule } from './biodata/biodata.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.docker' : '.env',
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    JobsModule,
    JobApplicationsModule,
    BiodataModule,
  ],
  controllers: [AppController, CompanyController, SavedJobsController],
  providers: [AppService, UserService, CompanyService, SavedJobsService, BiodataService],
})
export class AppModule {}
