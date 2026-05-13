import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
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

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post('createTag')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({ summary: 'Créer un tag pour track' })
  @ApiBody({ type: CreateTagDto })
  @ApiCreatedResponse({
    description: 'Tag créé avec succès',
  })
  @ApiConflictResponse({
    description: 'Un Tag avec ce nom existe déjà',
  })
  createTag(@Body() dto: CreateTagDto, @I18nLang() lang: string) {
    return this.tagService.createTag(dto, lang);
  }

  @Get('getTags')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({ summary: 'Récupérer tous les tags' })
  @ApiCreatedResponse({
    description: 'Tags récupérés avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun tag trouvé',
  })
  findTags(@I18nLang() lang: string) {
    return this.tagService.findTags(lang);
  }

  @Get('getTagById/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: "Id de l'tag",
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({ summary: 'Récupérer un tag' })
  @ApiCreatedResponse({
    description: 'Tag récupéré avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun tag trouvé',
  })
  findTagById(@Param('id') id: string, @I18nLang() lang: string) {
    return this.tagService.findTagById(id, lang);
  }

  @Patch('updateTag/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({
    summary: 'Mettre à jour un tag',
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
  async updateTag(
    @Param('id') id: string,
    @Body() dto: UpdateTagDto,
    @I18nLang() lang: string,
  ) {
    return this.tagService.updateTag(id, dto, lang);
  }

  @Delete('deleteTag/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Id du tag',
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({
    summary: 'Supprimer un tag',
  })
  @ApiOkResponse({
    description: 'Tag supprimé avec succès',
  })
  async deleteTag(@Param('id') id: string, @I18nLang() lang: string) {
    return this.tagService.deleteTag(id, lang);
  }
}
