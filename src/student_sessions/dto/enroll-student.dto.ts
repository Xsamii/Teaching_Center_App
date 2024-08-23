import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class EnrollStudentDto {
  @IsNotEmpty()
  @IsNumber()
  studentId: number;

  @IsNotEmpty()
  @IsNumber()
  sessionId: number;

  @IsOptional()
  @IsNumber()
  customPrice: number;
}
