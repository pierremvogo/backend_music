import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { I18nLang } from 'nestjs-i18n';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class Auth1Controller {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({ summary: 'Créer un compte utilisateur' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    description: 'Utilisateur créé avec succès',
  })
  @ApiConflictResponse({
    description: 'Email ou nom d’utilisateur déjà utilisé',
  })
  register(@Body() dto: RegisterDto, @I18nLang() lang: string) {
    return this.authService.register(dto, lang);
  }

  @Post('login')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({ summary: 'Se connecter' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Connexion réussie',
  })
  @ApiUnauthorizedResponse({
    description: 'Identifiants invalides',
  })
  login(@Body() dto: LoginDto, @I18nLang() lang: string) {
    return this.authService.login(dto, lang);
  }

  @Post('forgot-password')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({
    summary: 'Demander un lien de réinitialisation du mot de passe',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiOkResponse({
    description:
      'Si le compte existe, un email de réinitialisation a été envoyé',
  })
  @ApiBadRequestResponse({
    description: 'Email invalide ou données manquantes',
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @I18nLang() lang: string,
  ) {
    return this.authService.forgotPassword(dto, lang);
  }

  @Post('reset-password/:token')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({
    summary: 'Réinitialiser le mot de passe',
  })
  @ApiParam({
    name: 'token',
    type: String,
    description: 'Token de réinitialisation reçu par email',
    example: 'f3a8c1d9b7e6...',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({
    description: 'Mot de passe réinitialisé avec succès',
  })
  @ApiBadRequestResponse({
    description: 'Token invalide ou expiré, ou mot de passe invalide',
  })
  async resetPassword(
    @Param('token') token: string,
    @Body() dto: ResetPasswordDto,
    @I18nLang() lang: string,
  ) {
    return this.authService.resetPassword(token, dto, lang);
  }

  @Get('verify-email/:token')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({
    summary: 'Vérifier l’adresse email avec un token',
  })
  @ApiParam({
    name: 'token',
    type: String,
    description: 'Token de vérification reçu par email',
    example: '4839',
  })
  @ApiOkResponse({
    description: 'Adresse email vérifiée avec succès',
  })
  @ApiBadRequestResponse({
    description: 'Token de vérification invalide ou expiré',
  })
  async verifyEmail(@Param('token') token: string, @I18nLang() lang: string) {
    return this.authService.verifyEmail(token, lang);
  }
}
