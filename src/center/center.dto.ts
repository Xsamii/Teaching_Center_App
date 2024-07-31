import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCenterDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsNumber()
  phoneNum: number;
}

export class UpdateCenterDto {
  @IsString()
  name?: string;
}
