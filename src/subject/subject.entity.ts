import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Teacher } from '../teacher/teacher.entity';
// import { Student } from '../student/student.entity';
import { Center } from '../center/center.entity';

@Entity()
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Center, (center) => center.subjects)
  center: Center;

  @ManyToMany(() => Teacher, (teacher) => teacher.subject)
  @JoinTable()
  teachers: Teacher[];

  //   @ManyToMany(() => Student, (student) => student.subjects)
  //   @JoinTable()
  //   students: Student[];
}
