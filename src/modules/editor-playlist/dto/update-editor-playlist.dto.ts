import { PartialType } from '@nestjs/swagger';
import { CreateEditorPlaylistDto } from './create-editor-playlist.dto';

export class UpdateEditorPlaylistDto extends PartialType(CreateEditorPlaylistDto) {}
