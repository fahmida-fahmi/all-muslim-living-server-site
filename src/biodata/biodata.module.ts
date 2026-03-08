import { Module } from '@nestjs/common';
import { BiodataController } from './biodata.controller';
import { BiodataService } from './biodata.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ShortlistModule } from './shortlist.module';

@Module({
  imports: [PrismaModule, ShortlistModule],
  controllers: [BiodataController],
  providers: [BiodataService],
  exports: [BiodataService],
})
export class BiodataModule {}
