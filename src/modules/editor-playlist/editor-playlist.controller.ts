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
import { CreateEditorPlaylistDto } from './dto/create-editor-playlist.dto';
import { EditorPlaylistService } from './editor-playlist.service';
import { UpdateEditorPlaylistDto } from './dto/update-editor-playlist.dto';

@Controller('editor-playlist')
export class EditorPlaylistController {
  constructor(private readonly editorPlaylistService: EditorPlaylistService) {}
  @Post('createEditorPlaylist')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({ summary: 'Créer un editoreditorPlaylist pour track' })
  @ApiBody({ type: CreateEditorPlaylistDto })
  @ApiCreatedResponse({
    description: 'editorPlaylist créé avec succès',
  })
  @ApiConflictResponse({
    description: 'Un editorPlaylist avec ce nom existe déjà',
  })
  createeditorPlaylist(
    @Body() dto: CreateEditorPlaylistDto,
    @I18nLang() lang: string,
  ) {
    return this.editorPlaylistService.createEditorPlaylist(dto, lang);
  }

  @Get('getEditorPlaylists')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({ summary: 'Récupérer tous les editoreditorPlaylists' })
  @ApiCreatedResponse({
    description: 'editorPlaylists récupérés avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun editoreditorPlaylist trouvé',
  })
  findeditorPlaylists(@I18nLang() lang: string) {
    return this.editorPlaylistService.findEditorPlayLists(lang);
  }

  @Get('getEditorPlaylistById/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: "Id de l'editoreditorPlaylist",
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({ summary: 'Récupérer un editorPlaylist' })
  @ApiCreatedResponse({
    description: 'editorPlaylist récupéré avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun editorPlaylist trouvé',
  })
  findeditorPlaylistById(@Param('id') id: string, @I18nLang() lang: string) {
    return this.editorPlaylistService.findEditorPlayListById(id, lang);
  }

  @Patch('updateEditorPlaylist/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({
    summary: 'Mettre à jour une editoreditorPlaylist',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Id de la editoreditorPlaylist',
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOkResponse({
    description: 'editorPlaylist mis à jour avec succès',
  })
  @ApiBadRequestResponse({
    description: 'Id manquant',
  })
  async updateeditorPlaylist(
    @Param('id') id: string,
    @Body() dto: UpdateEditorPlaylistDto,
    @I18nLang() lang: string,
  ) {
    return this.editorPlaylistService.updateEditorPlayList(id, dto, lang);
  }

  @Delete('deleteEditorPlaylist/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Id de la editoreditorPlaylist',
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({
    summary: 'Supprimer un editoreditorPlaylist',
  })
  @ApiOkResponse({
    description: 'editorPlaylist supprimé avec succès',
  })
  async deleteeditorPlaylist(
    @Param('id') id: string,
    @I18nLang() lang: string,
  ) {
    return this.editorPlaylistService.deleteEditorPlayList(id, lang);
  }
}
