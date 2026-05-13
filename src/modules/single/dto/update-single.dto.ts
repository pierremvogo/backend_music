import { PartialType } from '@nestjs/swagger';
import { CreateSingleDto } from './create-single.dto';

export class UpdateSingleDto extends PartialType(CreateSingleDto) {}
