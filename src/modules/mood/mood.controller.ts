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
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { I18nLang } from 'nestjs-i18n';
import { MoodDto } from './dto/mood.dto';
import { MoodService } from './mood.service';

@Controller('mood')
export class MoodController {
  constructor(private readonly moodService: MoodService) {}
  @Post('createMood')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({ summary: 'Créer un mood pour track' })
  @ApiBody({ type: MoodDto })
  @ApiCreatedResponse({
    description: 'Mood créé avec succès',
  })
  @ApiConflictResponse({
    description: 'Un Mood avec ce nom existe déjà',
  })
  createMood(@Body() dto: MoodDto, @I18nLang() lang: string) {
    return this.moodService.createMood(dto, lang);
  }

  @Get('getMoods')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({ summary: 'Récupérer tous les moods' })
  @ApiCreatedResponse({
    description: 'Moods récupérés avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun mood trouvé',
  })
  findMoods(@I18nLang() lang: string) {
    return this.moodService.findMoods(lang);
  }

  @Get('getMoodById/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: "Id de l'mood",
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({ summary: 'Récupérer un mood' })
  @ApiCreatedResponse({
    description: 'Mood récupéré avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun mood trouvé',
  })
  findMoodById(@Param('id') id: string, @I18nLang() lang: string) {
    return this.moodService.findMoodById(id, lang);
  }

  @Patch('updateMood/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({
    summary: 'Mettre à jour un mood',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: "Id de l'utilisateur",
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOkResponse({
    description: 'Utilisateur mis à jour avec succès',
  })
  @ApiBadRequestResponse({
    description: 'Id manquant',
  })
  async updateMood(
    @Param('id') id: string,
    @Body() dto: MoodDto,
    @I18nLang() lang: string,
  ) {
    return this.moodService.updateMood(id, dto, lang);
  }

  @Delete('deleteMood/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Id du mood',
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({
    summary: 'Supprimer un mood',
  })
  @ApiOkResponse({
    description: 'Mood supprimé avec succès',
  })
  async deleteMood(@Param('id') id: string, @I18nLang() lang: string) {
    return this.moodService.deleteMood(id, lang);
  }
}
