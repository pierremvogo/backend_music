import { Module } from '@nestjs/common';
import { EditorPlaylistService } from './editor-playlist.service';
import { EditorPlaylistController } from './editor-playlist.controller';

@Module({
  controllers: [EditorPlaylistController],
  providers: [EditorPlaylistService],
})
export class EditorPlaylistModule {}
