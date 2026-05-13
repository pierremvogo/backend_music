import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
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
import { CreateEpDto } from './dto/create-ep.dto';
import { EpService } from './ep.service';
import { UpdateEpDto } from './dto/update-ep.dto';

@Controller('ep')
export class EpController {
  constructor(private readonly epService: EpService) {}
  @Post('createEp')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({ summary: 'Créer un ep pour un artiste' })
  @ApiBody({ type: CreateEpDto })
  @ApiCreatedResponse({
    description: 'Ep créé avec succès',
  })
  @ApiConflictResponse({
    description: "l'Ep existe déjà",
  })
  createEp(@Body() dto: CreateEpDto, @I18nLang() lang: string) {
    return this.epService.createEp(dto, lang);
  }

  @Get('getEps')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({ summary: 'Récupérer tous les eps' })
  @ApiCreatedResponse({
    description: 'Eps récupérés avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun ep trouvé',
  })
  findEps(@I18nLang() lang: string) {
    return this.epService.findEps(lang);
  }

  @Get('getEpById/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: "Id de l'ep",
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({ summary: 'Récupérer un ep' })
  @ApiCreatedResponse({
    description: 'Ep récupéré avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun ep trouvé',
  })
  findEpById(@Param('id') id: string, @I18nLang() lang: string) {
    return this.epService.findEpById(id, lang);
  }

  @Patch('updateEp/:id')
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
  @ApiBody({ type: UpdateEpDto })
  @ApiOperation({ summary: 'Mettre à jour un ep' })
  @ApiCreatedResponse({
    description: 'Ep mis à jour avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun ep trouvé',
  })
  updateEp(
    @Param('id') id: string,
    @Body() dto: UpdateEpDto,
    @I18nLang() lang: string,
  ) {
    return this.epService.updateEp(id, dto, lang);
  }

  @Delete('deleteEp/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: "Id de l'ep",
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({
    summary: 'Supprimer un ep',
  })
  @ApiOkResponse({
    description: 'Ep supprimé avec succès',
  })
  async deleteEp(@Param('id') id: string, @I18nLang() lang: string) {
    return this.epService.deleteEp(id, lang);
  }
}
