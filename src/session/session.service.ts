import {
  Injectable,
  NotFoundException,
  //   BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
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
    const { teacherId, date, time, price, name } = createSessionDto;

    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId },
      relations: [
        'students',
        'students.subscriptions',
        'students.subscriptions.teacher',
        'students.studentTeachers',
        'students.studentTeachers.teacher',
      ],
    });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }
    // console.log('session', teacher);

    const sessionDate = new Date(date);

    const session = this.sessionRepository.create({
      name: `${teacher.name}-${name}`,
      teacher,
      date: sessionDate,
      time,
      price,
    });

    await this.sessionRepository.save(session);

    // Add session to all students of the teacher
    const students = teacher.students;

    for (const student of students) {
      let studentPrice = price;

      // Check if the student has an active subscription with the teacher
      const subscription = student.subscriptions.find(
        (sub) =>
          sub.teacher.id === teacher.id &&
          sub.startDate <= sessionDate &&
          sub.endDate >= sessionDate,
      );
      console.log('subs', subscription);

      if (subscription) {
        studentPrice = 0; // No charge if subscribed
      } else {
        // Check if the student has a custom price with the teacher
        if (student.studentTeachers.length > 0) {
          console.log('iam here');
          const studentTeacher = student.studentTeachers.find(
            (st) => st.teacher.id === teacher.id,
          );
          console.log('st', studentTeacher);
          if (studentTeacher && studentTeacher.customPrice) {
            studentPrice = studentTeacher.customPrice;
          }
          console.log('price', studentPrice);
        }
      }

      const studentSession = this.studentSessionsRepository.create({
        student,
        session,
        customPrice: studentPrice,
      });

      await this.studentSessionsRepository.save(studentSession);
      // console.log('stuuuuuuuuuuuuuuu', studentSession);
    }

    return session;
  }

  async enrollStudent(
    enrollStudentDto: EnrollStudentDto,
  ): Promise<StudentSessions> {
    const { studentId, sessionId, customPrice } = enrollStudentDto;

    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['subscriptions'], // Include subscriptions
    });
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!student || !session) {
      throw new NotFoundException('Student or session not found');
    }

    let sessionPrice = customPrice;

    // Check if the student has an active subscription with the teacher for the session date
    const subscription = student.subscriptions.find(
      (sub) =>
        sub.teacher.id === session.teacher.id &&
        sub.startDate <= session.date &&
        sub.endDate >= session.date,
    );

    if (subscription) {
      sessionPrice = 0; // No charge if subscribed
    }

    const studentSession = this.studentSessionsRepository.create({
      student,
      session,
      customPrice: sessionPrice,
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

  async findAll() {
    const sessions: Session[] = await this.sessionRepository.find({
      relations: ['teacher'],
    });
    const resp = sessions.map((s) => ({ ...s, teacherName: s.teacher.name }));
    return resp;
  }

  async findByDate(date: string): Promise<Session[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    return this.sessionRepository.find({
      where: {
        date: Between(startDate, endDate),
      },
      relations: ['teacher'],
    });
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
  async generateSessionReport(sessionId: number): Promise<{
    totalAttended: number;
    totalRevenue: number;
    totalSubs: number;
    totalCustom: number;
  }> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['teacher'],
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    const studentSessions = await this.studentSessionsRepository.find({
      where: { session: { id: sessionId } },
      relations: ['student'],
    });

    let totalAttended = 0;
    let totalRevenue = 0;
    let totalSubs = 0;
    let totalCustom = 0;

    for (const studentSession of studentSessions) {
      if (studentSession.attended) {
        totalAttended++;
        console.log(studentSession.customPrice);
        if (studentSession.customPrice == 0) {
          totalSubs++;
        } else if (+studentSession.customPrice < +session.price) {
          totalCustom++;
        }
        totalRevenue += +studentSession.customPrice || 0;
      }
    }
    console.log(totalRevenue);

    return { totalAttended, totalRevenue, totalSubs, totalCustom };
  }
  async findStudentSession(
    sessionId: number,
    studentId?: number,
    phoneNumber?: string,
  ): Promise<StudentSessions | null> {
    let student: Student | undefined;

    if (studentId) {
      student = await this.studentRepository.findOne({
        where: { id: studentId },
      });
    } else if (phoneNumber) {
      student = await this.studentRepository.findOne({
        where: { phoneNumber },
      });
    }

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const studentSession = await this.studentSessionsRepository.findOne({
      where: { session: { id: sessionId }, student: { id: student.id } },
      relations: ['student'],
    });

    if (!studentSession) {
      throw new NotFoundException('Student session record not found');
    }

    return studentSession;
  }
  async unenrollStudent(sessionId: number, studentId: number): Promise<void> {
    const studentSession = await this.studentSessionsRepository.findOne({
      where: { session: { id: sessionId }, student: { id: studentId } },
    });

    if (!studentSession) {
      throw new NotFoundException(`Student session record not found`);
    }

    await this.studentSessionsRepository.remove(studentSession);
  }
  async deleteSession(sessionId: number): Promise<void> {
    // console.log(sessionId);
    // Find the session by ID
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    // Optionally, remove all related student sessions if they are being tracked in a separate table
    await this.studentSessionsRepository.delete({ session: { id: sessionId } });
    // console.log(session);
    // Remove the session itself
    await this.sessionRepository.delete({ id: session.id });
  }
  async getDailyReport(date: string): Promise<{
    totalRevenue: number;
    totalSessions: number;
    sessions: any[];
  }> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const sessions = await this.sessionRepository.find({
      where: {
        date: Between(startDate, endDate),
      },
      relations: ['teacher'],
    });

    let totalRevenue = 0;
    const sessionDetails = await Promise.all(
      sessions.map(async (session) => {
        const sessionReport = await this.generateSessionReport(session.id);

        totalRevenue += sessionReport.totalRevenue;

        return {
          id: session.id,
          name: session.name,
          date: session.date,
          time: session.time,
          teacher: session.teacher.name,
          totalStudents: sessionReport.totalAttended,
          sessionRevenue: sessionReport.totalRevenue,
        };
      }),
    );

    return {
      totalRevenue,
      totalSessions: sessions.length,
      sessions: sessionDetails,
    };
  }

  async getMonthlyReport(
    year: number,
    month: number,
  ): Promise<{
    totalRevenue: number;
    totalSessions: number;
    sessions: any[];
  }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const sessions = await this.sessionRepository.find({
      where: {
        date: Between(startDate, endDate),
      },
      relations: ['teacher'],
    });

    let totalRevenue = 0;
    const sessionDetails = await Promise.all(
      sessions.map(async (session) => {
        const sessionReport = await this.generateSessionReport(session.id);

        totalRevenue += sessionReport.totalRevenue;

        return {
          id: session.id,
          name: session.name,
          date: session.date,
          time: session.time,
          teacher: session.teacher.name,
          totalStudents: sessionReport.totalAttended,
          sessionRevenue: sessionReport.totalRevenue,
        };
      }),
    );

    return {
      totalRevenue,
      totalSessions: sessions.length,
      sessions: sessionDetails,
    };
  }
}
