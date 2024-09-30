import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './student.entity';
import { CreateStudentWithTeachersDto } from './dto/CreateStudentwithTeacher.dto';
import { StudyYear } from './study-year.enum';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('center/:centerId')
  async findAllStudentsByCenter(
    @Param('centerId') centerId: number,
  ): Promise<Student[]> {
    return this.studentService.findAllStudentsByCenter(centerId);
  }
  @Get()
  getAllStudents(): Promise<Student[]> {
    return this.studentService.findAll();
  }
  @Get('search')
  async searchStudent(
    @Query('id') id?: any,
    @Query('phoneNumber') phoneNumber?: string,
  ) {
    if (!id && !phoneNumber) {
      throw new NotFoundException(
        'Must provide either an id or phoneNumber to search',
      );
    }
    return this.studentService.findOne(id, phoneNumber);
  }
  @Get('find')
  async findStudent(
    @Query('id') id?: number,
    @Query('phoneNumber') phoneNumber?: string,
  ): Promise<Student> {
    if (!id && !phoneNumber) {
      throw new NotFoundException(
        'Please provide either an id or a phone number to search.',
      );
    }

    return await this.studentService.findOne(id, phoneNumber);
  }

  @Get('custom-query')
  async findStudentsByCustomQuery(
    @Query('centerId') centerId: number,
    @Query('teacherId') teacherId?: number,
    @Query('studyYear') studyYear?: StudyYear,
    @Query('gender') gender?: string,
    @Query('subSection') subSection?: string,
    @Query('section') section?: string,
    @Query('removeTeacher') removeTeacher?: number, // New query parameter for removing students of a specific teacher
    @Query('type') type?: string, // New query parameter for removing students of a specific teacher
    @Query('secondLang') secondLang?: string,
  ): Promise<Student[]> {
    // console.log(secondLang, query);

    // console.log('para', studyYear, 'para', teacherId);
    return this.studentService.findStudentsByCustomQuery(
      centerId,
      teacherId,
      studyYear,
      gender,
      subSection,
      section,
      removeTeacher,
      type,
      secondLang,
    );
  }

  // @Get('recent')
  // findRecentStudents(@Query('limit') limit: number = 100): Promise<Student[]> {
  //   return this.studentService.findRecentStudents(limit);
  // }
  @Get(':id')
  getStudentById(@Param('id') id: any): Promise<Student> {
    return this.studentService.findOne(id);
  }

  @Post()
  createStudent(@Body() createStudentDto: CreateStudentDto): Promise<Student> {
    return this.studentService.create(createStudentDto);
  }

  @Put(':id')
  updateStudent(
    @Param('id') id: any,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    return this.studentService.update(id, updateStudentDto);
  }

  @Delete(':id')
  deleteStudent(@Param('id') id: any): Promise<void> {
    return this.studentService.remove(id);
  }

  @Get('teacher/:teacherId')
  getStudentsByTeacher(
    @Param('teacherId') teacherId: number,
  ): Promise<Student[]> {
    return this.studentService.findByTeacher(teacherId);
  }

  @Post('with-teachers')
  async createWithTeachers(
    @Body() createStudentWithTeachersDto: CreateStudentWithTeachersDto,
  ): Promise<Student> {
    return this.studentService.createStudentWithTeachers(
      createStudentWithTeachersDto,
    );
  }
  @Patch('print')
  async markAsPrinted(@Body('ids') ids: number[]) {
    await this.studentService.markStudentsAsPrinted(ids);
  }
}
