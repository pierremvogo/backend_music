import { PartialType } from '@nestjs/swagger';
import { CreateEpDto } from './create-ep.dto';

export class UpdateEpDto extends PartialType(CreateEpDto) {}
