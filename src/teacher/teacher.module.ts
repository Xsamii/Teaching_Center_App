import { Module } from '@nestjs/common';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from './teacher.entity';
import { Center } from 'src/center/center.entity';
import { Subject } from 'rxjs';
import { SubjectModule } from 'src/subject/subject.module';
import { Student } from 'src/student/student.entity';
import { StudentTeacher } from './student-teacher.entity';
// import { CenterModule } from 'src/center/center.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Teacher,
      Center,
      Subject,
      Student,
      StudentTeacher,
    ]),
    SubjectModule,
  ],
  controllers: [TeacherController],
  providers: [TeacherService],
})
export class TeacherModule {}
