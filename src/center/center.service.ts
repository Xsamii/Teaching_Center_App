import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Center } from './center.entity';
import { UpdateCenterDto } from './center.dto';
import { BaseService } from 'src/common/Base.service';

@Injectable()
export class CenterService extends BaseService<Center> {
  constructor(
    @InjectRepository(Center)
    private readonly centerRepository: Repository<Center>,
  ) {
    super(centerRepository);
  }

  async update(id: any, updateCenterDto: UpdateCenterDto): Promise<Center> {
    const center = await this.findOne(id);
    if (!center) {
      throw new NotFoundException(`Center with ID ${id} not found`);
    }

    Object.assign(center, updateCenterDto);
    return this.centerRepository.save(center);
  }
}
