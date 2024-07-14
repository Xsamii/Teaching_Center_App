import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Center } from './center.entity';
import { CenterService } from './center.service';
import { CenterController } from './center.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Center])],
  controllers: [CenterController],
  providers: [CenterService],
  exports: [CenterService],
})
export class CenterModule {}
