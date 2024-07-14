import {
  IsString,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  IsEnum,
} from 'class-validator';
import { StudyYear } from '../study-year.enum';

export class CreateStudentWithTeachersDto {
  @IsString()
  name: string;

  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  parentNumber: string;
  readonly centerId: any;

  // @IsOptional()
  // @IsString()
  // studyYear?: string;

  @IsArray()
  @ArrayNotEmpty()
  teacherIds: number[];

  @IsEnum(StudyYear)
  readonly studyYear: StudyYear;
}
