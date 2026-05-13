import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class MoodDto {
  @ApiProperty({ example: 'sad' })
  @IsString()
  name!: string;
}
