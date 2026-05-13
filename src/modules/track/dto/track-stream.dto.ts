import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class TrackStreamDto {
  @ApiProperty({ example: '10.123.84.26' })
  @IsString()
  ipAddress!: string;

  @ApiProperty({ example: 'Cameroun' })
  @IsString()
  country!: string;

  @ApiProperty({ example: 'Douala' })
  @IsString()
  city!: string;

  @ApiProperty({ example: 'Chrome' })
  @IsString()
  device!: string;
}
