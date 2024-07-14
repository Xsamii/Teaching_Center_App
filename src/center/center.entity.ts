import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Teacher } from '../teacher/teacher.entity';
// import { Session } from '../session/session.entity';
import { Subject } from '../subject/subject.entity';
import { Student } from '../student/student.entity';
import { User } from 'src/auth/user.entity';

@Entity()
export class Center {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Teacher, (teacher) => teacher.center)
  teachers: Teacher[];

  //   @OneToMany(() => Session, (session) => session.center)
  //   sessions: Session[];

  @OneToMany(() => Subject, (subject) => subject.center)
  subjects: Subject[];

  @OneToMany(() => Student, (student) => student.center)
  students: Student[];

  @OneToMany(() => User, (user) => user.center)
  users: User[];
}
