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
import { CreatePlayListDto } from './dto/create-play-list.dto';
import { PlayListService } from './play-list.service';
import { UpdatePlayListDto } from './dto/update-play-list.dto';

@Controller('playlist')
export class PlayListController {
  constructor(private readonly playlistService: PlayListService) {}
  @Post('createPlaylist')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({ summary: 'Créer un playlist pour track' })
  @ApiBody({ type: CreatePlayListDto })
  @ApiCreatedResponse({
    description: 'Playlist créé avec succès',
  })
  @ApiConflictResponse({
    description: 'Un Playlist avec ce nom existe déjà',
  })
  createPlaylist(@Body() dto: CreatePlayListDto, @I18nLang() lang: string) {
    return this.playlistService.createPlayList(dto, lang);
  }

  @Get('getPlaylists')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({ summary: 'Récupérer tous les playlists' })
  @ApiCreatedResponse({
    description: 'Playlists récupérés avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun playlist trouvé',
  })
  findPlaylists(@I18nLang() lang: string) {
    return this.playlistService.findPlayLists(lang);
  }

  @Get('getPlaylistById/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: "Id de l'playlist",
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({ summary: 'Récupérer un playlist' })
  @ApiCreatedResponse({
    description: 'Playlist récupéré avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun playlist trouvé',
  })
  findPlaylistById(@Param('id') id: string, @I18nLang() lang: string) {
    return this.playlistService.findPlayListById(id, lang);
  }

  @Patch('updatePlaylist/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({
    summary: 'Mettre à jour une playlist',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: "Id de l'utilisateur",
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOkResponse({
    description: 'Playlist mis à jour avec succès',
  })
  @ApiBadRequestResponse({
    description: 'Id manquant',
  })
  async updatePlaylist(
    @Param('id') id: string,
    @Body() dto: UpdatePlayListDto,
    @I18nLang() lang: string,
  ) {
    return this.playlistService.updatePlayList(id, dto, lang);
  }

  @Delete('deletePlaylist/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Id de la playlist',
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({
    summary: 'Supprimer un playlist',
  })
  @ApiOkResponse({
    description: 'Playlist supprimé avec succès',
  })
  async deletePlaylist(@Param('id') id: string, @I18nLang() lang: string) {
    return this.playlistService.deletePlayList(id, lang);
  }
}
