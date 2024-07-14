import { IsNotEmpty, IsNumber, IsDateString, IsString } from 'class-validator';

export class CreateSessionDto {
  @IsNotEmpty()
  @IsNumber()
  teacherId: number;

  // @IsNotEmpty()
  // @IsString()
  // subject: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsString()
  time: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}
