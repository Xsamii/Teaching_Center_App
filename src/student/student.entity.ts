import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Session } from '../session/session.entity';
import { Center } from '../center/center.entity';
import { Teacher } from 'src/teacher/teacher.entity';
import { StudyYear } from './study-year.enum';
import { StudentTeacher } from 'src/teacher/student-teacher.entity';
import { Subscription } from '../subscription/subscription.entity';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ nullable: true })
  section: string;

  @Column()
  parentNumber: string;

  @ManyToOne(() => Center, (center) => center.students)
  center: Center;

  @ManyToMany(() => Session, (session) => session.students)
  sessions: Session[];

  @ManyToMany(() => Teacher, (teacher) => teacher.students)
  teachers: Teacher[];

  @Column({
    type: 'enum',
    enum: StudyYear,
  })
  studyYear: StudyYear;

  @Column()
  gender: string;

  @Column({ default: null, nullable: true })
  subSection: string;

  @Column({ default: false })
  printed: boolean;

  @OneToMany(() => StudentTeacher, (studentTeacher) => studentTeacher.student)
  studentTeachers: StudentTeacher[];

  @OneToMany(() => Subscription, (subscription) => subscription.student)
  subscriptions: Subscription[]; // Added subscriptions relationship
}
