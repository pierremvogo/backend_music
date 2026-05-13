import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 'rt21gt2g5ftg2fgt5gf2g5t1g' })
  @IsString()
  @IsOptional()
  paymentId?: string;

  @ApiProperty({ example: 'PENDING' })
  @IsString()
  status!: string;
}
