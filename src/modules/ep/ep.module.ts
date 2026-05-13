import { Module } from '@nestjs/common';
import { EpService } from './ep.service';
import { EpController } from './ep.controller';

@Module({
  controllers: [EpController],
  providers: [EpService],
})
export class EpModule {}
