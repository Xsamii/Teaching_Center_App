import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Student } from '../student/student.entity';
import { Teacher } from '../teacher/teacher.entity';

@Entity()
export class StudentTeacher {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, (student) => student.studentTeachers)
  student: Student;

  @ManyToOne(() => Teacher, (teacher) => teacher.studentTeachers)
  teacher: Teacher;

  @Column({ nullable: true })
  customPrice?: number;
}
