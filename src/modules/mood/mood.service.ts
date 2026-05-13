import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { MoodDto } from './dto/mood.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { slugify } from 'src/utils/slugify';

@Injectable()
export class MoodService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async createMood(dto: MoodDto, lang?: string) {
    const slug = slugify(dto.name);
    const existingMood = await this.prisma.mood.findFirst({
      where: { slug: slug },
    });
    if (existingMood) {
      throw new ConflictException(
        this.i18n.translate('mood.MOOD_ALREADY_EXIST', { lang }),
      );
    }
    const createdMood = await this.prisma.mood.create({
      data: {
        name: dto.name,
      },
    });
    if (!createdMood) {
      throw new BadRequestException(
        this.i18n.translate('mood.ERROR_CREATED_MOOD', { lang }),
      );
    }
    return {
      message: this.i18n.translate('mood.SUCCESSFULLY_CREATED_MOOD', {
        lang,
      }),
      data: createdMood,
    };
  }

  async findMoods(lang?: string) {
    const allMoods = await this.prisma.mood.findMany({
      orderBy: {
        id: 'desc',
      },
    });
    if (!allMoods) {
      throw new NotFoundException(
        this.i18n.translate('mood.MOOD_NOT_FOUND', {
          lang,
        }),
      );
    }
    return {
      data: allMoods,
      message: this.i18n.translate('mood.SUCCESSFULLY_GET_ALL_MOOD', {
        lang,
      }),
    };
  }

  async findMoodById(moodId: string, lang?: string) {
    try {
      if (!moodId) {
        throw new BadRequestException(
          this.i18n.translate('mood.NO_MOOD_ID_GIVEN', {
            lang,
          }),
        );
      }
      const mood = await this.prisma.mood.findFirst({
        where: { id: moodId },
      });
      if (!mood) {
        throw new NotFoundException(
          this.i18n.translate('mood.MOOD_NOT_FOUND', {
            lang,
          }),
        );
      }
      return {
        data: mood,
        message: this.i18n.translate('mood.SUCCESSFULLY_GET_MOOD', { lang }),
      };
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async updateMood(moodId: string, dto: MoodDto, lang?: string) {
    try {
      const { name } = dto;
      if (!name || name.trim() === '') {
        throw new BadRequestException(
          this.i18n.translate('mood.MOOD_NAME_REQUIRED', { lang }),
        );
      }
      const existingMood = await this.prisma.mood.findFirst({
        where: { id: moodId },
      });
      if (!existingMood) {
        throw new NotFoundException(
          this.i18n.translate('mood.MOOD_NOT_FOUND', {
            lang,
          }),
        );
      }
      const slug = slugify(name);
      // Vérifier que le mood existe
      const existingTag = await this.prisma.mood.findFirst({
        where: { id: moodId },
      });
      if (!existingTag) {
        throw new NotFoundException(
          this.i18n.translate('mood.MOOD_NOT_FOUND', {
            lang,
          }),
        );
      }
      // Mettre à jour le mood
      const updatedMood = await this.prisma.mood.update({
        where: { id: moodId },
        data: { name: name, slug: slug },
        select: { id: true, name: true },
      });

      return {
        data: updatedMood,
        message: this.i18n.translate('mood.MOOD_SUCCESSFULLY_UPDATED', {
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

  async deleteMood(moodId: string, lang?: string) {
    try {
      // Vérifier que le mood existe
      const existingMood = await this.prisma.mood.findFirst({
        where: { id: moodId },
      });
      if (!existingMood) {
        throw new NotFoundException(
          this.i18n.translate('mood.MOOD_NOT_FOUND', {
            lang,
          }),
        );
      }
      // Supprimer le mood
      await this.prisma.mood.delete({ where: { id: moodId } });
      return {
        message: this.i18n.translate('mood.SUCCESSFULLY_DELETED_MOOD', {
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
