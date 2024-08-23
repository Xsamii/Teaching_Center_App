import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { SessionService as sessionService2 } from './session2.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from 'src/teacher/teacher.entity';
import { Student } from 'src/student/student.entity';
import { StudentSessions } from '../student_sessions/student_sessions.entity';
import { Session } from './session.entity';
import { StudentTeacher } from 'src/teacher/student-teacher.entity';
import { Subscription } from 'src/subscription/subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Session,
      Teacher,
      Student,
      StudentSessions,
      StudentTeacher,
      Subscription,
    ]),
  ],
  controllers: [SessionController],
  providers: [SessionService, sessionService2],
})
export class SessionModule {}
