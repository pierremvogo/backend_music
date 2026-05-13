import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString } from 'class-validator';

export class CreateTrackDto {
  @ApiProperty({ example: 'Track audio 001' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 25 })
  @IsNumber()
  duration!: number;

  @ApiProperty({ example: 'ey8dfdgfgdsfg.....' })
  @IsString()
  userId!: string;

  @ApiProperty({ example: 'ey8dfdgfgdsfg.....' })
  @IsString()
  moodId!: string;

  @ApiProperty({ example: 'https://cover.png' })
  @IsString()
  audioUrl!: string;

  @ApiProperty({ example: 'cover' })
  @IsString()
  audioFileName!: string;

  @ApiProperty({
    example: 'Lyrics song',
  })
  @IsString()
  lyrics!: string;

  @ApiProperty({ example: 'https://signlanguage.mp4' })
  @IsString()
  signLanguageVideoUrl!: string;

  @ApiProperty({ example: 'signlanguage' })
  @IsString()
  signLanguageFileName!: string;

  @ApiProperty({ example: 'Braille fileName' })
  @IsString()
  brailleFileName!: string;

  @ApiProperty({ example: 'https://braillefile.mp4' })
  @IsString()
  brailleFileUrl!: string;
}
