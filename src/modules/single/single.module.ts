import { Module } from '@nestjs/common';
import { SingleService } from './single.service';
import { SingleController } from './single.controller';

@Module({
  controllers: [SingleController],
  providers: [SingleService],
})
export class SingleModule {}
