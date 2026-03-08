import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShortlistService {
  constructor(private readonly prisma: PrismaService) {}

  private resolveUserId(userId: string | undefined): string {
    if (!userId)
      throw new UnauthorizedException('Could not resolve user ID from token.');
    return userId;
  }

  async add(userId: string | undefined, biodataId: string) {
    const uid = this.resolveUserId(userId);
    const bio = await this.prisma.biodata.findUnique({
      where: { id: biodataId },
    });
    if (!bio) throw new NotFoundException('Biodata not found');
    try {
      await this.prisma.shortlist.create({ data: { userId: uid, biodataId } });
      return { shortlisted: true };
    } catch (e) {
      if (e.code === 'P2002')
        throw new ConflictException('Already shortlisted');
      throw e;
    }
  }

  async remove(userId: string | undefined, biodataId: string) {
    const uid = this.resolveUserId(userId);
    const entry = await this.prisma.shortlist.findUnique({
      where: { userId_biodataId: { userId: uid, biodataId } },
    });
    if (!entry) throw new NotFoundException('Not in shortlist');
    await this.prisma.shortlist.delete({
      where: { userId_biodataId: { userId: uid, biodataId } },
    });
    return { shortlisted: false };
  }

  async status(userId: string | undefined, biodataId: string) {
    const uid = this.resolveUserId(userId);
    const entry = await this.prisma.shortlist.findUnique({
      where: { userId_biodataId: { userId: uid, biodataId } },
    });
    return { shortlisted: !!entry };
  }

  async myShortlist(userId: string | undefined) {
    const uid = this.resolveUserId(userId);
    const items = await this.prisma.shortlist.findMany({
      where: { userId: uid },
      orderBy: { createdAt: 'desc' },
      include: {
        biodata: {
          select: {
            id: true,
            customId: true,
            gender: true,
            birthYear: true,
            maritalStatus: true,
            religion: true,
            height: true,
            complexion: true,
            occupation: true,
            city: true,
            country: true,
          },
        },
      },
    });
    return { total: items.length, shortlists: items };
  }
}
