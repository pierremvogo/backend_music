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
  ApiOkResponse,
  ApiParam,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { TrackService } from './track.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { I18nLang } from 'nestjs-i18n';
import { UpdateTrackDto } from '../track/dto/update-track.dto';
import { TrackStreamDto } from './dto/track-stream.dto';
import { EditorPlayListTrackDto } from './dto/editor-playlist-track.dto';

@Controller('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}
  @Post('createTrack')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({ summary: 'Créer un track audio' })
  @ApiBody({ type: CreateTrackDto })
  @ApiCreatedResponse({
    description: 'Track créé avec succès',
  })
  @ApiConflictResponse({
    description: 'Un Track avec ce nom existe déjà',
  })
  createTrack(@Body() dto: CreateTrackDto, @I18nLang() lang: string) {
    return this.trackService.createTrack(dto, lang);
  }

  @Post('addTrackToRelease/:trackId/:releaseId')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'trackId',
    type: String,
    description: 'Id du track',
    example: 'f3a8c1d9b7e6...',
  })
  @ApiParam({
    name: 'releaseId',
    type: String,
    description: 'Id de la release',
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({ summary: 'Ajouter un track audio à une release' })
  @ApiCreatedResponse({
    description: 'Track associé avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun track trouvé',
  })
  addTrackToRelease(
    @Param('trackId') trackId: string,
    @Param('releaseId') releaseId: string,
    @I18nLang() lang: string,
  ) {
    return this.trackService.addTrackToRelease(releaseId, trackId, lang);
  }

  @Post('addTrackToPlaylist/:trackId/:playlistId')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'trackId',
    type: String,
    description: 'Id du track',
    example: 'f3a8c1d9b7e6...',
  })
  @ApiParam({
    name: 'playlistId',
    type: String,
    description: 'Id de la playlist',
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({ summary: 'Ajouter un track audio à une playlist' })
  @ApiCreatedResponse({
    description: 'Track associé avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun track trouvé',
  })
  addTrackToPlaylist(
    @Param('trackId') trackId: string,
    @Param('playlistId') playlistId: string,
    @I18nLang() lang: string,
  ) {
    return this.trackService.addTrackToPlayList(playlistId, trackId, lang);
  }

  @Post('addTrackToEditorPlaylist/:trackId/:editorPlaylistId')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'trackId',
    type: String,
    description: 'Id du track',
    example: 'f3a8c1d9b7e6...',
  })
  @ApiParam({
    name: 'editorPlaylistId',
    type: String,
    description: 'Id de la playlist éditoriale',
    example: 'f3a8c1d9b7e6...',
  })
  @ApiBody({ type: EditorPlayListTrackDto })
  @ApiOperation({ summary: 'Ajouter un track audio à une playlist éditoriale' })
  @ApiCreatedResponse({
    description: 'Track ajouté avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun track trouvé',
  })
  addTrackToEditorPlaylist(
    @Body() dto: EditorPlayListTrackDto,
    @Param('trackId') trackId: string,
    @Param('editorPlaylistId') editorPlayListId: string,
    @I18nLang() lang: string,
  ) {
    return this.trackService.addTrackToEditorPlayList(
      editorPlayListId,
      trackId,
      dto,
      lang,
    );
  }

  @Post('streamTrack/:trackId/:userId')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'trackId',
    type: String,
    description: 'Id du track',
    example: 'f3a8c1d9b7e6...',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: "Id de l'utilisateur",
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({ summary: 'Lire un track audio' })
  @ApiBody({ type: TrackStreamDto })
  @ApiCreatedResponse({
    description: 'Track audio lu avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun track trouvé',
  })
  streamTrack(
    @Param('trackId') trackId: string,
    @Param('userId') userId: string,
    @Body() dto: TrackStreamDto,
    @I18nLang() lang: string,
  ) {
    return this.trackService.streamTrack(userId, trackId, dto, lang);
  }

  @Get('getTracks')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({ summary: 'Récupérer tous les tracks' })
  @ApiCreatedResponse({
    description: 'Tracks récupérés avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun track trouvé',
  })
  findTracks(@I18nLang() lang: string) {
    return this.trackService.findTracks(lang);
  }

  @Get('getTrackById/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Id du track',
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({ summary: 'Récupérer un track' })
  @ApiCreatedResponse({
    description: 'Track récupéré avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun track trouvé',
  })
  findTrackById(@Param('id') id: string, @I18nLang() lang: string) {
    return this.trackService.findTrackById(id, lang);
  }

  @Get('getTracksByReleaseId/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Id de la sortie musicale (album, ep, single)',
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({ summary: "Récupérer tous les tracks d'une sortie musicale" })
  @ApiCreatedResponse({
    description: 'Track récupéré avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun track trouvé',
  })
  findTracksByReleaseId(@Param('id') id: string, @I18nLang() lang: string) {
    return this.trackService.findTracksByReleaseId(id, lang);
  }

  @Get('getTracksByMoodId/:id')
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
  @ApiOperation({ summary: "Récupérer tous les tracks d'un mood" })
  @ApiCreatedResponse({
    description: 'Track récupéré avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun track trouvé',
  })
  findTracksByMoodId(@Param('id') id: string, @I18nLang() lang: string) {
    return this.trackService.findTracksByMoodId(id, lang);
  }

  @Get('getTracksByPlaylistId/:id')
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
  @ApiOperation({ summary: "Récupérer tous les tracks d'une playlist" })
  @ApiCreatedResponse({
    description: 'Track récupéré avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun track trouvé',
  })
  findTracksByPlaylistId(@Param('id') id: string, @I18nLang() lang: string) {
    return this.trackService.findTracksByPlaylistId(id, lang);
  }

  @Get('getTopStreamTracks')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({ summary: 'Récupérer tous les tracks les plus écoutés' })
  @ApiCreatedResponse({
    description: 'Meilleure stream Tracks récupérés avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun track trouvé',
  })
  findTopStreamedTracks(limit: number, @I18nLang() lang: string) {
    return this.trackService.findTopStreamedTracks(limit, lang);
  }

  @Patch('updateTrack/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Id du track',
    example: 'f3a8c1d9b7e6...',
  })
  @ApiBody({ type: UpdateTrackDto })
  @ApiOperation({ summary: 'Mettre à jour un track' })
  @ApiCreatedResponse({
    description: 'Track mis à jour avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun track trouvé',
  })
  updateTrack(
    @Param('id') id: string,
    @Body() dto: UpdateTrackDto,
    @I18nLang() lang: string,
  ) {
    return this.trackService.updateTrack(id, dto, lang);
  }
  @Delete('removeTrackToRelease/:releaseId/:trackId')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'releaseId',
    type: String,
    description: 'Id de la release',
    example: 'f3a8c1d9b7e6...',
  })
  @ApiParam({
    name: 'trackId',
    type: String,
    description: 'Id du track',
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({
    summary: "retirer une track d'une release",
  })
  @ApiOkResponse({
    description: 'Track retiré avec succes',
  })
  async removeTrackToRelease(
    @Param('releaseId') releaseId: string,
    @Param('trackId') trackId: string,
    @I18nLang() lang: string,
  ) {
    return this.trackService.removeTrackToRelease(releaseId, trackId, lang);
  }
  @Delete('removeTrackToPlaylist/:playlistId/:trackId')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'playlistId',
    type: String,
    description: 'Id de la playlist',
    example: 'f3a8c1d9b7e6...',
  })
  @ApiParam({
    name: 'trackId',
    type: String,
    description: 'Id du track',
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({
    summary: "retirer une track d'une playlist",
  })
  @ApiOkResponse({
    description: 'Track retiré avec succes',
  })
  async removeTrackToPlaylist(
    @Param('playlistId') playlistId: string,
    @Param('trackId') trackId: string,
    @I18nLang() lang: string,
  ) {
    return this.trackService.removeTrackToPlaylist(playlistId, trackId, lang);
  }

  @Delete('removeTrackToEditorPlaylist/:editorPlaylistId/:trackId')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'editorPlaylistId',
    type: String,
    description: 'Id de la playlist editoriale',
    example: 'f3a8c1d9b7e6...',
  })
  @ApiParam({
    name: 'trackId',
    type: String,
    description: 'Id du track',
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({
    summary: "retirer une track d'une playlist editoriale",
  })
  @ApiOkResponse({
    description: 'Track retiré avec succes',
  })
  async removeTrackToEditorPlaylist(
    @Param('editorPlaylistId') editorPlaylistId: string,
    @Param('trackId') trackId: string,
    @I18nLang() lang: string,
  ) {
    return this.trackService.removeTrackToEditorPlaylist(
      editorPlaylistId,
      trackId,
      lang,
    );
  }

  @Delete('deleteTrack/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Id du track',
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({
    summary: 'Supprimer un track',
  })
  @ApiOkResponse({
    description: 'Track supprimé avec succès',
  })
  async deleteTrack(@Param('id') id: string, @I18nLang() lang: string) {
    return this.trackService.deleteTrack(id, lang);
  }
}
