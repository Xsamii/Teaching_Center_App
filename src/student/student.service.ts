import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, In } from 'typeorm';
import { Student } from './student.entity';
import { Teacher } from '../teacher/teacher.entity';
import { BaseService } from '../common/Base.service';
import { CreateStudentWithTeachersDto } from './dto/CreateStudentwithTeacher.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { Center } from 'src/center/center.entity';
import { StudyYear } from './study-year.enum';
// import { StudentType } from './dto/create-student.dto'; // Importing the StudentType enum

@Injectable()
export class StudentService extends BaseService<Student> {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(Center)
    private readonly centerRepository: Repository<Center>,
    private readonly entityManager: EntityManager,
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

  async findOne(id?: number, phoneNumber?: string): Promise<Student> {
    let student: Student | undefined;

    if (id) {
      student = await this.studentRepository.findOne({
        where: { id },
        relations: ['teachers'],
      });
    } else if (phoneNumber) {
      student = await this.studentRepository.findOne({
        where: { phoneNumber },
        relations: ['teachers'],
      });
    }

    if (!student) {
      throw new NotFoundException('Student not found.');
    }

    return student;
  }

  async findStudentsByCustomQuery(
    centerId: number,
    teacherId?: number,
    studyYear?: StudyYear,
    gender?: string,
    subSection?: string,
    section?: string,
    removeTeacher?: number, // Added removeTeacher as a parameter
    type?: string, // Added type as a parameter
    secondLang?: string,
  ): Promise<Student[]> {
    let students: Student[] = [];

    // Step 1: Fetch students based on other filters if they exist
    if (studyYear) {
      const sql = `
      SELECT * FROM student 
      WHERE studyYear = ? 
      AND centerId = ?;
      `;
      const results = await this.entityManager.query(sql, [
        studyYear,
        centerId,
      ]);
      const resultIds = results.map((student) => student.id);

      students = students.length
        ? students.filter((student) => resultIds.includes(student.id))
        : results;
    }

    if (gender) {
      const sql = `
        SELECT * FROM student
        WHERE gender = ?
        AND centerId = ?;
        `;
      const results = await this.entityManager.query(sql, [gender, centerId]);
      const resultIds = results.map((student) => student.id);

      students = students.length
        ? students.filter((student) => resultIds.includes(student.id))
        : results;
    }

    if (subSection) {
      const results = await this.studentRepository.find({
        where: { subSection: subSection, center: { id: centerId } },
      });
      const resultIds = results.map((student) => student.id);

      students = students.length
        ? students.filter((student) => resultIds.includes(student.id))
        : results;
    }

    if (section) {
      const results = await this.studentRepository.find({
        where: { section: section, center: { id: centerId } },
      });
      const resultIds = results.map((student) => student.id);

      students = students.length
        ? students.filter((student) => resultIds.includes(student.id))
        : results;
    }

    // Step 2: Remove students associated with the specified teacher
    if (removeTeacher) {
      const removeTeacherEntity = await this.teacherRepository.findOne({
        where: { id: removeTeacher },
        relations: ['students'],
      });
      const studentsToRemoveIds =
        removeTeacherEntity?.students.map((s) => s.id) || [];
      students = students.filter(
        (student) => !studentsToRemoveIds.includes(student.id),
      );
    }

    // Step 3: Apply teacher filter if specified (optional)
    if (teacherId) {
      console.log('hereee');
      const teacher = await this.teacherRepository.findOne({
        where: { id: teacherId },
        relations: ['students'],
      });
      const teacherStudentIds = teacher?.students.map((s) => s.id) || [];
      students = students.length
        ? students.filter((student) => teacherStudentIds.includes(student.id))
        : teacher.students;
    }

    // Step 4: Apply type filter if specified (optional)
    if (type) {
      students = students.length
        ? students.filter((student) => student.type === type)
        : await this.studentRepository.find({ where: { type: type } });
    }
    // Step 5: Apply second lang filter if specified (optional)

    if (secondLang) {
      students = students.length
        ? students.filter((student) => student.secondLang === secondLang)
        : await this.studentRepository.find({
            where: { secondLang: secondLang },
          });
    }

    return students;
  }

  async markStudentsAsPrinted(studentIds: number[]): Promise<void> {
    const students = await this.studentRepository.find({
      where: { id: In(studentIds) },
    });

    if (students.length !== studentIds.length) {
      throw new NotFoundException('Some students were not found.');
    }

    for (const student of students) {
      student.printed = true;
    }

    await this.studentRepository.save(students);
  }
}
