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
import { CreateSingleDto } from './dto/create-single.dto';
import { SingleService } from './single.service';
import { UpdateSingleDto } from './dto/update-single.dto';

@Controller('single')
export class SingleController {
  constructor(private readonly singleService: SingleService) {}
  @Post('createSingle')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({ summary: 'Créer un single pour un artiste' })
  @ApiBody({ type: CreateSingleDto })
  @ApiCreatedResponse({
    description: 'Single créé avec succès',
  })
  @ApiConflictResponse({
    description: "l'Single existe déjà",
  })
  createSingle(@Body() dto: CreateSingleDto, @I18nLang() lang: string) {
    return this.singleService.createSingle(dto, lang);
  }

  @Get('getSingles')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({ summary: 'Récupérer tous les singles' })
  @ApiCreatedResponse({
    description: 'Singles récupérés avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun single trouvé',
  })
  findSingles(@I18nLang() lang: string) {
    return this.singleService.findSingles(lang);
  }

  @Get('getSingleById/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: "Id de l'single",
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({ summary: 'Récupérer un single' })
  @ApiCreatedResponse({
    description: 'Single récupéré avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun single trouvé',
  })
  findSingleById(@Param('id') id: string, @I18nLang() lang: string) {
    return this.singleService.findSingleById(id, lang);
  }

  @Patch('updateSingle/:id')
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
  @ApiBody({ type: UpdateSingleDto })
  @ApiOperation({ summary: 'Mettre à jour un single' })
  @ApiCreatedResponse({
    description: 'Single mis à jour avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun single trouvé',
  })
  updateSingle(
    @Param('id') id: string,
    @Body() dto: UpdateSingleDto,
    @I18nLang() lang: string,
  ) {
    return this.singleService.updateSingle(id, dto, lang);
  }

  @Delete('deleteSingle/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: "Id de l'single",
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({
    summary: 'Supprimer un single',
  })
  @ApiOkResponse({
    description: 'Single supprimé avec succès',
  })
  async deleteSingle(@Param('id') id: string, @I18nLang() lang: string) {
    return this.singleService.deleteSingle(id, lang);
  }
}
