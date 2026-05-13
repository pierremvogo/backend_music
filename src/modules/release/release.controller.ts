import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ReleaseService } from './release.service';
import { CreateReleaseDto } from './dto/create-release.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';
import {
  ApiHeader,
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiOkResponse,
} from '@nestjs/swagger';
import { I18nLang } from 'nestjs-i18n';

@Controller('release')
export class ReleaseController {
  constructor(private readonly releaseService: ReleaseService) {}

  @Post('createRelease')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({ summary: 'Créer une release pour un artiste' })
  @ApiBody({ type: CreateReleaseDto })
  @ApiCreatedResponse({
    description: 'Release créé avec succès',
  })
  @ApiConflictResponse({
    description: 'Une Release avec ce nom existe déjà',
  })
  createRelease(@Body() dto: CreateReleaseDto, @I18nLang() lang: string) {
    return this.releaseService.createRelease(dto, lang);
  }

  @Get('getReleases')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({ summary: 'Récupérer toutes les releases' })
  @ApiCreatedResponse({
    description: 'Releases récupérées avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucune release trouvé',
  })
  findReleases(@I18nLang() lang: string) {
    return this.releaseService.findReleases(lang);
  }

  @Get('getReleaseById/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Id de la release',
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({ summary: 'Récupérer une release' })
  @ApiCreatedResponse({
    description: 'Release récupérée avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucune release trouvée',
  })
  findReleaseById(@Param('id') id: string, @I18nLang() lang: string) {
    return this.releaseService.findReleaseById(id, lang);
  }

  @Get('getReleasesByUserId/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: "Id de l'utilisateur",
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({ summary: "Récupérer toutes les releases d'un utilisateur" })
  @ApiCreatedResponse({
    description: 'Releases récupérées avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucune release trouvée',
  })
  findReleasesByUserId(@Param('id') id: string, @I18nLang() lang: string) {
    return this.releaseService.findReleasesByUserId(id, lang);
  }

  @Patch('updateRelease/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: "Id de l'utilisateur",
    example: 'f3a8c1d9b7e6...',
  })
  @ApiBody({ type: UpdateReleaseDto })
  @ApiOperation({ summary: 'Mettre à jour une release' })
  @ApiCreatedResponse({
    description: 'Release mise à jour avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucune release trouvé',
  })
  updateRelease(
    @Param('id') id: string,
    @Body() dto: UpdateReleaseDto,
    @I18nLang() lang: string,
  ) {
    return this.releaseService.updateRelease(id, dto, lang);
  }

  @Delete('deleteRelease/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Id de la release',
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({
    summary: 'Supprimer une release',
  })
  @ApiOkResponse({
    description: 'Release supprimée avec succès',
  })
  async deleteRelease(@Param('id') id: string, @I18nLang() lang: string) {
    return this.releaseService.deleteRelease(id, lang);
  }
}
