import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Student } from '../student/student.entity';
import { Teacher } from '../teacher/teacher.entity';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, (student) => student.subscriptions)
  student: Student;

  @ManyToOne(() => Teacher, (teacher) => teacher.subscriptions)
  teacher: Teacher;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  price: number;
}
