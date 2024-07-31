import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { Session } from './session.entity';
import { CreateSessionDto } from '../session/create-session.dto';
import { EnrollStudentDto } from '../student_sessions/dto/enroll-student.dto';
import { StudentSessions } from '../student_sessions/student_sessions.entity';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('date')
  findByDate(@Query('date') date: string): Promise<Session[]> {
    console.log('hereee');
    return this.sessionService.findByDate(date);
  }

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
  @Get(':sessionId/report')
  async getSessionReport(@Param('sessionId') sessionId: number) {
    return this.sessionService.generateSessionReport(sessionId);
  }

  // @Patch(':sessionId/attendance/:studentId')
  // async markAttendance(
  //   @Param('sessionId') sessionId: number,
  //   @Param('studentId') studentId: number,
  // ): Promise<StudentSessions> {
  //   return await this.sessionService.markAttendance(sessionId, studentId);
  // }
  @Get('student-session')
  async findStudentSession(
    @Query('sessionId') sessionId: number,
    @Query('studentId') studentId?: number,
    @Query('phoneNumber') phoneNumber?: string,
  ): Promise<StudentSessions> {
    if (!studentId && !phoneNumber) {
      throw new NotFoundException('Student ID or phone number is required');
    }
    return this.sessionService.findStudentSession(
      sessionId,
      studentId,
      phoneNumber,
    );
  }
}
