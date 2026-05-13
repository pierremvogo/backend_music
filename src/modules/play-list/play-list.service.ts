import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { CreatePlayListDto } from './dto/create-play-list.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { slugify } from 'src/utils/slugify';
import { UpdatePlayListDto } from './dto/update-play-list.dto';

@Injectable()
export class PlayListService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async createPlayList(dto: CreatePlayListDto, lang?: string) {
    const slug = slugify(dto.nom);
    const existingPlayList = await this.prisma.playlist.findFirst({
      where: { slug: slug },
    });
    if (existingPlayList) {
      throw new ConflictException(
        this.i18n.translate('playlist.PLAYLIST_ALREADY_EXIST', { lang }),
      );
    }
    // Vérifie si le fan existe
    const existingUser = await this.prisma.user.findFirst({
      where: { AND: { id: dto.userId, role: 'FAN' } },
    });

    if (!existingUser) {
      throw new BadRequestException(
        this.i18n.translate('playlist.NO_USER_FOUND', { lang }),
      );
    }
    const createdPlayList = await this.prisma.playlist.create({
      data: {
        nom: dto.nom,
        slug: slug,
        userId: dto.userId,
      },
    });
    if (!createdPlayList) {
      throw new BadRequestException(
        this.i18n.translate('playlist.ERROR_CREATED_PLAYLIST', { lang }),
      );
    }
    return {
      message: this.i18n.translate('playlist.SUCCESSFULLY_CREATED_PLAYLIST', {
        lang,
      }),
      data: createdPlayList,
    };
  }

  async findPlayLists(lang?: string) {
    const allPlayLists = await this.prisma.playlist.findMany({
      orderBy: {
        id: 'desc',
      },
    });
    if (!allPlayLists) {
      throw new NotFoundException(
        this.i18n.translate('playlist.PLAYLIST_NOT_FOUND', {
          lang,
        }),
      );
    }
    return {
      data: allPlayLists,
      message: this.i18n.translate('playlist.SUCCESSFULLY_GET_ALL_PLAYLIST', {
        lang,
      }),
    };
  }

  async findPlayListById(playlistId: string, lang?: string) {
    try {
      if (!playlistId) {
        throw new BadRequestException(
          this.i18n.translate('playlist.NO_PLAYLIST_ID_GIVEN', {
            lang,
          }),
        );
      }
      const playlist = await this.prisma.playlist.findFirst({
        where: { id: playlistId },
      });
      if (!playlist) {
        throw new NotFoundException(
          this.i18n.translate('playlist.PLAYLIST_NOT_FOUND', {
            lang,
          }),
        );
      }
      return {
        data: playlist,
        message: this.i18n.translate('playlist.SUCCESSFULLY_GET_PLAYLIST', {
          lang,
        }),
      };
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async updatePlayList(
    playlistId: string,
    dto: UpdatePlayListDto,
    lang?: string,
  ) {
    try {
      const { nom } = dto;
      if (!nom || nom.trim() === '') {
        throw new BadRequestException(
          this.i18n.translate('playlist.PLAYLIST_NAME_REQUIRED', { lang }),
        );
      }
      const existingPlayList = await this.prisma.playlist.findFirst({
        where: { id: playlistId },
      });
      if (!existingPlayList) {
        throw new NotFoundException(
          this.i18n.translate('playlist.PLAYLIST_NOT_FOUND', {
            lang,
          }),
        );
      }
      const slug = slugify(nom);
      // Vérifier que le playlist existe
      const existingTag = await this.prisma.playlist.findFirst({
        where: { id: playlistId },
      });
      if (!existingTag) {
        throw new NotFoundException(
          this.i18n.translate('playlist.PLAYLIST_NOT_FOUND', {
            lang,
          }),
        );
      }

      // Mettre à jour le playlist
      const updatedPlayList = await this.prisma.playlist.update({
        where: { id: playlistId },
        data: { nom: nom, slug: slug },
        select: { id: true, nom: true },
      });

      return {
        data: updatedPlayList,
        message: this.i18n.translate('playlist.PLAYLIST_SUCCESSFULLY_UPDATED', {
          lang,
        }),
      };
    } catch (error) {
      console.error(error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async deletePlayList(playlistId: string, lang?: string) {
    try {
      // Vérifier que le playlist existe
      const existingPlayList = await this.prisma.playlist.findFirst({
        where: { id: playlistId },
      });
      if (!existingPlayList) {
        throw new NotFoundException(
          this.i18n.translate('playlist.PLAYLIST_NOT_FOUND', {
            lang,
          }),
        );
      }
      // Supprimer la playlist
      await this.prisma.playlist.delete({ where: { id: playlistId } });
      return {
        message: this.i18n.translate('playlist.SUCCESSFULLY_DELETED_PLAYLIST', {
          lang,
        }),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
