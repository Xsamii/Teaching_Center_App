import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { SessionService } from './session.service';
import { Session } from './session.entity';
import { CreateSessionDto } from '../session/create-session.dto';
import { EnrollStudentDto } from '../student_sessions/dto/enroll-student.dto';
import { StudentSessions } from '../student_sessions/student_sessions.entity';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  async getAllSessions(): Promise<Session[]> {
    return this.sessionService.findAll();
  }

  @Get(':sessionId/students')
  async getSessionStudents(@Param('sessionId') sessionId: number) {
    return this.sessionService.getSessionStudents(sessionId);
  }
  @Post(':sessionId/students/:studentId/attendance')
  async markAttendance(
    @Param('sessionId') sessionId: number,
    @Param('studentId') studentId: number,
  ): Promise<StudentSessions> {
    return this.sessionService.markAttendance(sessionId, studentId);
  }

  @Post()
  async createSession(
    @Body() createSessionDto: CreateSessionDto,
  ): Promise<Session> {
    return await this.sessionService.createSession(createSessionDto);
  }

  @Post('enroll')
  async enrollStudent(
    @Body() enrollStudentDto: EnrollStudentDto,
  ): Promise<StudentSessions> {
    return await this.sessionService.enrollStudent(enrollStudentDto);
  }

  // @Patch(':sessionId/attendance/:studentId')
  // async markAttendance(
  //   @Param('sessionId') sessionId: number,
  //   @Param('studentId') studentId: number,
  // ): Promise<StudentSessions> {
  //   return await this.sessionService.markAttendance(sessionId, studentId);
  // }
}
