import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { CreateEditorPlaylistDto } from './dto/create-editor-playlist.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { slugify } from 'src/utils/slugify';
import { UpdateEditorPlaylistDto } from './dto/update-editor-playlist.dto';

@Injectable()
export class EditorPlaylistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async createEditorPlaylist(dto: CreateEditorPlaylistDto, lang?: string) {
    const slug = slugify(dto.name);
    const existingEditorPlayList = await this.prisma.editorPlaylist.findFirst({
      where: { slug: slug },
    });
    if (existingEditorPlayList) {
      throw new ConflictException(
        this.i18n.translate('editorPlaylist.EDITORPLAYLIST_ALREADY_EXIST', {
          lang,
        }),
      );
    }
    // Vérifie si l'administrateur existe
    const existingUser = await this.prisma.user.findFirst({
      where: { AND: { id: dto.createdByUserId, role: 'ADMIN' } },
    });

    if (!existingUser) {
      throw new BadRequestException(
        this.i18n.translate('editorPlaylist.NO_USER_FOUND', { lang }),
      );
    }
    const createdEditorPlayList = await this.prisma.editorPlaylist.create({
      data: {
        name: dto.name,
        slug: slug,
        createdByUserId: dto.createdByUserId,
        locale: dto.locale,
        isFeatured: dto.isFeatured,
        isPublished: dto.isPublished,
        priority: dto.priority,
        description: dto.description,
        coverImageUrl: dto.coverImageUrl,
        bannerImageUrl: dto.bannerImageUrl,
        targetAudience: dto.targetAudience,
        country: dto.country,
        curationType: dto.curationType,
      },
    });
    if (!createdEditorPlayList) {
      throw new BadRequestException(
        this.i18n.translate('editorPlaylist.ERROR_CREATED_EDITORPLAYLIST', {
          lang,
        }),
      );
    }
    return {
      message: this.i18n.translate(
        'editorPlaylist.SUCCESSFULLY_CREATED_EDITORPLAYLIST',
        {
          lang,
        },
      ),
      data: createdEditorPlayList,
    };
  }

  async findEditorPlayLists(lang?: string) {
    const allEditorPlayLists = await this.prisma.editorPlaylist.findMany({
      orderBy: {
        id: 'desc',
      },
    });
    if (!allEditorPlayLists) {
      throw new NotFoundException(
        this.i18n.translate('editorPlaylist.EDITORPLAYLIST_NOT_FOUND', {
          lang,
        }),
      );
    }
    return {
      data: allEditorPlayLists,
      message: this.i18n.translate(
        'editorPlaylist.SUCCESSFULLY_GET_ALL_EDITORPLAYLIST',
        {
          lang,
        },
      ),
    };
  }

  async findEditorPlayListById(editorPlaylistId: string, lang?: string) {
    try {
      if (!editorPlaylistId) {
        throw new BadRequestException(
          this.i18n.translate('editorPlaylist.NO_EDITORPLAYLIST_ID_GIVEN', {
            lang,
          }),
        );
      }
      const editorPlaylist = await this.prisma.editorPlaylist.findFirst({
        where: { id: editorPlaylistId },
        include: {
          tracks: {
            select: {
              id: true,
              addedBy: {
                select: { id: true, username: true, email: true, role: true },
              },
            },
          },
        },
      });
      if (!editorPlaylist) {
        throw new NotFoundException(
          this.i18n.translate('editorPlaylist.EDITORPLAYLIST_NOT_FOUND', {
            lang,
          }),
        );
      }
      return {
        data: editorPlaylist,
        message: this.i18n.translate(
          'editorPlaylist.SUCCESSFULLY_GET_EDITORPLAYLIST',
          {
            lang,
          },
        ),
      };
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async updateEditorPlayList(
    editorPlaylistId: string,
    dto: UpdateEditorPlaylistDto,
    lang?: string,
  ) {
    try {
      const existingEditorPlayList = await this.prisma.editorPlaylist.findFirst(
        {
          where: { id: editorPlaylistId },
        },
      );
      if (!existingEditorPlayList) {
        throw new NotFoundException(
          this.i18n.translate('editorPlaylist.EDITORPLAYLIST_NOT_FOUND', {
            lang,
          }),
        );
      }
      // Vérifier que le editorPlaylist existe
      const existingTag = await this.prisma.editorPlaylist.findFirst({
        where: { id: editorPlaylistId },
      });
      if (!existingTag) {
        throw new NotFoundException(
          this.i18n.translate('editorPlaylist.EDITORPLAYLIST_NOT_FOUND', {
            lang,
          }),
        );
      }

      const updatedData: Record<string, any> = {};
      if (dto.name) {
        updatedData.name = dto.name;
        updatedData.slug = slugify(dto.name!);
      }
      if (dto.createdByUserId)
        updatedData.createdByUserId = dto.createdByUserId;
      if (dto.locale) updatedData.locale = dto.locale;
      if (dto.isFeatured) updatedData.isFeatured = dto.isFeatured;
      if (dto.isPublished) updatedData.isPublished = dto.isPublished;
      if (dto.priority) updatedData.priority = dto.priority;
      if (dto.description) updatedData.description = dto.description;
      if (dto.coverImageUrl) updatedData.coverImageUrl = dto.coverImageUrl;
      if (dto.bannerImageUrl) updatedData.bannerImageUrl = dto.bannerImageUrl;
      if (dto.targetAudience) updatedData.targetAudience = dto.targetAudience;
      if (dto.country) updatedData.country = dto.country;
      if (dto.curationType) updatedData.curationType = dto.curationType;
      // Mettre à jour le editorPlaylist
      const updatedEditorPlayList = await this.prisma.editorPlaylist.update({
        where: { id: editorPlaylistId },
        data: updatedData,
        select: { id: true, name: true },
      });
      return {
        data: updatedEditorPlayList,
        message: this.i18n.translate(
          'editorPlaylist.EDITORPLAYLIST_SUCCESSFULLY_UPDATED',
          {
            lang,
          },
        ),
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

  async deleteEditorPlayList(editorPlaylistId: string, lang?: string) {
    try {
      // Vérifier que le editorPlaylist existe
      const existingEditorPlayList = await this.prisma.editorPlaylist.findFirst(
        {
          where: { id: editorPlaylistId },
        },
      );
      if (!existingEditorPlayList) {
        throw new NotFoundException(
          this.i18n.translate('editorPlaylist.EDITORPLAYLIST_NOT_FOUND', {
            lang,
          }),
        );
      }
      // Supprimer la editorPlaylist
      await this.prisma.editorPlaylist.delete({
        where: { id: editorPlaylistId },
      });
      return {
        message: this.i18n.translate(
          'editorPlaylist.SUCCESSFULLY_DELETED_EDITORPLAYLIST',
          {
            lang,
          },
        ),
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
