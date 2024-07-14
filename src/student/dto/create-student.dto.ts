import {
  IsString,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
  IsEnum,
} from 'class-validator';
import { StudyYear } from '../study-year.enum';

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
}
