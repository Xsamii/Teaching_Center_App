// src/modules/subject/subject.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  //   Delete,
  Body,
  Param,
} from '@nestjs/common';
import { SubjectService } from './subject.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/subject.dto';

@Controller('subjects')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Get()
  async findAll() {
    return this.subjectService.findAll();
  }

  @Get('/:id')
  async findOne(@Param('id') id: any) {
    return this.subjectService.findOne(id);
  }

  @Post()
  async create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectService.create(createSubjectDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: any,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ) {
    return this.subjectService.update(id, updateSubjectDto);
  }

  //   @Delete(':id')
  //   async delete(@Param('id') id: any) {
  //     return this.subjectService.delete(id);
  //   }
}
