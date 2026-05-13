import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreatePlayListDto {
  @ApiProperty({ example: 'Playlist 255' })
  @IsString()
  nom!: string;

  @ApiProperty({ example: 'cmog2ouxt00006vra45eix4uz' })
  @IsString()
  userId!: string;
}
