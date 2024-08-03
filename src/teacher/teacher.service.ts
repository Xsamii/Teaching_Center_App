import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseService } from '../common/Base.service';
import { Teacher } from './teacher.entity';
import { Center } from 'src/center/center.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
// import { Subject } from 'src/subject/subject.entity';
import { SubjectService } from 'src/subject/subject.service';
import { Student } from 'src/student/student.entity';
import { CreateStudentTeacherDto } from './dto/create-student-teacher.dto';
import { StudentTeacher } from './student-teacher.entity';

@Injectable()
export class TeacherService extends BaseService<Teacher> {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(Center)
    private readonly cetnerRepo: Repository<Center>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(StudentTeacher)
    private readonly studentTeacherRepository: Repository<StudentTeacher>,
    private readonly subjectRepository: SubjectService,
    private readonly entityManager: EntityManager,
  ) {
    super(teacherRepository);
  }

  async create(createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    const { centerId, subjectId } = createTeacherDto;
    console.log('here 1 ', subjectId);

    const center = await this.cetnerRepo.findOne({ where: { id: centerId } });
    if (!center) {
      throw new NotFoundException(`Center with ID ${centerId} not found`);
    }
    console.log('2', center);
    // const subject = await this.subjectRepository.findOne({
    //   where: { id: subjectId },
    // });
    const subject = await this.subjectRepository.findOne(subjectId);
    // const subject: Subject = await this.subjectRepository.findOne({
    //   where: { id: subjectId },
    // });
    // console.log('hereee');
    // if (!subject) {
    //   throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    // }

    console.log('3', subject);

    const teacher = this.teacherRepository.create({
      ...createTeacherDto,
      center,
      subject,
    });
    return await this.teacherRepository.save(teacher);
    // const teacher = await this.teacherRepository.create(createTeacherDto);
    // return await this.teacherRepository.save(teacher);
  }
  async findAllBySubject(subjectId: number): Promise<Teacher[]> {
    return this.teacherRepository
      .createQueryBuilder('teacher')
      .innerJoinAndSelect('teacher.subjects', 'subject')
      .where('subject.id = :subjectId', { subjectId })
      .getMany();
  }

  async findTeachersByCenter(centerId: number): Promise<Teacher[]> {
    const center = await this.cetnerRepo.findOne({
      where: { id: centerId },
      relations: ['teachers'],
    });
    if (!center) {
      throw new NotFoundException(`Center with ID ${centerId} not found`);
    }
    return center.teachers;
  }

  async findAll() {
    const teachers = await this.teacherRepository.find({
      relations: ['center', 'subject'],
    });
    const resp = teachers.map((t) => ({ ...t, subjectName: t.subject.name }));
    return resp;
  }
  async addStudentToTeacher(teacherId: any, studentId: any): Promise<void> {
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId },
      relations: ['students'],
    });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }

    const student = await this.studentRepository.findOne({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    teacher.students = [...(teacher.students || []), student];
    await this.teacherRepository.save(teacher);
  }
  async addCustomPrice(
    createStudentTeacherDto: CreateStudentTeacherDto,
  ): Promise<StudentTeacher> {
    const { studentId, teacherId, customPrice } = createStudentTeacherDto;

    const student = await this.studentRepository.findOne({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId },
    });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }

    const studentTeacher = this.studentTeacherRepository.create({
      student,
      teacher,
      customPrice,
    });

    return this.studentTeacherRepository.save(studentTeacher);
  }
  async findOne(id: any): Promise<Teacher> {
    console.log('id', id);
    const teacher = await this.teacherRepository.findOne({
      where: { id: id },
      relations: ['students'],
    });
    // console.log('techer', teacher);
    return teacher;
  }
  async removeStudentFromTeacher(
    teacherId: number,
    studentId: number,
  ): Promise<void> {
    // Check if the relationship exists
    const relationship = await this.entityManager.query(
      'SELECT * FROM teacher_students_student WHERE teacherId = ? AND studentId = ?',
      [teacherId, studentId],
    );

    if (relationship.length === 0) {
      throw new NotFoundException(
        `Relationship between Teacher ID ${teacherId} and Student ID ${studentId} not found`,
      );
    }

    // Execute the SQL query to delete the relationship
    await this.entityManager.query(
      'DELETE FROM teacher_students_student WHERE teacherId = ? AND studentId = ?',
      [teacherId, studentId],
    );
  }
}
