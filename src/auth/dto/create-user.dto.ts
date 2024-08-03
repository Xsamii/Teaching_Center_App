import { UserRole } from '../user.entity';

export class CreateUserDto {
  readonly username: string;
  readonly password: string;
  readonly role?: UserRole;

  readonly centerId: any;
}
