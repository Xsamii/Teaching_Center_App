import {
  Injectable,
  NotFoundException,
  //   BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './session.entity';
import { Student } from '../student/student.entity';
import { StudentSessions } from '../student_sessions/student_sessions.entity';
import { CreateSessionDto } from '../session/create-session.dto';
import { EnrollStudentDto } from '../student_sessions/dto/enroll-student.dto';
import { Teacher } from 'src/teacher/teacher.entity';
import { StudentTeacher } from 'src/teacher/student-teacher.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(StudentSessions)
    private readonly studentSessionsRepository: Repository<StudentSessions>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(StudentTeacher)
    private readonly studentTeacherRepo: Repository<StudentTeacher>,
  ) {}

  async createSession(createSessionDto: CreateSessionDto): Promise<Session> {
    const { teacherId, date, time, price } = createSessionDto;

    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId },
      relations: ['students', 'students.studentTeachers'],
    });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }

    const session = this.sessionRepository.create({
      teacher,
      date,
      time,
      price,
    });

    await this.sessionRepository.save(session);

    // Add session to all students of the teacher
    const students = teacher.students;

    for (const student of students) {
      const studentTeacher = await this.studentTeacherRepo.findOne({
        where: {
          student: student,
          teacher: teacher,
        },
      });
      const studentPrice =
        studentTeacher && studentTeacher.customPrice
          ? studentTeacher.customPrice
          : price;

      const studentSession = this.studentSessionsRepository.create({
        student,
        session,
        customPrice: studentPrice,
      });

      await this.studentSessionsRepository.save(studentSession);
    }

    return session;
  }

  async enrollStudent(
    enrollStudentDto: EnrollStudentDto,
  ): Promise<StudentSessions> {
    const { studentId, sessionId, customPrice } = enrollStudentDto;

    const student = await this.studentRepository.findOne({
      where: { id: studentId },
    });
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!student || !session) {
      throw new NotFoundException('Student or session not found');
    }

    const studentSession = this.studentSessionsRepository.create({
      student,
      session,
      customPrice,
    });
    return await this.studentSessionsRepository.save(studentSession);
  }

  async markAttendance(
    sessionId: number,
    studentId: number,
  ): Promise<StudentSessions> {
    const studentSession = await this.studentSessionsRepository.findOne({
      where: { session: { id: sessionId }, student: { id: studentId } },
    });

    if (!studentSession) {
      throw new NotFoundException(`Student session record not found`);
    }

    studentSession.attended = true;
    return await this.studentSessionsRepository.save(studentSession);
  }

  async findAll(): Promise<Session[]> {
    return this.sessionRepository.find();
  }

  async getSessionStudents(sessionId: number) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    const attended = await this.studentSessionsRepository.find({
      where: { session: { id: sessionId }, attended: true },
      relations: ['student'],
    });

    const notAttended = await this.studentSessionsRepository.find({
      where: { session: { id: sessionId }, attended: false },
      relations: ['student'],
    });

    return {
      attended: attended.map((ss) => ({
        id: ss.student.id,
        name: ss.student.name,
        customPrice: ss.customPrice,
      })),
      notAttended: notAttended.map((ss) => ({
        id: ss.student.id,
        name: ss.student.name,
      })),
    };
  }
}
