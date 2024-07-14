import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';
import { Student } from '../student/student.entity';
import { Teacher } from './teacher.entity';

@Entity()
export class StudentTeacher {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'teacherId' })
  teacher: Teacher;

  @Column({ type: 'decimal', nullable: true })
  customPrice: number;
}
