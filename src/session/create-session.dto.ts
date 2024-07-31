import {
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsString,
  // IsOptional,
} from 'class-validator';

export class CreateSessionDto {
  @IsNotEmpty()
  @IsNumber()
  teacherId: number;

  // @IsOptional()
  // @IsString()
  // subject: string;
  @IsNotEmpty()
  @IsString()
  name: string;

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
