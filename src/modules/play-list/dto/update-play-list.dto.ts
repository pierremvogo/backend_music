import { PartialType } from '@nestjs/swagger';
import { CreatePlayListDto } from './create-play-list.dto';

export class UpdatePlayListDto extends PartialType(CreatePlayListDto) {}
