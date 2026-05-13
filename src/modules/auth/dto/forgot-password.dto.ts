// dto/reset-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'pierre@example.com' })
  @IsEmail()
  email!: string;
}
