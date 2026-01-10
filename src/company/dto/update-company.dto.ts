// update-company.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyDto } from './company.dto';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}
