import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CompanyService } from './company.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('company')
@UseGuards(JwtAuthGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  async getUserCompanies(@Request() req) {
    return this.companyService.findByUserId(req.user.userId);
  }

  @Get(':id')
  async getCompany(@Param('id') id: string, @Request() req) {
    const company = await this.companyService.findOne(id);
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    // Check if user owns this company
    if (company.ownerId !== req.user.userId) {
      throw new BadRequestException('Unauthorized');
    }
    return company;
  }

  @Post()
  // @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
    ]),
  )
  async createCompany(
    @Body() createCompanyDto: CreateCompanyDto,
    @UploadedFiles()
    files: { logo?: Express.Multer.File[]; coverImage?: Express.Multer.File[] },
    @Request() req,
  ) {
    console.log('Creating company with data:', req.user.userId);
    return this.companyService.create(createCompanyDto, files, req.user.userId);
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
    ]),
  )
  async updateCompany(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @UploadedFiles()
    files: { logo?: Express.Multer.File[]; coverImage?: Express.Multer.File[] },
    @Request() req,
  ) {
    console.log(
      'Updating company with ID:',
      id,
      updateCompanyDto,
      files,
      req.user.userId,
    );
    return this.companyService.update(
      id,
      updateCompanyDto,
      files,
      req.user.userId,
    );
  }

  @Delete(':id')
  async deleteCompany(@Param('id') id: string, @Request() req) {
    return this.companyService.delete(id, req.user.userId);
  }

  @Post('scrape')
  async scrapeWebsite(@Body() body: { url: string }) {
    if (!body.url) {
      throw new BadRequestException('URL is required');
    }
    return this.companyService.scrapeWebsite(body.url);
  }
}
