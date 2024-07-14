import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CenterService } from './center.service';
import { CreateCenterDto, UpdateCenterDto } from './center.dto';
import { Center } from './center.entity';

@Controller('centers')
export class CenterController {
  constructor(private readonly centerService: CenterService) {}

  @Post()
  create(@Body() createCenterDto: CreateCenterDto): Promise<Center> {
    return this.centerService.create(createCenterDto);
  }

  @Get()
  findAll(): Promise<Center[]> {
    return this.centerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: any): Promise<Center> {
    return this.centerService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCenterDto: UpdateCenterDto,
  ): Promise<Center> {
    return this.centerService.update(id, updateCenterDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: any): Promise<void> {
    return this.centerService.remove(id);
  }
}
