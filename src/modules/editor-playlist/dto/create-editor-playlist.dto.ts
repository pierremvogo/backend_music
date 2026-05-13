import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEditorPlaylistDto {
  @ApiProperty({ example: 'Editor Playlist 255' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'cmog2ouxt00006vra45eix4uz' })
  @IsString()
  createdByUserId!: string;

  @ApiProperty({ example: 'Description de la playlist editoriale' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 'https://cover.jpg' })
  @IsString()
  coverImageUrl!: string;

  @ApiProperty({ example: 'https://banner.jpg' })
  @IsString()
  bannerImageUrl!: string;

  @ApiProperty({ example: 'en' })
  @IsString()
  locale!: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isFeatured!: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  isPublished!: boolean;

  @ApiProperty({ example: 5 })
  @IsNumber()
  priority!: number;

  @ApiProperty({ example: 'Afrobeat' })
  @IsString()
  genre!: string;

  @ApiProperty({ example: 'Cameroun' })
  @IsString()
  country!: string;

  @ApiProperty({ example: 'Young' })
  @IsString()
  targetAudience!: string;

  @ApiProperty({ example: 'MANUAL' })
  @IsString()
  curationType!: 'MANUAL' | 'ALGORITHMIC' | 'HYBRID';
}
