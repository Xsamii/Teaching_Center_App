import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Teacher } from './teacher.entity';
import { CreateStudentTeacherDto } from './dto/create-student-teacher.dto';
import { StudentTeacher } from './student-teacher.entity';

@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  async create(@Body() createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    console.log('creating teacher', createTeacherDto);
    return await this.teacherService.create(createTeacherDto);
  }

  @Get()
  async findAll(): Promise<Teacher[]> {
    return await this.teacherService.findAll();
  }
  @Get('custom-prices')
  async getAllCustomPrices() {
    return await this.teacherService.getAllCustomPrices();
  }
  @Delete('custom-price/:id')
  async deleteCustomPrice(@Param('id') id: number) {
    console.log('hereee', id);
    await this.teacherService.deleteCustomPrice(id);
    return { message: 'Custom price deleted successfully' };
  }

  @Get(':id')
  async findOne(@Param('id') id: any): Promise<Teacher> {
    return await this.teacherService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: any,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ): Promise<Teacher> {
    return await this.teacherService.update(id, updateTeacherDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: any): Promise<void> {
    await this.teacherService.remove(id);
  }

  @Get('by-subject/:subjectId')
  async findAllBySubject(
    @Param('subjectId') subjectId: any,
  ): Promise<Teacher[]> {
    return await this.teacherService.findAllBySubject(subjectId);
  }

  @Get('center/:centerId')
  async getTeachersByCenter(
    @Param('centerId') centerId: any,
  ): Promise<Teacher[]> {
    return this.teacherService.findTeachersByCenter(centerId);
  }

  @Post(':teacherId/add-student')
  async addStudentToTeacher(
    @Param('teacherId') teacherId: number,
    @Body() addStudentDto: { studentId: number },
  ) {
    return this.teacherService.addStudentToTeacher(
      teacherId,
      addStudentDto.studentId,
    );
  }

  @Post('add-custom-price')
  async addCustomPrice(
    @Body() createStudentTeacherDto: CreateStudentTeacherDto,
  ): Promise<StudentTeacher> {
    return this.teacherService.addCustomPrice(createStudentTeacherDto);
  }

  @Delete(':teacherId/remove-student/:studentId')
  async removeStudentFromTeacher(
    @Param('teacherId') teacherId: number,
    @Param('studentId') studentId: number,
  ): Promise<void> {
    return this.teacherService.removeStudentFromTeacher(teacherId, studentId);
  }
}
