import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAlbumDto } from './dto/create-album.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { I18nService } from 'nestjs-i18n';
import { ALL } from 'dns';
import { UpdateAlbumDto } from './dto/update-album.dto';

@Injectable()
export class AlbumService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async createAlbum(createAlbumDto: CreateAlbumDto, lang?: string) {
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
      } = createAlbumDto;

      if (!releaseId) {
        throw new BadRequestException(
          this.i18n.translate('album.NO_RELEASE_ID_GIVEN', { lang }),
        );
      }

      const existingRelease = await this.prisma.release.findFirst({
        where: { id: releaseId },
      });
      if (!existingRelease) {
        throw new BadRequestException(
          this.i18n.translate('album.RELEASE_NOT_FOUND', { lang }),
        );
      }

      const existingAlbum = await this.prisma.album.findFirst({
        where: { releaseId: releaseId },
      });

      if (existingAlbum) {
        throw new ConflictException(
          this.i18n.translate('album.ALBUM_ALREADY_EXIST', { lang }),
        );
      }

      const createdAlbum = await this.prisma.album.create({
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

      if (!createdAlbum) {
        throw new BadRequestException(
          this.i18n.translate('album.ERROR_CREATED_ALBUM', { lang }),
        );
      }

      return {
        message: this.i18n.translate('album.SUCCESSFULLY_CREATED_ALBUM', {
          lang,
        }),
        data: createdAlbum,
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

  async findAlbums(lang?: string) {
    try {
      const allAlbums = await this.prisma.album.findMany({
        orderBy: {
          id: 'desc',
        },
      });
      return {
        data: allAlbums,
        message: this.i18n.translate('album.SUCCESSFULLY_GET_ALL_ALBUM', {
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

  async findAlbumById(albumId: string, lang?: string) {
    try {
      if (!albumId) {
        throw new BadRequestException(
          this.i18n.translate('album.NO_ALBUM_ID_GIVEN', {
            lang,
          }),
        );
      }
      const album = await this.prisma.album.findFirst({
        where: { id: albumId },
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
      if (!album) {
        throw new NotFoundException(
          this.i18n.translate('album.ALBUM_NOT_FOUND', {
            lang,
          }),
        );
      }

      return {
        data: album,
        message: this.i18n.translate('album.SUCCESSFULLY_GET_ALBUM', { lang }),
      };
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  // async findAlbumsByUserId(userId: string, lang?: string) {
  //   try {
  //     const user = await this.prisma.user.findFirst({
  //       where: { AND: [{ id: userId }, { role: 'artist' }] },
  //     });
  //     if (!user) {
  //       throw new BadRequestException(
  //         this.i18n.translate('album.USER_NOT_FOUND', {
  //           lang,
  //         }),
  //       );
  //     }
  //     const albums = await this.prisma.album.findMany({
  //       where: { userId: userId },
  //       include: {
  //         trackAlbums: {
  //           select: {
  //             trackId: true,
  //             track: true,
  //           },
  //         },
  //       },
  //       orderBy: { id: 'desc' },
  //     });

  //     if (!albums) {
  //       throw new NotFoundException(
  //         this.i18n.translate('album.ALBUM_NOT_FOUND', {
  //           lang,
  //         }),
  //       );
  //     }

  //     // ========== STATS STREAMS POUR TOUS LES ALBUMS ==========

  //     // Récupérer tous les trackIds de tous les albums
  //     const allTrackIds = albums.flatMap((album) =>
  //       album.trackAlbums.map((ta) => ta.trackId),
  //     );

  //     if (allTrackIds.length === 0) {
  //       const albumsWithStats = albums.map((album) => ({
  //         ...album,
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
  //           'album.SUCCESSFULLY_RETRIEVED_ALBUM_FOR_USER',
  //           { lang },
  //         ),
  //         albums: albumsWithStats,
  //       };
  //     }

  //     // 1️⃣ Récupérer tous les streams pour ces tracks

  //     const now = new Date();
  //     const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  //     // 2️⃣ Construire la réponse albums + stats
  //     const albumsWithStats = albums.map(async (album) => {
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
  //         ...album,
  //         streamsCount,
  //         monthlyStreamsCount,
  //         listenersCount,
  //         topLocations,
  //       };
  //     });
  //     return {
  //       message: this.i18n.translate(
  //         'album.SUCCESSFULLY_RETRIEVED_ALBUM_FOR_USER',
  //         { lang },
  //       ),
  //       albums: albumsWithStats,
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

  async updateAlbum(albumId: string, dto: UpdateAlbumDto, lang?: string) {
    try {
      const existingAlbum = this.prisma.album.findFirst({
        where: { id: albumId },
      });
      if (!existingAlbum) {
        throw new NotFoundException(
          this.i18n.translate('album.ALBUM_NOT_FOUND', {
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
      const updatedAlbum = await this.prisma.album.update({
        where: { id: albumId },
        data: updatedData,
      });
      return {
        data: updatedAlbum,
        message: this.i18n.translate('album.ALBUM_SUCCESSFULLY_UPDATED', {
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

  async deleteAlbum(albumId: string, lang?: string) {
    try {
      const album = await this.prisma.album.findFirst({
        where: { id: albumId },
      });
      if (!album) {
        throw new NotFoundException(
          this.i18n.translate('album.ALBUM_NOT_FOUND', {
            lang,
          }),
        );
      }
      await this.prisma.album.delete({ where: { id: albumId } });
      return {
        message: this.i18n.translate('album.SUCCESSFULLY_DELETED_ALBUM', {
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
