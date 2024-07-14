import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCenterDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class UpdateCenterDto {
  @IsString()
  name?: string;
}
