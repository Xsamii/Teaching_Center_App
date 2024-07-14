import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from 'src/teacher/teacher.entity';
import { Student } from 'src/student/student.entity';
import { StudentSessions } from '../student_sessions/student_sessions.entity';
import { Session } from './session.entity';
import { StudentTeacher } from 'src/teacher/student-teacher.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Session,
      Teacher,
      Student,
      StudentSessions,
      StudentTeacher,
    ]),
  ],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule {}
