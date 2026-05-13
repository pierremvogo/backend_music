import { Module } from '@nestjs/common';
import { PlayListService } from './play-list.service';
import { PlayListController } from './play-list.controller';

@Module({
  controllers: [PlayListController],
  providers: [PlayListService],
})
export class PlayListModule {}
