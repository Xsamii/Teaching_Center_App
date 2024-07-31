import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './subscription.entity';
import { Student } from '../student/student.entity';
import { Teacher } from '../teacher/teacher.entity';
// import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {}

  async createSubscription(
    studentId: number,
    teacherId: number,
    startDate: Date,
    endDate: Date,
    price: number,
  ): Promise<Subscription> {
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

    const subscription = this.subscriptionRepository.create({
      student,
      teacher,
      startDate,
      endDate,
      price,
    });

    return await this.subscriptionRepository.save(subscription);
  }

  async getSubscriptionsByTeacher(teacherId: number): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { teacher: { id: teacherId } },
      relations: ['student'],
    });
  }

  async updateSubscription(
    id: number,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
    });
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    Object.assign(subscription, updateSubscriptionDto);

    return this.subscriptionRepository.save(subscription);
  }

  async deleteSubscription(id: number): Promise<void> {
    const result = await this.subscriptionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
  }
}
