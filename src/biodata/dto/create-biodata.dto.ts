import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsArray,
  IsEmail,
  Min,
  Max,
} from 'class-validator';

import {
  GenderForBiodata,
  ProfileFor,
  MaritalStatus,
  Religion,
  VisaStatus,
  YesNo,
  Complexion,
  DietType,
  DrinkOption,
  SmokeOption,
  CoveringOption,
  BeardOption,
  FinancialStatus,
  ContactVisibility,
} from '@prisma/client';
export class CreateBiodataDto {
  // STEP 1 — BASIC INFO
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsEnum(GenderForBiodata) gender?: GenderForBiodata;
  @IsOptional() @IsEnum(ProfileFor) profileFor?: ProfileFor;
  @IsOptional() @IsEnum(MaritalStatus) maritalStatus?: MaritalStatus;
  @IsOptional() @IsString() birthMonth?: string;
  @IsOptional() @IsString() birthDay?: string;
  @IsOptional() @IsString() birthYear?: string;
  @IsOptional() @IsEnum(Religion) religion?: Religion;
  @IsOptional() @IsString() educationLevel?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsEmail() email?: string;

  // STEP 2 — LOCATION
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() nationality?: string;
  @IsOptional() @IsString() placeOfBirth?: string;
  @IsOptional() @IsEnum(VisaStatus) visaStatus?: VisaStatus;
  @IsOptional() @IsEnum(YesNo) livingWithFamily?: YesNo;
  @IsOptional() @IsString() familyCountry?: string;
  @IsOptional() @IsString() familyCity?: string;

  // STEP 3 — APPEARANCE
  @IsOptional() @IsString() height?: string;
  @IsOptional() @IsString() weight?: string;
  @IsOptional() @IsEnum(Complexion) complexion?: Complexion;
  @IsOptional() @IsEnum(DietType) diet?: DietType;
  @IsOptional() @IsEnum(DrinkOption) drink?: DrinkOption;
  @IsOptional() @IsEnum(SmokeOption) smoke?: SmokeOption;
  @IsOptional() @IsEnum(CoveringOption) hijab?: CoveringOption;
  @IsOptional() @IsEnum(CoveringOption) niqab?: CoveringOption;
  @IsOptional() @IsEnum(BeardOption) beard?: BeardOption;
  @IsOptional() @IsArray() @IsString({ each: true }) languages?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) skills?: string[];

  // STEP 4 — EDUCATION
  @IsOptional() @IsString() fieldOfStudy?: string;
  @IsOptional() @IsString() institution?: string;
  @IsOptional() @IsString() graduationYear?: string;
  @IsOptional() @IsString() otherQualifications?: string;

  // STEP 5 — CAREER
  @IsOptional() @IsString() occupation?: string;
  @IsOptional() @IsString() professionDescription?: string;
  @IsOptional() @IsString() monthlyIncome?: string;

  // STEP 6 — FAMILY
  @IsOptional() @IsString() fatherName?: string;
  @IsOptional() @IsEnum(YesNo) fatherAlive?: YesNo;
  @IsOptional() @IsString() fatherProfession?: string;
  @IsOptional() @IsString() motherName?: string;
  @IsOptional() @IsEnum(YesNo) motherAlive?: YesNo;
  @IsOptional() @IsString() motherProfession?: string;
  @IsOptional() @IsString() brothersCount?: string;
  @IsOptional() @IsString() sistersCount?: string;
  @IsOptional() @IsEnum(FinancialStatus) financialStatus?: FinancialStatus;
  @IsOptional() @IsString() religiousCondition?: string;

  // STEP 7 — PARTNER PREFERENCES
  @IsOptional() @IsInt() @Min(18) @Max(100) partnerAgeMin?: number;
  @IsOptional() @IsInt() @Min(18) @Max(100) partnerAgeMax?: number;
  @IsOptional() @IsEnum(Complexion) partnerComplexion?: Complexion;
  @IsOptional() @IsString() partnerHeight?: string;
  @IsOptional() @IsEnum(MaritalStatus) partnerMaritalStatus?: MaritalStatus;
  @IsOptional() @IsEnum(Religion) partnerReligion?: Religion;
  @IsOptional() @IsString() partnerEducation?: string;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  partnerProfession?: string[];
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  partnerCountries?: string[];
  @IsOptional() @IsEnum(DrinkOption) partnerDrink?: DrinkOption;
  @IsOptional() @IsEnum(SmokeOption) partnerSmoke?: SmokeOption;
  @IsOptional() @IsString() partnerResidency?: string;
  @IsOptional() @IsString() partnerExpectations?: string;

  // STEP 8 — CONTACT
  @IsOptional() @IsString() contactName?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEmail() contactEmail?: string;
  @IsOptional() @IsString() guardianName?: string;
  @IsOptional() @IsString() guardianPhone?: string;
  @IsOptional() @IsString() guardianRelation?: string;
  @IsOptional()
  @IsEnum(ContactVisibility)
  contactVisibility?: ContactVisibility;

  // STEP 9 — DECLARATION
  @IsOptional() @IsBoolean() truthPledge?: boolean;
  @IsOptional() @IsBoolean() parentConsent?: boolean;
  @IsOptional() @IsBoolean() falseInfoAgreement?: boolean;

  // Progress tracking
  @IsOptional() @IsInt() lastCompletedStep?: number;
}
