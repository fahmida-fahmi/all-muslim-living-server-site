import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SendInterestDto {
  @IsString()
  @IsNotEmpty()
  receiverBiodataId: string;

  @IsOptional()
  @IsString()
  message?: string;
}

export class RespondInterestDto {
  @IsString()
  @IsNotEmpty()
  status: 'ACCEPTED' | 'REJECTED';
}
