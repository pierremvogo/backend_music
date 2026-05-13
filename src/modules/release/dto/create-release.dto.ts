import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateReleaseDto {
  @ApiProperty({ example: 'MY FIRST RELEASE' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'ey8dfdgfgdsfg.....' })
  @IsString()
  userId!: string;

  @ApiProperty({ example: 'https://cover.png' })
  @IsString()
  coverUrl!: string;

  @ApiProperty({ example: 'cover' })
  @IsString()
  coverFileName!: string;

  @ApiProperty({ example: '2015-01-10' })
  @IsString()
  releaseDate!: string;

  @ApiProperty({ example: 'Release description' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 'Release Label' })
  @IsString()
  label!: string;

  @ApiProperty({ example: 'album' })
  @IsString()
  releaseType!: string;

  @ApiPropertyOptional({ example: 'mp3' })
  @IsString()
  format!: string;

  @ApiProperty({ example: '125F59G635R' })
  @IsString()
  upcCode!: string;

  @ApiProperty({ example: 'PENDING' })
  @IsString()
  status!:
    | 'DRAFT' //En cours de crétation, pas encore soumise
    | 'PENDING' // Soumise, en attente de validation/modération
    | 'APPROVED' //Validée, prête à etre publiée
    | 'REJECTED' //refusée (avec raison)
    | 'PUBLISHED' //Visible publiquement
    | 'SHEDULED' //|Approuvée mais publication programée à une date future
    | 'UNPUBLISHED'; // Retirée de la publication
}
