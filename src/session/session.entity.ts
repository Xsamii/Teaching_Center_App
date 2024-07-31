import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  // JoinTable,
} from 'typeorm';
import { Teacher } from '../teacher/teacher.entity';
import { Student } from '../student/student.entity';

@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @ManyToOne(() => Teacher, (teacher) => teacher.sessions)
  teacher: Teacher;

  // @Column({ nullable: true })
  // subject: string;

  @Column()
  date: Date;

  @Column()
  time: string;

  @Column({ default: 'open' })
  state: 'open' | 'closed';

  @Column({ type: 'decimal' })
  price: number;

  @ManyToMany(() => Student, (student) => student.sessions)
  students: Student[];
}
