import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/Base.service';
import { Repository } from 'typeorm';
import { Subject } from './subject.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SubjectService extends BaseService<Subject> {
  /**
   *
   */
  constructor(
    @InjectRepository(Subject)
    protected readonly subjectRepo: Repository<Subject>,
  ) {
    super(subjectRepo);
  }
}
