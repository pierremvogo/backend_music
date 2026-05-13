import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { slugify } from 'src/utils/slugify';
import { PrismaService } from 'src/prisma/prisma.service';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class TagService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}
  async createTag(dto: CreateTagDto, lang?: string) {
    try {
      const tagSlug = slugify(dto.name);
      const existingTag = await this.prisma.tag.findFirst({
        where: { slug: tagSlug },
      });
      if (existingTag) {
        throw new ConflictException(
          this.i18n.translate('tag.TAG_ALREADY_EXIST', { lang }),
        );
      }
      const createdTag = await this.prisma.tag.create({
        data: { name: dto.name, slug: tagSlug },
      });
      if (!createdTag) {
        throw new BadRequestException(
          this.i18n.translate('tag.ERROR_CREATED_TAG', { lang }),
        );
      }
      return {
        message: this.i18n.translate('tag.SUCCESSFULLY_CREATED_TAG', {
          lang,
        }),
        data: createdTag,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      console.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async findTags(lang?: string) {
    try {
      const allTags = await this.prisma.tag.findMany({
        orderBy: {
          id: 'desc',
        },
      });
      if (!allTags) {
        throw new NotFoundException(
          this.i18n.translate('tag.TAG_NOT_FOUND', {
            lang,
          }),
        );
      }
      return {
        data: allTags,
        message: this.i18n.translate('tag.SUCCESSFULLY_GET_ALL_TAG', {
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

  async findTagById(tagId: string, lang?: string) {
    try {
      if (!tagId) {
        throw new BadRequestException(
          this.i18n.translate('tag.NO_TAG_ID_GIVEN', {
            lang,
          }),
        );
      }
      const tag = await this.prisma.tag.findFirst({
        where: { id: tagId },
        select: {
          trackTags: {
            select: {
              track: true,
            },
          },
        },
      });
      if (!tag) {
        throw new NotFoundException(
          this.i18n.translate('tag.TAG_NOT_FOUND', {
            lang,
          }),
        );
      }
      return {
        data: tag,
        message: this.i18n.translate('tag.SUCCESSFULLY_GET_TAG', { lang }),
      };
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async updateTag(tagId: string, dto: UpdateTagDto, lang?: string) {
    try {
      const { name } = dto;

      if (!name || name.trim() === '') {
        throw new BadRequestException(
          this.i18n.translate('tag.TAG_NAME_REQUIRED', { lang }),
        );
      }
      // Génère un nouveau slug à partir du nouveau nom
      const slug = slugify(name);
      // Vérifier que le tag existe
      const existingTag = await this.prisma.tag.findFirst({
        where: { id: tagId },
      });
      if (!existingTag) {
        throw new NotFoundException(
          this.i18n.translate('tag.TAG_NOT_FOUND', {
            lang,
          }),
        );
      }
      // Mettre à jour le tag
      const updatedTag = await this.prisma.tag.update({
        where: { id: tagId },
        data: { name: name, slug: slug },
        select: { id: true, name: true },
      });

      return {
        data: updatedTag,
        message: this.i18n.translate('tag.TAG_SUCCESSFULLY_UPDATED', {
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

  async deleteTag(tagId: string, lang?: string) {
    try {
      // Vérifier que le tag existe
      const existingTag = await this.prisma.tag.findFirst({
        where: { id: tagId },
      });
      if (!existingTag) {
        throw new NotFoundException(
          this.i18n.translate('tag.TAG_NOT_FOUND', {
            lang,
          }),
        );
      }
      // Supprimer le tag
      await this.prisma.tag.delete({ where: { id: tagId } });
      return {
        message: this.i18n.translate('tag.SUCCESSFULLY_DELETED_TAG', {
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
