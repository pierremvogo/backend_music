// dto/reset-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Nouveau mot de passe de l’utilisateur',
    example: 'MonMotDePasse123!',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}
