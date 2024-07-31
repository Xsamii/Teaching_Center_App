// src/subscription/dto/create-subscription.dto.ts

export class CreateSubscriptionDto {
  studentId: number;
  teacherId: number;
  startDate: Date;
  endDate: Date;
  price: number; // Include price field
}
