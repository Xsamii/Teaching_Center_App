import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinTable,
} from 'typeorm';
import { Student } from '../student/student.entity';
import { Subject } from '../subject/subject.entity';
import { Center } from '../center/center.entity';
import { Session } from '../session/session.entity';
import { StudyYear } from 'src/student/study-year.enum';
import { StudentTeacher } from './student-teacher.entity';
import { Subscription } from '../subscription/subscription.entity';

@Entity()
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  phoneNumber: string;

  @ManyToOne(() => Center, (center) => center.teachers)
  center: Center;

  @ManyToOne(() => Subject, (subject) => subject.teachers)
  subject: Subject;

  @ManyToMany(() => Student, (student) => student.teachers)
  @JoinTable()
  students: Student[];

  @OneToMany(() => Session, (session) => session.teacher)
  sessions: Session[];

  @Column({
    type: 'enum',
    enum: StudyYear,
  })
  studyYear: StudyYear;

  @OneToMany(() => StudentTeacher, (studentTeacher) => studentTeacher.teacher)
  studentTeachers: StudentTeacher[];

  @OneToMany(() => Subscription, (subscription) => subscription.teacher)
  subscriptions: Subscription[]; // Added subscriptions relationship
}
