import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateSingleDto {
  @ApiProperty({ example: 'e2bg585df..' })
  @IsString()
  releaseId!: string;

  @ApiProperty({
    example: 'Authors125',
  })
  @IsString()
  authors!: string;

  @ApiProperty({ example: 'Lil Pierre' })
  @IsString()
  producers!: string;

  @ApiProperty({ example: 'John doe' })
  @IsString()
  lyricists!: string;

  @ApiProperty({ example: 'Gaso fre' })
  @IsString()
  @IsOptional()
  musiciansVocals!: string;

  @ApiProperty({ example: 'Piano25' })
  @IsString()
  musiciansPianoKeyboards!: string;

  @ApiPropertyOptional({ example: 'Winds 145' })
  @IsString()
  @IsOptional()
  musiciansWinds!: string;

  @ApiProperty({ example: 'Percussion 856' })
  @IsString()
  @IsOptional()
  musiciansPercussion!: string;

  @ApiProperty({ example: 'Strings 230' })
  @IsString()
  @IsOptional()
  musiciansStrings!: string;

  @ApiProperty({ example: 'mixing eng 202' })
  @IsString()
  @IsOptional()
  mixingEngineer!: string;

  @ApiProperty({ example: 'mastering eng 12' })
  @IsString()
  @IsOptional()
  masteringEngineer!: string;
}
