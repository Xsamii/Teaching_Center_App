import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository, EntityManager } from 'typeorm';
import { Session } from './session.entity';
import { Student } from '../student/student.entity';
import { StudentSessions } from '../student_sessions/student_sessions.entity';
import { CreateSessionDto } from '../session/create-session.dto';
import { EnrollStudentDto } from '../student_sessions/dto/enroll-student.dto';
import { Teacher } from 'src/teacher/teacher.entity';
import { StudentTeacher } from 'src/teacher/student-teacher.entity';
import { Subscription } from 'src/subscription/subscription.entity';

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
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @Inject(EntityManager)
    private readonly entityManager: EntityManager,
  ) {}

  // Step 1: Create a session without enrolling students
  async createSession(createSessionDto: CreateSessionDto): Promise<Session> {
    const { teacherId, date, time, price, name } = createSessionDto;

    const teacher = await this.validateTeacher(teacherId);

    const session = this.sessionRepository.create({
      name: `${teacher.name}-${name}`,
      teacher,
      date: new Date(date),
      time,
      price,
    });

    return await this.sessionRepository.save(session);
  }

  // Step 2: Enroll students on demand
  async enrollStudent(
    enrollStudentDto: EnrollStudentDto,
  ): Promise<StudentSessions> {
    const { studentId, sessionId, customPrice } = enrollStudentDto;

    const student = await this.validateStudent(studentId);
    const session = await this.validateSession(sessionId);

    const isEnrolled = await this.isStudentEnrolled(studentId, sessionId);
    if (isEnrolled) {
      throw new BadRequestException(
        'Student is already enrolled in this session.',
      );
    }

    // const price =
    //   customPrice || (await this.determineStudentPrice(student, session));

    const studentSession = this.studentSessionsRepository.create({
      student,
      session,
      customPrice: customPrice,
    });

    return await this.studentSessionsRepository.save(studentSession);
  }

  // Helper method to validate the teacher
  private async validateTeacher(teacherId: number): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId },
    });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }
    return teacher;
  }

  // Helper method to validate the student
  private async validateStudent(studentId: number): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    return student;
  }

  // Helper method to validate the session
  private async validateSession(sessionId: number): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }
    return session;
  }

  // Helper method to check if a student is already enrolled in a session
  private async isStudentEnrolled(
    studentId: number,
    sessionId: number,
  ): Promise<boolean> {
    const count = await this.studentSessionsRepository.count({
      where: { student: { id: studentId }, session: { id: sessionId } },
    });
    return count > 0;
  }

  // Helper method to determine the student's price for a session
  private async determineStudentPrice(
    student: Student,
    session: Session,
  ): Promise<number> {
    console.log(student.id, session.id);
    // Step 1: Check if the student has an active subscription with the teacher
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        student: { id: student.id },
        teacher: { id: session.teacher.id },
        // startDate: LessThanOrEqual(session.date),
        // endDate: MoreThanOrEqual(session.date),
      },
    });
    // const subscription = await this.subscriptionRepository
    //   .createQueryBuilder('subscription')
    //   .where('subscription.studentId = :studentId', { studentId: student.id })
    //   .andWhere('subscription.teacherId = :teacherId', {
    //     teacherId: session.teacher.id,
    //   })
    //   .andWhere('subscription.startDate <= :sessionDate', {
    //     sessionDate: session.date,
    //   })
    //   .andWhere('subscription.endDate >= :sessionDate', {
    //     sessionDate: session.date,
    //   })
    //   .getOne();
    console.log('subb', subscription);

    if (subscription) {
      return 0; // No charge if the student is subscribed
    }

    // Step 2: Check if there is a custom price in the student-teacher relationship
    const studentTeacher = await this.studentTeacherRepo.findOne({
      where: {
        student: { id: student.id },
        teacher: { id: session.teacher.id },
      },
    });

    // Step 3: Return the custom price if available, otherwise return the session's default price
    return studentTeacher?.customPrice || session.price;
  }

  // Other existing methods for session management...

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
    console.log('st', studentSessions);
    let totalAttended = 0;
    let totalRevenue = 0;
    let totalSubs = 0;
    let totalCustom = 0;

    for (const studentSession of studentSessions) {
      if (studentSession) {
        totalAttended++;
        if (studentSession.customPrice == 0) {
          totalSubs++;
        } else if (+studentSession.customPrice < +session.price) {
          totalCustom++;
        }
        totalRevenue += +studentSession.customPrice || 0;
      }
    }
    console.log('total attended', totalAttended);

    return { totalAttended, totalRevenue, totalSubs, totalCustom };
  }

  async findStudentSessionWithPrice(
    sessionId: number,
    studentId?: number,
    phoneNumber?: string,
  ): Promise<{ student: Student; price: number } | null> {
    let student: Student | undefined;

    // Step 1: Retrieve and validate the session
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['teacher'],
    });

    if (studentId) {
      student = await this.studentRepository.findOne({
        where: { id: studentId },
        relations: ['teachers'],
      });
    } else if (phoneNumber) {
      student = await this.studentRepository.findOne({
        where: { phoneNumber },
        relations: ['teachers'],
      });
    }

    // Ensure the student is associated with the teacher in the session
    if (
      student &&
      student.teachers.some((teacher) => teacher.id === session.teacher.id)
    ) {
      // Step 3: Determine the student's price for the session
      const price = await this.determineStudentPrice(student, session);
      return { student, price };
    } else {
      throw new NotFoundException(
        'Student not found or not associated with the teacher.',
      );
    }
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
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    await this.studentSessionsRepository.delete({ session: { id: sessionId } });

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

  //   async getEnrolledStudents(sessionId: number) {
  //     const session = await this.sessionRepository.findOne({
  //       where: { id: sessionId },
  //       relations: ['students'],
  //     });
  //     console.log('session', session);
  //     if (!session) {
  //       throw new NotFoundException(`Session with ID ${sessionId} not found`);
  //     }
  //     console.log('hereeee');
  //     const students = session.students;

  //     return {
  //       numberOfStudents: students.length,
  //       students: students.map((student) => ({
  //         id: student.id,
  //         name: student.name,
  //         phoneNumber: student.phoneNumber,
  //       })),
  //     };
  //   }
  async getEnrolledStudents(sessionId: number) {
    const students = await this.entityManager.query(
      `
      SELECT 
        s.id AS id,
        s.name AS name,
        s.phoneNumber,
        ss.customPrice
      FROM 
        student s
      INNER JOIN 
        student_sessions ss ON s.id = ss.studentId
      WHERE 
        ss.sessionId = ?
    
      `,
      [sessionId],
    );

    // const numberOfStudents = students.length;

    return {
      // numberOfStudents,
      students,
    };
  }
}
