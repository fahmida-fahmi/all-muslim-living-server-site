// ==================== COMPANY ====================
export enum CompanyType {
  JOB_AGENCY = 'JOB_AGENCY',
  RESTAURANT = 'RESTAURANT',
  RETAIL_SHOP = 'RETAIL_SHOP',
  HEALTH_CLINIC = 'HEALTH_CLINIC',
  NGO = 'NGO',
  MEDIA = 'MEDIA',
  OTHER = 'OTHER',
}

export enum CompanySize {
  SIZE_1_10 = 'SIZE_1_10',
  SIZE_11_50 = 'SIZE_11_50',
  SIZE_51_200 = 'SIZE_51_200',
  SIZE_201_500 = 'SIZE_201_500',
  SIZE_501_PLUS = 'SIZE_501_PLUS',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

// ==================== USER ====================
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export enum UserRole {
  USER = 'USER',
  JOB_SEEKER = 'JOB_SEEKER',
  EMPLOYER = 'EMPLOYER',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  WRITER = 'WRITER',
  EVENT_ORGANIZER = 'EVENT_ORGANIZER',
  CHARITY_ORG = 'CHARITY_ORG',
  VOLUNTEER = 'VOLUNTEER',
  PRAYER_PLACE_ADMIN = 'PRAYER_PLACE_ADMIN',
  MATRIMONY_SEEKER = 'MATRIMONY_SEEKER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

// ==================== JOB ====================
export enum JobType {
  REMOTE = 'REMOTE',
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  INTERNSHIP = 'INTERNSHIP',
  CONTRACT = 'CONTRACT',
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEWED = 'INTERVIEWED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

// ==================== MATRIMONY ====================
export enum MaritalStatus {
  NEVER_MARRIED = 'NEVER_MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
  SEPARATED = 'SEPARATED',
}

export enum EducationMethod {
  GENERAL = 'GENERAL',
  QAWMI = 'QAWMI',
  ALIA = 'ALIA',
}

export enum Complexion {
  BLACK = 'BLACK',
  BROWN = 'BROWN',
  LIGHT_BROWN = 'LIGHT_BROWN',
  FAIR = 'FAIR',
  VERY_FAIR = 'VERY_FAIR',
}

export enum FiqhFollow {
  HANAFI = 'HANAFI',
  MALIKI = 'MALIKI',
  SHAFI = 'SHAFI',
  HANBALI = 'HANBALI',
}

export enum FinancialStatus {
  UPPER_CLASS = 'UPPER_CLASS',
  UPPER_MIDDLE_CLASS = 'UPPER_MIDDLE_CLASS',
  MIDDLE_CLASS = 'MIDDLE_CLASS',
  LOWER_MIDDLE_CLASS = 'LOWER_MIDDLE_CLASS',
  LOWER_CLASS = 'LOWER_CLASS',
}