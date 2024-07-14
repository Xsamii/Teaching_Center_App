import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './student.entity';
import { Teacher } from '../teacher/teacher.entity';
import { BaseService } from '../common/Base.service';
import { CreateStudentWithTeachersDto } from './dto/CreateStudentwithTeacher.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { Center } from 'src/center/center.entity';

@Injectable()
export class StudentService extends BaseService<Student> {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(Center)
    private readonly centerRepository: Repository<Center>,
  ) {
    super(studentRepository);
  }
  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const { centerId, ...studentDetails } = createStudentDto;

    const center = await this.centerRepository.findOne({
      where: { id: centerId },
    });
    if (!center) {
      throw new NotFoundException('Center not found.');
    }
    console.log('center', center);

    const student = this.studentRepository.create({
      ...studentDetails,
      center,
    });

    return await this.studentRepository.save(student);
  }

  async findByTeacher(teacherId: number): Promise<Student[]> {
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId },
      relations: ['students'],
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }

    const students = teacher.students;

    if (!students) {
      throw new NotFoundException(
        `No students found for Teacher with ID ${teacherId}`,
      );
    }

    return students;
  }

  async createStudentWithTeachers(
    createStudentDto: CreateStudentWithTeachersDto,
  ): Promise<Student> {
    const { centerId, teacherIds, ...studentDetails } = createStudentDto;

    const teachers = await this.teacherRepository.findByIds(teacherIds);
    if (teachers.length !== teacherIds.length) {
      throw new NotFoundException(`Some teachers not found`);
    }
    console.log('teachers', teachers);
    const center = await this.centerRepository.findOne({
      where: { id: centerId },
    });
    if (!center) {
      throw new NotFoundException('Center not found.');
    }
    const student = this.studentRepository.create({
      ...studentDetails,
      teachers,
      center,
    });
    return this.studentRepository.save(student);
  }

  async searchStudent(id?: any, phoneNumber?: string): Promise<Student> {
    let student: Student | undefined;
    if (id) {
      student = await this.studentRepository.findOne({ where: { id } });
    } else if (phoneNumber) {
      student = await this.studentRepository.findOne({
        where: { phoneNumber },
      });
    }

    if (!student) {
      throw new NotFoundException(
        'Student not found with the provided identifier.',
      );
    }
    return student;
  }

  async findAllStudentsByCenter(centerId: number): Promise<Student[]> {
    const center = await this.centerRepository.findOne({
      where: { id: centerId },
      relations: ['students'],
    });
    if (!center) {
      throw new NotFoundException(`Center with ID ${centerId} not found`);
    }
    return center.students;
  }
}
