import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { Subscription } from './subscription.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from 'src/student/student.entity';
import { Teacher } from 'src/teacher/teacher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, Student, Teacher])],

  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class SubscriptionModule {}
