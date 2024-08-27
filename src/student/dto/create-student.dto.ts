import {
  IsString,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
  IsEnum,
} from 'class-validator';
import { StudyYear } from '../study-year.enum';

// Define the type enum
export enum StudentType {
  Azhar = 'azhar',
  Aam = 'aam',
}

export class CreateStudentDto {
  @IsString()
  readonly name: string;

  @IsPhoneNumber()
  readonly phoneNumber: string;

  @IsEmail()
  @IsOptional()
  readonly email?: string;

  readonly centerId: any;

  @IsEnum(StudyYear)
  readonly studyYear: StudyYear;

  @IsString()
  readonly gender: string;

  @IsString()
  readonly subSection: string;

  // New type attribute
  @IsEnum(StudentType)
  readonly type: StudentType;
}
