import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEpDto } from './dto/create-ep.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { I18nService } from 'nestjs-i18n';
import { ALL } from 'dns';
import { UpdateEpDto } from './dto/update-ep.dto';

@Injectable()
export class EpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async createEp(createEpDto: CreateEpDto, lang?: string) {
    try {
      const {
        authors,
        producers,
        releaseId,
        lyricists,
        musiciansVocals,
        musiciansPianoKeyboards,
        musiciansWinds,
        musiciansPercussion,
        musiciansStrings,
        mixingEngineer,
        masteringEngineer,
      } = createEpDto;

      if (!releaseId) {
        throw new BadRequestException(
          this.i18n.translate('ep.NO_RELEASE_ID_GIVEN', { lang }),
        );
      }

      const existingRelease = await this.prisma.release.findFirst({
        where: { id: releaseId },
      });
      if (!existingRelease) {
        throw new BadRequestException(
          this.i18n.translate('ep.RELEASE_NOT_FOUND', { lang }),
        );
      }

      const existingEp = await this.prisma.ep.findFirst({
        where: { releaseId: releaseId },
      });

      if (existingEp) {
        throw new ConflictException(
          this.i18n.translate('ep.EP_ALREADY_EXIST', { lang }),
        );
      }

      const createdEp = await this.prisma.ep.create({
        data: {
          releaseId: releaseId,
          authors,
          producers,
          lyricists,
          musiciansVocals,
          musiciansPianoKeyboards,
          musiciansWinds,
          musiciansPercussion,
          musiciansStrings,
          mixingEngineer,
          masteringEngineer,
        },
      });

      if (!createdEp) {
        throw new BadRequestException(
          this.i18n.translate('ep.ERROR_CREATED_EP', { lang }),
        );
      }

      return {
        message: this.i18n.translate('ep.SUCCESSFULLY_CREATED_EP', {
          lang,
        }),
        data: createdEp,
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

  async findEps(lang?: string) {
    try {
      const allEps = await this.prisma.ep.findMany({
        orderBy: {
          id: 'desc',
        },
      });
      return {
        data: allEps,
        message: this.i18n.translate('ep.SUCCESSFULLY_GET_ALL_EP', {
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

  async findEpById(epId: string, lang?: string) {
    try {
      if (!epId) {
        throw new BadRequestException(
          this.i18n.translate('ep.NO_EP_ID_GIVEN', {
            lang,
          }),
        );
      }
      const ep = await this.prisma.ep.findFirst({
        where: { id: epId },
        select: {
          id: true,
          authors: true,
          producers: true,
          lyricists: true,
          musiciansVocals: true,
          musiciansPianoKeyboards: true,
          musiciansWinds: true,
          musiciansPercussion: true,
          musiciansStrings: true,
          mixingEngineer: true,
          masteringEngineer: true,
        },
      });
      if (!ep) {
        throw new NotFoundException(
          this.i18n.translate('ep.EP_NOT_FOUND', {
            lang,
          }),
        );
      }

      return {
        data: ep,
        message: this.i18n.translate('ep.SUCCESSFULLY_GET_EP', { lang }),
      };
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async updateEp(epId: string, dto: UpdateEpDto, lang?: string) {
    try {
      const existingEp = this.prisma.ep.findFirst({
        where: { id: epId },
      });
      if (!existingEp) {
        throw new NotFoundException(
          this.i18n.translate('ep.EP_NOT_FOUND', {
            lang,
          }),
        );
      }
      const updatedData: Record<string, any> = {};
      if (dto.authors) updatedData.authors = dto.authors;
      if (dto.producers) updatedData.producers = dto.producers;
      if (dto.lyricists) updatedData.lyricists = dto.lyricists;
      if (dto.musiciansVocals)
        updatedData.musiciansVocals = dto.musiciansVocals;
      if (dto.musiciansPianoKeyboards)
        updatedData.musiciansPianoKeyboards = dto.musiciansPianoKeyboards;
      if (dto.musiciansWinds) updatedData.musiciansWinds = dto.musiciansWinds;
      if (dto.musiciansPercussion)
        updatedData.musiciansPercussion = dto.musiciansPercussion;
      if (dto.musiciansStrings)
        updatedData.musiciansStrings = dto.musiciansStrings;

      if (dto.mixingEngineer) updatedData.mixingEngineer = dto.mixingEngineer;
      if (dto.masteringEngineer)
        updatedData.masteringEngineer = dto.masteringEngineer;

      // Mise à jour dans la base
      const updatedEp = await this.prisma.ep.update({
        where: { id: epId },
        data: updatedData,
      });
      return {
        data: updatedEp,
        message: this.i18n.translate('ep.EP_SUCCESSFULLY_UPDATED', {
          lang,
        }),
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async deleteEp(epId: string, lang?: string) {
    try {
      const ep = await this.prisma.ep.findFirst({
        where: { id: epId },
      });
      if (!ep) {
        throw new NotFoundException(
          this.i18n.translate('ep.EP_NOT_FOUND', {
            lang,
          }),
        );
      }
      await this.prisma.ep.delete({ where: { id: epId } });
      return {
        message: this.i18n.translate('ep.SUCCESSFULLY_DELETED_EP', {
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
