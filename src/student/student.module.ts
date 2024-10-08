import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { Student } from './student.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from 'src/teacher/teacher.entity';
import { Center } from 'src/center/center.entity';
import { Subscription } from 'src/subscription/subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Teacher, Center, Subscription])],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
