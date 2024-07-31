import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Center } from '../center/center.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Center)
    private readonly centerRepository: Repository<Center>,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<User> {
    const { username, password, centerId } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const center = await this.centerRepository.findOne({
      where: { id: centerId },
    });
    if (!center) {
      throw new NotFoundException(`Center with ID ${centerId} not found`);
    }

    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      role: UserRole.USER,
      center,
    });

    return this.userRepository.save(user);
  }

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['center'],
    });
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }

    if (password) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    return user;
  }

  async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
    const { username, password } = loginUserDto;
    const user = await this.validateUser(username, password);
    // const center = await this.centerRepository.findOne({
    //   where: { id: user.center.id },
    // });

    const payload = {
      username: user.username,
      role: user.role,
      centerId: user.center.id,
    };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }
}
