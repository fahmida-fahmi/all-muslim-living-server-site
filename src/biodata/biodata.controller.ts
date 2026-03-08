import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BiodataService } from './biodata.service';
import { CreateBiodataDto } from './dto/create-biodata.dto';
import { UpdateBiodataDto } from './dto/update-biodata.dto';
import { FilterBiodataDto } from './dto/filter-biodata.dto';
import { ShortlistService } from './shortlist.service';

const uid = (req: any): string =>
  req.user?.id ?? req.user?.userId ?? req.user?.sub;

@Controller('biodatas')
export class BiodataController {
  constructor(
    private readonly biodataService: BiodataService,
    private readonly shortlistService: ShortlistService,
  ) {}

  // ─── CREATE ────────────────────────────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() dto: CreateBiodataDto) {
    return this.biodataService.create(uid(req), dto);
  }

  // ─── STATIC ROUTES FIRST (order matters in NestJS!) ───────────────────────

  // GET /biodatas  — public list with filters
  @Get()
  findAll(@Query() query: FilterBiodataDto) {
    return this.biodataService.findAll(query);
  }

  // GET /biodatas/me  — logged-in user's own biodata
  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMine(@Req() req: any) {
    return this.biodataService.findByUser(uid(req));
  }

  // GET /biodatas/custom/AILM-00001  — public profile by customId
  @Get(':customId')
  findByCustomId(@Param('customId') customId: string) {
    return this.biodataService.findByCustomId(customId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.biodataService.findOne(id);
  }

  // PATCH /biodatas/:id
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateBiodataDto,
  ) {
    return this.biodataService.update(id, uid(req), dto);
  }

  // DELETE /biodatas/:id
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.biodataService.remove(id, uid(req));
  }

  @Post(':id/shortlist')
  @UseGuards(JwtAuthGuard)
  shortlistAdd(@Param('id') id: string, @Req() req: any) {
    return this.shortlistService.add(uid(req), id);
  }

  // DELETE /biodatas/:id/shortlist  — remove bookmark
  @Delete(':id/shortlist')
  @UseGuards(JwtAuthGuard)
  shortlistRemove(@Param('id') id: string, @Req() req: any) {
    return this.shortlistService.remove(uid(req), id);
  }

  // GET /biodatas/:id/shortlisted  — is bookmarked?
  @Get(':id/shortlisted')
  @UseGuards(JwtAuthGuard)
  shortlistStatus(@Param('id') id: string, @Req() req: any) {
    return this.shortlistService.status(uid(req), id);
  }
}
