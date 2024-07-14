import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTeacherDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  phoneNumber: string;

  @IsNotEmpty()
  subjectId: any;
  @IsNotEmpty()
  centerId: any;
}
