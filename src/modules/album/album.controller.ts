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
import { CreateAlbumDto } from './dto/create-album.dto';
import { AlbumService } from './album.service';
import { UpdateAlbumDto } from './dto/update-album.dto';

@Controller('album')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}
  @Post('createAlbum')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({ summary: 'Créer un album pour un artiste' })
  @ApiBody({ type: CreateAlbumDto })
  @ApiCreatedResponse({
    description: 'Album créé avec succès',
  })
  @ApiConflictResponse({
    description: "l'Album existe déjà",
  })
  createAlbum(@Body() dto: CreateAlbumDto, @I18nLang() lang: string) {
    return this.albumService.createAlbum(dto, lang);
  }

  @Get('getAlbums')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({ summary: 'Récupérer tous les albums' })
  @ApiCreatedResponse({
    description: 'Albums récupérés avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun album trouvé',
  })
  findAlbums(@I18nLang() lang: string) {
    return this.albumService.findAlbums(lang);
  }

  @Get('getAlbumById/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: "Id de l'album",
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({ summary: 'Récupérer un album' })
  @ApiCreatedResponse({
    description: 'Album récupéré avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun album trouvé',
  })
  findAlbumById(@Param('id') id: string, @I18nLang() lang: string) {
    return this.albumService.findAlbumById(id, lang);
  }

  @Patch('updateAlbum/:id')
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
  @ApiBody({ type: UpdateAlbumDto })
  @ApiOperation({ summary: 'Mettre à jour un album' })
  @ApiCreatedResponse({
    description: 'Album mis à jour avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun album trouvé',
  })
  updateAlbum(
    @Param('id') id: string,
    @Body() dto: UpdateAlbumDto,
    @I18nLang() lang: string,
  ) {
    return this.albumService.updateAlbum(id, dto, lang);
  }

  @Delete('deleteAlbum/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: "Id de l'album",
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({
    summary: 'Supprimer un album',
  })
  @ApiOkResponse({
    description: 'Album supprimé avec succès',
  })
  async deleteAlbum(@Param('id') id: string, @I18nLang() lang: string) {
    return this.albumService.deleteAlbum(id, lang);
  }
}
