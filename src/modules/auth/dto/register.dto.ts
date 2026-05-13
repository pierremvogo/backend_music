import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Pierre' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Mballa' })
  @IsString()
  surname!: string;

  @ApiProperty({ example: 'pierre237' })
  @IsString()
  username!: string;

  @ApiProperty({ example: 'pierre@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    example: 'ARTIST',
    description: 'Type de compte (artist, fan, admin, tester, etc.)',
  })
  @IsString()
  role!: 'ARTIST' | 'FAN' | 'ADMIN' | 'USER' | 'EDITOR';

  @ApiPropertyOptional({ example: 'Lil Pierre' })
  @IsOptional()
  @IsString()
  artistName?: string;

  @ApiPropertyOptional({ example: 'Afrobeat' })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({ example: 'Artiste camerounais passionné de musique.' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 'Cameroon' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'https://example.com/profile.jpg' })
  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/video.mp4' })
  @IsOptional()
  @IsString()
  videoIntroUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/loop.mp4' })
  @IsOptional()
  @IsString()
  miniVideoLoopUrl?: string;

  @ApiPropertyOptional({ example: 'video.mp4' })
  @IsOptional()
  @IsString()
  videoIntroFileName?: string;

  @ApiPropertyOptional({ example: 'loop.mp4' })
  @IsOptional()
  @IsString()
  miniVideoLoopFileName?: string;

  @ApiPropertyOptional({ example: 'profile.jpg' })
  @IsOptional()
  @IsString()
  profileImageFileName?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isSubscribed?: boolean;

  @ApiPropertyOptional({
    example: ['tag-id-1', 'tag-id-2'],
    description: 'Liste des IDs des tags (uniquement pour les artistes)',
  })
  @IsOptional()
  @IsArray()
  tagIds?: string[];
}
