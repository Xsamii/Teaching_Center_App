import {
  Entity,
  ManyToOne,
  Column,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Student } from '../student/student.entity';
import { Session } from '../session/session.entity';

@Entity()
@Unique(['student', 'session'])
export class StudentSessions {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => Student, (student) => student.sessions)
  student: Student;

  @ManyToOne(() => Session, (session) => session.students)
  session: Session;

  @Column({ default: false })
  attended: boolean;

  @Column({ type: 'decimal', nullable: true })
  customPrice: number;
}
