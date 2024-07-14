import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateStudentTeacherDto {
  @IsNotEmpty()
  @IsNumber()
  studentId: number;

  @IsNotEmpty()
  @IsNumber()
  teacherId: number;

  @IsNotEmpty()
  @IsNumber()
  customPrice: number;
}
