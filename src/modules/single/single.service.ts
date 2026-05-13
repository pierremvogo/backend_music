import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSingleDto } from './dto/create-single.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { I18nService } from 'nestjs-i18n';
import { ALL } from 'dns';
import { UpdateSingleDto } from './dto/update-single.dto';

@Injectable()
export class SingleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async createSingle(createSingleDto: CreateSingleDto, lang?: string) {
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
      } = createSingleDto;

      if (!releaseId) {
        throw new BadRequestException(
          this.i18n.translate('single.NO_RELEASE_ID_GIVEN', { lang }),
        );
      }

      const existingRelease = await this.prisma.release.findFirst({
        where: { id: releaseId },
      });
      if (!existingRelease) {
        throw new BadRequestException(
          this.i18n.translate('single.RELEASE_NOT_FOUND', { lang }),
        );
      }

      const existingSingle = await this.prisma.single.findFirst({
        where: { releaseId: releaseId },
      });

      if (existingSingle) {
        throw new ConflictException(
          this.i18n.translate('single.SINGLE_ALREADY_EXIST', { lang }),
        );
      }

      const createdSingle = await this.prisma.single.create({
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

      if (!createdSingle) {
        throw new BadRequestException(
          this.i18n.translate('single.ERROR_CREATED_SINGLE', { lang }),
        );
      }

      return {
        message: this.i18n.translate('single.SUCCESSFULLY_CREATED_SINGLE', {
          lang,
        }),
        data: createdSingle,
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

  async findSingles(lang?: string) {
    try {
      const allSingles = await this.prisma.single.findMany({
        orderBy: {
          id: 'desc',
        },
      });
      return {
        data: allSingles,
        message: this.i18n.translate('single.SUCCESSFULLY_GET_ALL_SINGLE', {
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

  async findSingleById(singleId: string, lang?: string) {
    try {
      if (!singleId) {
        throw new BadRequestException(
          this.i18n.translate('single.NO_SINGLE_ID_GIVEN', {
            lang,
          }),
        );
      }
      const single = await this.prisma.single.findFirst({
        where: { id: singleId },
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
      if (!single) {
        throw new NotFoundException(
          this.i18n.translate('single.SINGLE_NOT_FOUND', {
            lang,
          }),
        );
      }

      return {
        data: single,
        message: this.i18n.translate('single.SUCCESSFULLY_GET_SINGLE', {
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

  // async findSinglesByUserId(userId: string, lang?: string) {
  //   try {
  //     const user = await this.prisma.user.findFirst({
  //       where: { AND: [{ id: userId }, { type: 'artist' }] },
  //     });
  //     if (!user) {
  //       throw new BadRequestException(
  //         this.i18n.translate('single.USER_NOT_FOUND', {
  //           lang,
  //         }),
  //       );
  //     }
  //     const singles = await this.prisma.single.findMany({
  //       where: { userId: userId },
  //       include: {
  //         trackSingles: {
  //           select: {
  //             trackId: true,
  //             track: true,
  //           },
  //         },
  //       },
  //       orderBy: { id: 'desc' },
  //     });

  //     if (!singles) {
  //       throw new NotFoundException(
  //         this.i18n.translate('single.SINGLE_NOT_FOUND', {
  //           lang,
  //         }),
  //       );
  //     }

  //     // ========== STATS STREAMS POUR TOUS LES SINGLES ==========

  //     // Récupérer tous les trackIds de tous les singles
  //     const allTrackIds = singles.flatMap((single) =>
  //       single.trackSingles.map((ta) => ta.trackId),
  //     );

  //     if (allTrackIds.length === 0) {
  //       const singlesWithStats = singles.map((single) => ({
  //         ...single,
  //         streamsCount: 0,
  //         monthlyStreamsCount: 0,
  //         listenersCount: 0,
  //         topLocations: [] as {
  //           location: string;
  //           streams: number;
  //           percentage: string;
  //         }[],
  //       }));

  //       return {
  //         message: this.i18n.translate(
  //           'single.SUCCESSFULLY_RETRIEVED_SINGLE_FOR_USER',
  //           { lang },
  //         ),
  //         singles: singlesWithStats,
  //       };
  //     }

  //     // 1️⃣ Récupérer tous les streams pour ces tracks

  //     const now = new Date();
  //     const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  //     // 2️⃣ Construire la réponse singles + stats
  //     const singlesWithStats = singles.map(async (single) => {
  //       const [streamsCount, monthlyStreamsCount] = await Promise.all([
  //         this.prisma.trackStream.count({
  //           where: { trackId: { in: allTrackIds } },
  //         }),
  //         this.prisma.trackStream.count({
  //           where: {
  //             trackId: { in: allTrackIds },
  //             createdAt: { gte: thirtyDaysAgo, lte: now },
  //           },
  //         }),
  //       ]);
  //       const uniqueListeners = await this.prisma.trackStream.findMany({
  //         where: {
  //           trackId: { in: allTrackIds },
  //           userId: { not: '' },
  //         },
  //         select: {
  //           userId: true,
  //         },
  //         distinct: ['userId'],
  //       });
  //       const listenersCount = uniqueListeners.length;

  //       const locationsRaw = await this.prisma.trackStream.groupBy({
  //         by: ['country'],
  //         where: { trackId: { in: allTrackIds } },
  //         _count: { country: true },
  //         orderBy: { _count: { country: 'desc' } },
  //       });
  //       const totalByLocation = locationsRaw.reduce(
  //         (sum, item) => sum + item._count.country,
  //         0,
  //       );
  //       const topLocations = locationsRaw.map((item) => ({
  //         location: item.country ?? 'Unknown',
  //         streams: item._count.country,
  //         percentage:
  //           totalByLocation > 0
  //             ? `${((item._count.country / totalByLocation) * 100).toFixed(1)}%`
  //             : '0%',
  //       }));

  //       return {
  //         ...single,
  //         streamsCount,
  //         monthlyStreamsCount,
  //         listenersCount,
  //         topLocations,
  //       };
  //     });
  //     return {
  //       message: this.i18n.translate(
  //         'single.SUCCESSFULLY_RETRIEVED_SINGLE_FOR_USER',
  //         { lang },
  //       ),
  //       singles: singlesWithStats,
  //     };
  //   } catch (error) {
  //     console.error(error);
  //     if (
  //       error instanceof NotFoundException ||
  //       error instanceof BadRequestException
  //     ) {
  //       throw error;
  //     }
  //     throw new InternalServerErrorException('Internal server error');
  //   }
  // }

  async updateSingle(singleId: string, dto: UpdateSingleDto, lang?: string) {
    try {
      const existingSingle = this.prisma.single.findFirst({
        where: { id: singleId },
      });
      if (!existingSingle) {
        throw new NotFoundException(
          this.i18n.translate('single.SINGLE_NOT_FOUND', {
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
      const updatedSingle = await this.prisma.single.update({
        where: { id: singleId },
        data: updatedData,
      });
      return {
        data: updatedSingle,
        message: this.i18n.translate('single.SINGLE_SUCCESSFULLY_UPDATED', {
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

  async deleteSingle(singleId: string, lang?: string) {
    try {
      const single = await this.prisma.single.findFirst({
        where: { id: singleId },
      });
      if (!single) {
        throw new NotFoundException(
          this.i18n.translate('single.SINGLE_NOT_FOUND', {
            lang,
          }),
        );
      }
      await this.prisma.single.delete({ where: { id: singleId } });
      return {
        message: this.i18n.translate('single.SUCCESSFULLY_DELETED_SINGLE', {
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
