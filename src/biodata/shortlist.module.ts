import { PrismaModule } from '../prisma/prisma.module';
// import { BiodataController } from './biodata.controller';
import { ShortlistService } from './shortlist.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  // controllers: [BiodataController],
  providers: [ShortlistService],
  exports: [ShortlistService], // ← এটা থাকতে হবে
})
export class ShortlistModule {}
