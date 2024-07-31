import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Subscription } from './subscription.entity';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  async createSubscription(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    return this.subscriptionService.createSubscription(
      createSubscriptionDto.studentId,
      createSubscriptionDto.teacherId,
      createSubscriptionDto.startDate,
      createSubscriptionDto.endDate,
      createSubscriptionDto.price,
    );
  }

  @Get('teacher/:teacherId')
  async getSubscriptionsByTeacher(
    @Param('teacherId') teacherId: number,
  ): Promise<Subscription[]> {
    return this.subscriptionService.getSubscriptionsByTeacher(teacherId);
  }

  @Put(':id')
  async updateSubscription(
    @Param('id') id: number,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionService.updateSubscription(
      id,
      updateSubscriptionDto,
    );
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return subscription;
  }

  @Delete(':id')
  async deleteSubscription(@Param('id') id: number): Promise<void> {
    return await this.subscriptionService.deleteSubscription(id);
  }
}
