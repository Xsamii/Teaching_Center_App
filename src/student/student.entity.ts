import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Session } from '../session/session.entity';
import { Center } from '../center/center.entity';
import { Teacher } from 'src/teacher/teacher.entity';
import { StudyYear } from './study-year.enum';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  parentNumber: string;

  @ManyToOne(() => Center, (center) => center.students)
  center: Center;

  @ManyToMany(() => Session, (session) => session.students)
  @JoinTable({ name: 'student_sessions' })
  sessions: Session[];

  @ManyToMany(() => Teacher, (teacher) => teacher.students)
  teachers: Teacher[];
  @Column({
    type: 'enum',
    enum: StudyYear,
  })
  studyYear: StudyYear;
}
