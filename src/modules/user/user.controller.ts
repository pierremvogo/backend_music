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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { I18nLang } from 'nestjs-i18n';
import type { ROLE } from 'src/types/role';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Get('getArtistFan')
  // @ApiHeader({
  //   name: 'Accept-Language',
  //   description: 'Langue de la réponse (ex: en, es, fr)',
  //   required: false,
  //   example: 'es',
  // })
  // @ApiOperation({ summary: 'Récupérer les artistes pour un fan' })
  // @ApiOkResponse({
  //   description: 'Artistes récupérés avec succès',
  // })
  // getArtistsForFan(@I18nLang() lang: string) {
  //   return this.userService.getArtistsForFan(lang);
  // }

  @Get('getUserByEmail/:email')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'email',
    type: String,
    description: "Email de l'utilisateur",
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({ summary: 'Récupérer un utilisateur par son email' })
  @ApiOkResponse({
    description: 'Utilisateur récupéré avec succès',
  })
  @ApiBadRequestResponse({
    description: 'Email invalide ou données manquantes',
  })
  findUserByEmail(@Param('email') email: string, @I18nLang() lang: string) {
    return this.userService.findUserByEmail(email, lang);
  }

  @Get('getUserByRole/:role')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'role',
    type: String,
    description: "Role de l'utilisateur",
    example: 'FAN',
  })
  @ApiOperation({ summary: "Récupérer les utilisateurs d'un role" })
  @ApiOkResponse({
    description: 'Utilisateurs récupérés avec succès',
  })
  @ApiBadRequestResponse({
    description: 'Role invalide ou données manquantes',
  })
  findUserByRole(@Param('role') role: ROLE, @I18nLang() lang: string) {
    return this.userService.findUserByRole(role, lang);
  }

  @Get('getUserById/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({
    summary: 'Récupérer un utilisateur par son Id',
  })
  @ApiOkResponse({
    description: 'Utilisateur récupérer avec succès',
  })
  @ApiBadRequestResponse({
    description: 'Id manquant',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: "Id de l'utilisateur",
    example: 'f3a8c1d9b7e6...',
  })
  async findUserById(@Param('id') id: string, @I18nLang() lang: string) {
    return this.userService.findUserById(id, lang);
  }

  @Get('getAllUser')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({
    summary: 'Récupérer tous les utilisateurs',
  })
  @ApiOkResponse({
    description: 'Tous les Utilisateurs récupérer avec succès ',
  })
  async findAllUser(@I18nLang() lang: string) {
    return this.userService.findAllUser(lang);
  }

  @Patch('updateUser/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({
    summary: 'Mettre à jour un utilisateur',
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
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @I18nLang() lang: string,
  ) {
    return this.userService.updateUser(id, dto, lang);
  }

  @Delete('deleteUser/:id')
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
  @ApiOperation({
    summary: 'Supprimer un utilisateur',
  })
  @ApiOkResponse({
    description: 'Utilisateur supprimé avec succès',
  })
  async deleteUser(@Param('id') id: string, @I18nLang() lang: string) {
    return this.userService.deleteUser(id, lang);
  }
}
