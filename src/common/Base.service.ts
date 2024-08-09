import {
  DeepPartial,
  FindManyOptions,
  // FindOneOptions,
  Repository,
} from 'typeorm';
import { BaseEntity } from './BaseEntity.abstract';
import { NotFoundException } from '@nestjs/common';

export abstract class BaseService<Entity extends BaseEntity<Entity>> {
  constructor(protected readonly repo: Repository<Entity>) {}

  async findOne(id: any): Promise<Entity> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['teachers'],
    });
    if (!entity) {
      throw new NotFoundException('this is not found');
    }
    return entity;
  }

  async findById(id: any): Promise<Entity> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException('this is not found');
    }
    return entity;
  }

  async findAll(options: FindManyOptions = {}): Promise<Entity[]> {
    return this.repo.find(options);
  }

  async create(data: DeepPartial<Entity>): Promise<Entity> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async createBulk(data: DeepPartial<Entity>[]): Promise<Entity[]> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: any): Promise<Entity> {
    await this.findById(id);
    await this.repo.save({ id, ...data });
    return await this.findById(id);
  }

  async save(data: any) {
    return await this.repo.save(data);
  }

  async remove(id: string) {
    const entity = await this.findById(id);
    await this.repo.remove(entity);
  }

  async removeMany(options: FindManyOptions = {}) {
    const entities = await this.findAll(options);
    await this.repo.remove(entities);
  }
}
