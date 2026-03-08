// biodata.service.ts  — fix for userId: undefined crash
//
// ROOT CAUSE: JwtAuthGuard is attaching user to req.user but the controller
// is passing req.user.id (or req.user.userId) — one of them is undefined.
// This service now guards against that and throws a clear 401 instead of 500.
//
// ── HOW TO USE ───────────────────────────────────────────────────────────────
// In your biodata.controller.ts make sure you extract userId like this:
//
//   @Post()
//   @UseGuards(JwtAuthGuard)
//   create(@Req() req, @Body() dto: CreateBiodataDto) {
//     const userId = req.user?.id ?? req.user?.userId ?? req.user?.sub;
//     return this.biodataService.create(userId, dto);
//   }
//
//   @Patch(':id')
//   @UseGuards(JwtAuthGuard)
//   update(@Param('id') id: string, @Req() req, @Body() dto: UpdateBiodataDto) {
//     const userId = req.user?.id ?? req.user?.userId ?? req.user?.sub;
//     return this.biodataService.update(id, userId, dto);
//   }
// ─────────────────────────────────────────────────────────────────────────────

import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBiodataDto } from './dto/create-biodata.dto';
import { UpdateBiodataDto } from './dto/update-biodata.dto';
import { FilterBiodataDto } from './dto/filter-biodata.dto';

@Injectable()
export class BiodataService {
  constructor(private readonly prisma: PrismaService) {}

  // ── helper: extract userId safely ─────────────────────────────────────────
  private resolveUserId(userId: string | undefined): string {
    if (!userId) {
      throw new UnauthorizedException(
        'Could not resolve user ID from token. ' +
          'Check that JwtStrategy returns { id } or { userId } or { sub }.',
      );
    }
    return userId;
  }

  private async generateCustomId(gender: string | undefined): Promise<string> {
    const genderChar = gender === 'FEMALE' ? 'F' : 'M';

    // Use a transaction to avoid race conditions under concurrent creates
    return this.prisma.$transaction(async (tx) => {
      const count = await tx.biodata.count();
      const seq = String(count + 1).padStart(5, '0'); // 00001 → 99999
      return `AIL${genderChar}-${seq}`; // AILM-00001
    });
  }

  // ── CREATE ─────────────────────────────────────────────────────────────────
  async create(userId: string | undefined, dto: CreateBiodataDto) {
    const uid = this.resolveUserId(userId);

    // prevent duplicate biodata per user
    const existing = await this.prisma.biodata.findUnique({
      where: { userId: uid },
    });
    if (existing) {
      throw new ConflictException('You already have a biodata profile.');
    }
    const customId = await this.generateCustomId(dto.gender as string);

    return this.prisma.biodata.create({
      data: { ...dto, userId: uid, customId },
    });
  }

  // ── UPDATE (PATCH) ─────────────────────────────────────────────────────────
  async update(id: string, userId: string | undefined, dto: UpdateBiodataDto) {
    const uid = this.resolveUserId(userId);

    const existing = await this.prisma.biodata.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Biodata not found.');
    if (existing.userId !== uid) {
      throw new UnauthorizedException('You can only edit your own biodata.');
    }

    // If gender changed, update the M/F letter in customId
    let customIdPatch = {};
    if (dto.gender && existing.customId) {
      const newChar = dto.gender === 'FEMALE' ? 'F' : 'M';
      const currChar = existing.customId[3]; // AIL[M]-00001
      if (currChar !== newChar) {
        customIdPatch = {
          customId: existing.customId.replace(/^AIL[MF]/, `AIL${newChar}`),
        };
      }
    }
    return this.prisma.biodata.update({
      where: { id },
      data: { ...dto, ...customIdPatch },
    });
  }

  // async findAll() {
  //   return this.prisma.biodata.findMany({
  //     orderBy: { createdAt: 'desc' },
  //   });
  // }

  // ── FIND by customId — used by public profile URL /biodata/AILM-00001 ──────
  async findByCustomId(customId: string) {
    const b = await this.prisma.biodata.findUnique({ where: { customId } });
    if (!b) throw new NotFoundException(`Biodata ${customId} not found.`);
    return b;
  }

  // ── FIND ONE by biodata ID ─────────────────────────────────────────────────
  async findOne(id: string) {
    const biodata = await this.prisma.biodata.findUnique({ where: { id } });
    if (!biodata) throw new NotFoundException('Biodata not found.');
    return biodata;
  }

  // ── FIND ONE by userId (for dashboard / "my biodata") ─────────────────────
  async findByUser(userId: string | undefined) {
    const uid = this.resolveUserId(userId);
    const biodata = await this.prisma.biodata.findUnique({
      where: { userId: uid },
    });
    if (!biodata)
      throw new NotFoundException('No biodata found for this user.');
    return biodata;
  }

  // ── DELETE ─────────────────────────────────────────────────────────────────
  async remove(id: string, userId: string | undefined) {
    const uid = this.resolveUserId(userId);
    const existing = await this.prisma.biodata.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Biodata not found.');
    if (existing.userId !== uid) {
      throw new UnauthorizedException('You can only delete your own biodata.');
    }
    return this.prisma.biodata.delete({ where: { id } });
  }

  async findAll(query: FilterBiodataDto) {
    const page = Math.max(1, parseInt(query.page ?? '1'));
    const limit = Math.min(50, parseInt(query.limit ?? '12'));
    const skip = (page - 1) * limit;

    // ── build Prisma where clause ──────────────────────────────────
    const where: any = {};

    if (query.gender) where.gender = query.gender;
    if (query.country)
      where.country = { contains: query.country, mode: 'insensitive' };
    if (query.financialStatus) where.financialStatus = query.financialStatus;

    // comma-separated enum arrays
    if (query.maritalStatus)
      where.maritalStatus = { in: query.maritalStatus.split(',') };
    if (query.religion) where.religion = { in: query.religion.split(',') };
    if (query.complexion)
      where.complexion = { in: query.complexion.split(',') };
    if (query.educationLevel)
      where.educationLevel = { in: query.educationLevel.split(',') };

    // occupation — stored as string (not enum), use contains OR
    if (query.occupation) {
      const occ = query.occupation.split(',');
      where.OR = occ.map((o) => ({
        occupation: { contains: o, mode: 'insensitive' },
      }));
    }

    // age range — birthYear is stored as string e.g. "1995"
    if (query.ageFrom || query.ageTo) {
      const currentYear = new Date().getFullYear();
      const yearFrom = query.ageTo
        ? String(currentYear - parseInt(query.ageTo))
        : undefined;
      const yearTo = query.ageFrom
        ? String(currentYear - parseInt(query.ageFrom))
        : undefined;
      where.birthYear = {
        ...(yearFrom ? { gte: yearFrom } : {}),
        ...(yearTo ? { lte: yearTo } : {}),
      };
    }

    // ── only show APPROVED / visible biodatas ─────────────────────
    // Uncomment if you have a status/isVisible field:
    // where.status = 'APPROVED';

    const [biodatas, total] = await Promise.all([
      this.prisma.biodata.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        // ── select only safe public fields (hide contact info) ────
        select: {
          id: true,
          customId: true,
          gender: true,
          birthYear: true,
          height: true,
          religion: true,
          maritalStatus: true,
          occupation: true,
          city: true,
          country: true,
          complexion: true,
          educationLevel: true,
          financialStatus: true,
        },
      }),
      this.prisma.biodata.count({ where }),
    ]);

    return {
      biodatas,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
