// dto/create-checkout.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CheckoutItemDto {
  @ApiProperty({ example: 'Produit premium' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 29.99 })
  @IsNumber()
  price!: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  quantity!: number;
}

export class CreateCheckoutDto {
  @ApiProperty({
    type: [CheckoutItemDto],
    example: [
      {
        name: 'Produit premium',
        price: 29.99,
        quantity: 1,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items!: CheckoutItemDto[];

  @ApiPropertyOptional({ example: 'ORDER_123' })
  @IsString()
  @IsOptional()
  orderId?: string;
}
