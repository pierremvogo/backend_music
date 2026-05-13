import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class EditorPlayListTrackDto {
  @ApiProperty({ example: 2 })
  @IsNumber()
  position!: number;

  @ApiProperty({ example: 'cmog2ouxt00006vra45eix4uz' })
  @IsString()
  addedByEditorId!: string;
}
