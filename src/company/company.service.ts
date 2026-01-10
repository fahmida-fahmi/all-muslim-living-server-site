import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async findByUserId(userId: string) {
    return this.prisma.company.findMany({
      where: { ownerId: userId },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        jobs: {
          select: { id: true, title: true, isActive: true },
        },
        _count: {
          select: { jobs: true, teamMembers: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.company.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            phone: true,
          },
        },
        jobs: true,
        teamMembers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  async create(
    dto: CreateCompanyDto,
    files: { logo?: Express.Multer.File[]; coverImage?: Express.Multer.File[] },
    userId: string,
  ) {
    // Handle file uploads
    let logoUrl = null;
    let coverImageUrl = null;

    if (files?.logo?.[0]) {
      logoUrl = await this.saveFile(files.logo[0]);
    }
    if (files?.coverImage?.[0]) {
      coverImageUrl = await this.saveFile(files.coverImage[0]);
    }

    // Generate slug
    const slug = this.generateSlug(dto.name);

    // Auto-fetch data if website provided
    let autoData = {};
    if (dto.website && !dto.description) {
      autoData = await this.scrapeWebsite(dto.website);
    }

    return this.prisma.company.create({
      data: {
        name: dto.name,
        slug,
        logo: logoUrl || autoData['logo'],
        coverImage: coverImageUrl,
        description: dto.description || autoData['description'],
        type: dto.type,
        email: dto.email || autoData['email'],
        phone: dto.phone || autoData['phone'],
        website: dto.website,
        linkedIn: dto.linkedIn || autoData['linkedIn'],
        facebook: dto.facebook || autoData['facebook'],
        industry: dto.industry,
        size: dto.size,
        founded: dto.founded ? parseInt(dto.founded) : null,
        tagline: dto.tagline,
        address: dto.address || autoData['address'],
        city: dto.city,
        state: dto.state,
        zipCode: dto.zipCode,
        country: dto.country || 'Bangladesh',
        ownerId: userId,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    dto: UpdateCompanyDto,
    files: { logo?: Express.Multer.File[]; coverImage?: Express.Multer.File[] },
    userId: string,
  ) {
    // Verify ownership
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company || company.ownerId !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    // Handle file uploads
    let logoUrl = company.logo;
    let coverImageUrl = company.coverImage;

    if (files?.logo?.[0]) {
      // Delete old logo
      if (company.logo) this.deleteFile(company.logo);
      logoUrl = await this.saveFile(files.logo[0]);
    }
    if (files?.coverImage?.[0]) {
      // Delete old cover
      if (company.coverImage) this.deleteFile(company.coverImage);
      coverImageUrl = await this.saveFile(files.coverImage[0]);
    }

    return this.prisma.company.update({
      where: { id },
      data: {
        name: dto.name,
        logo: logoUrl,
        coverImage: coverImageUrl,
        description: dto.description,
        type: dto.type,
        email: dto.email,
        phone: dto.phone,
        website: dto.website,
        linkedIn: dto.linkedIn,
        facebook: dto.facebook,
        industry: dto.industry,
        size: dto.size,
        founded: dto.founded ? parseInt(dto.founded) : null,
        tagline: dto.tagline,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        zipCode: dto.zipCode,
        country: dto.country,
      },
      include: {
        owner: true,
      },
    });
  }

  async delete(id: string, userId: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company || company.ownerId !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    // Delete files
    if (company.logo) this.deleteFile(company.logo);
    if (company.coverImage) this.deleteFile(company.coverImage);

    await this.prisma.company.delete({ where: { id } });
    return { message: 'Company deleted successfully' };
  }

  async scrapeWebsite(url: string) {
    try {
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);

      return {
        name:
          $('title').text().split('|')[0].trim() ||
          $('meta[property="og:site_name"]').attr('content') ||
          '',
        description:
          $('meta[name="description"]').attr('content') ||
          $('meta[property="og:description"]').attr('content') ||
          '',
        logo:
          $('meta[property="og:image"]').attr('content') ||
          $('link[rel="icon"]').attr('href') ||
          '',
        email:
          $('a[href^="mailto:"]')
            .first()
            .attr('href')
            ?.replace('mailto:', '') || '',
        phone:
          $('a[href^="tel:"]').first().attr('href')?.replace('tel:', '') || '',
        linkedIn: $('a[href*="linkedin.com"]').first().attr('href') || '',
        facebook: $('a[href*="facebook.com"]').first().attr('href') || '',
        address:
          $('[itemtype*="PostalAddress"]').text().trim() ||
          $('address').first().text().trim() ||
          '',
      };
    } catch (error) {
      console.error('Scraping error:', error);
      return {};
    }
  }

  private generateSlug(name: string): string {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') +
      '-' +
      uuidv4().slice(0, 8)
    );
  }

  private saveFile(file: Express.Multer.File): Promise<string> {
    const uploadDir = './uploads/companies';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${uuidv4()}${path.extname(file.originalname)}`;
    const filepath = path.join(uploadDir, filename);

    fs.writeFileSync(filepath, file.buffer);
    return Promise.resolve(`/uploads/companies/${filename}`);
  }

  private deleteFile(filepath: string) {
    try {
      const fullPath = `.${filepath}`;
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
}
