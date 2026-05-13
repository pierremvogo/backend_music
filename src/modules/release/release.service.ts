import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateReleaseDto } from './dto/create-release.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { I18nService } from 'nestjs-i18n';
import { slugify } from 'src/utils/slugify';
import { Console } from 'console';

@Injectable()
export class ReleaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}
  async createRelease(createReleaseDto: CreateReleaseDto, lang?: string) {
    try {
      const {
        title,
        userId,
        releaseDate,
        releaseType,
        format,
        description,
        coverFileName,
        coverUrl,
        label,
        upcCode,
        status,
      } = createReleaseDto;
      // Vérifie si l'artiste existe
      const existingUser = await this.prisma.user.findFirst({
        where: { AND: { id: userId, role: 'ARTIST' } },
      });

      if (!existingUser) {
        throw new BadRequestException(
          this.i18n.translate('release.NO_USER_FOUND', { lang }),
        );
      }
      // Vérifie si une release avec le même titre (insensible à la casse) existe pour cet artiste
      const releaseSlug = slugify(title);
      const existingRelease = await this.prisma.release.findFirst({
        where: { slug: releaseSlug },
      });

      if (existingRelease) {
        throw new ConflictException(
          this.i18n.translate('release.TITLE_RELEASE', { lang }),
        );
      }

      // Création de la nouvelle release
      const createdRelease = await this.prisma.release.create({
        data: {
          title,
          slug: releaseSlug,
          userId,
          coverUrl,
          coverFileName,
          releaseDate,
          releaseType,
          format,
          description,
          label,
          upcCode,
          status,
        },
      });

      if (!createdRelease) {
        throw new BadRequestException(
          this.i18n.translate('release.ERROR_CREATED_RELEASE', { lang }),
        );
      }

      return {
        message: this.i18n.translate('release.SUCCESSFULLY_CREATED_RELEASE', {
          lang,
        }),
        data: createdRelease,
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

  async findReleases(lang?: string) {
    try {
      const allReleases = await this.prisma.release.findMany({
        orderBy: {
          id: 'desc',
        },
      });
      return {
        data: allReleases,
        message: this.i18n.translate('release.SUCCESSFULLY_GET_ALL_RELEASE', {
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

  async findReleaseById(releaseId: string, lang?: string) {
    try {
      if (!releaseId) {
        throw new BadRequestException(
          this.i18n.translate('release.NO_RELEASE_ID_GIVEN', {
            lang,
          }),
        );
      }
      const release = await this.prisma.release.findFirst({
        where: { id: releaseId },
        select: {
          id: true,
          title: true,
          duration: true,
          coverUrl: true,
          releaseDate: true,
          releaseType: true,
          format: true,
          description: true,
          label: true,
          upcCode: true,
          trackReleases: {
            select: {
              trackId: true,
              track: { select: { title: true, lyrics: true, audioUrl: true } },
            },
          },
          releaseTags: {
            select: {
              tag: { select: { name: true } },
            },
          },
        },
      });
      if (!release) {
        throw new NotFoundException(
          this.i18n.translate('release.RELEASE_NOT_FOUND', {
            lang,
          }),
        );
      }
      let releaseWithStats = {};
      const allTrackIds = release.trackReleases.flatMap((ta) => ta.trackId);
      console.log(allTrackIds);
      if (allTrackIds.length === 0) {
        releaseWithStats = {
          ...release,
          streamsCount: 0,
          monthlyStreamsCount: 0,
          listenersCount: 0,
          topLocations: [] as {
            location: string;
            streams: number;
            percentage: string;
          }[],
        };
      }
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const streamsCount = await this.prisma.trackStream.count({
        where: { trackId: { in: allTrackIds } },
      });
      const monthlyStreamsCount = await this.prisma.trackStream.count({
        where: {
          trackId: { in: allTrackIds },
          createdAt: { gte: thirtyDaysAgo, lte: now },
        },
      });

      const uniqueListeners = await this.prisma.trackStream.findMany({
        where: {
          trackId: { in: allTrackIds },
          userId: { not: '' },
        },
        select: {
          userId: true,
        },
        distinct: ['userId'],
      });
      const listenersCount = uniqueListeners.length;

      const locationsRaw = await this.prisma.trackStream.groupBy({
        by: ['country'],
        where: { trackId: { in: allTrackIds } },
        _count: { country: true },
        orderBy: { _count: { country: 'desc' } },
      });
      const totalByLocation = locationsRaw.reduce(
        (sum, item) => sum + item._count.country,
        0,
      );
      const topLocations = locationsRaw.map((item) => ({
        location: item.country ?? 'Unknown',
        streams: item._count.country,
        percentage:
          totalByLocation > 0
            ? `${((item._count.country / totalByLocation) * 100).toFixed(1)}%`
            : '0%',
      }));

      releaseWithStats = {
        ...release,
        streamsCount,
        monthlyStreamsCount,
        listenersCount,
        topLocations,
      };

      return {
        data: releaseWithStats,
        message: this.i18n.translate('release.SUCCESSFULLY_GET_RELEASE', {
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

  async findReleasesByUserId(userId: string, lang?: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { AND: [{ id: userId }, { role: 'ARTIST' }] },
      });
      if (!user) {
        throw new BadRequestException(
          this.i18n.translate('release.USER_NOT_FOUND', {
            lang,
          }),
        );
      }
      const releases = await this.prisma.release.findMany({
        where: { userId: userId },
        select: {
          id: true,
          trackReleases: {
            select: {
              trackId: true,
              track: true,
            },
          },
          releaseTags: {
            select: { tag: { select: { name: true } } },
          },
        },
        orderBy: { id: 'desc' },
      });

      if (releases.length === 0) {
        throw new NotFoundException(
          this.i18n.translate('release.RELEASE_NOT_FOUND', {
            lang,
          }),
        );
      }
      const allTrackIds = releases.flatMap((release) =>
        release.trackReleases.map((ta) => ta.trackId),
      );
      if (allTrackIds.length === 0) {
        const releaseWithStats = releases.map((release) => ({
          ...release,
          streamsCount: 0,
          monthlyStreamsCount: 0,
          listenersCount: 0,
          topLocations: [] as {
            location: string;
            streams: number;
            percentage: string;
          }[],
        }));
        return {
          releases: releaseWithStats,
          message: this.i18n.translate(
            'release.SUCCESSFULLY_RETRIEVED_RELEASE_FOR_USER',
            {
              lang,
            },
          ),
        };
      } else {
        const now = new Date();
        const thirtyDaysAgo = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000,
        );
        const streamsCount = await this.prisma.trackStream.count({
          where: { trackId: { in: allTrackIds } },
        });
        const monthlyStreamsCount = await this.prisma.trackStream.count({
          where: {
            trackId: { in: allTrackIds },
            createdAt: { gte: thirtyDaysAgo, lte: now },
          },
        });
        const uniqueListeners = await this.prisma.trackStream.findMany({
          where: {
            trackId: { in: allTrackIds },
            userId: { not: '' },
          },
          select: {
            userId: true,
          },
          distinct: ['userId'],
        });
        const listenersCount = uniqueListeners.length;

        const locationsRaw = await this.prisma.trackStream.groupBy({
          by: ['country'],
          where: { trackId: { in: allTrackIds } },
          _count: { country: true },
          orderBy: { _count: { country: 'desc' } },
        });
        const totalByLocation = locationsRaw.reduce(
          (sum, item) => sum + item._count.country,
          0,
        );
        const topLocations = locationsRaw.map((item) => ({
          location: item.country ?? 'Unknown',
          streams: item._count.country,
          percentage:
            totalByLocation > 0
              ? `${((item._count.country / totalByLocation) * 100).toFixed(1)}%`
              : '0%',
        }));
        // 2️⃣ Construire la réponse releases + stats
        const releaseWithStats = releases.map((release) => ({
          ...release,
          streamsCount: streamsCount,
          monthlyStreamsCount: monthlyStreamsCount,
          listenersCount: listenersCount,
          topLocations: topLocations,
        }));
        return {
          releases: releaseWithStats,
          message: this.i18n.translate(
            'release.SUCCESSFULLY_RETRIEVED_RELEASE_FOR_USER',
            {
              lang,
            },
          ),
        };
      }
    } catch (error) {
      console.error(error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async updateRelease(releaseId: string, dto: UpdateReleaseDto, lang?: string) {
    try {
      // Vérifie si la release existe
      const existingRelease = await this.prisma.release.findFirst({
        where: { id: releaseId },
      });

      if (!existingRelease) {
        throw new NotFoundException(
          this.i18n.translate('release.RELEASE_NOT_FOUND', {
            lang,
          }),
        );
      }
      const updatedData: Record<string, any> = {};
      if (dto.title) {
        updatedData.title = dto.title;
        updatedData.slug = slugify(dto.title!);
      }
      if (dto.coverUrl) updatedData.coverUrl = dto.coverUrl;
      if (dto.coverFileName) updatedData.coverFileName = dto.coverFileName;
      if (dto.releaseDate) updatedData.releaseDate = dto.releaseDate;
      if (dto.description) updatedData.description = dto.description;
      if (dto.label) updatedData.label = dto.label;
      if (dto.releaseType) updatedData.releaseType = dto.releaseType;
      if (dto.format) updatedData.format = dto.format;
      if (dto.upcCode) updatedData.upcCode = dto.upcCode;
      if (dto.status) updatedData.status = dto.status;

      // Met à jour les champs de la release
      const updatedRelease = await this.prisma.release.update({
        where: { id: releaseId },
        data: updatedData,
      });
      return {
        data: updatedRelease,
        message: this.i18n.translate('release.RELEASE_SUCCESSFULLY_UPDATED', {
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

  async deleteRelease(releaseId: string, lang?: string) {
    try {
      const release = await this.prisma.release.findFirst({
        where: { id: releaseId },
      });
      if (!release) {
        throw new NotFoundException(
          this.i18n.translate('release.RELEASE_NOT_FOUND', {
            lang,
          }),
        );
      }
      await this.prisma.release.delete({ where: { id: releaseId } });
      return {
        message: this.i18n.translate('release.SUCCESSFULLY_DELETED_RELEASE', {
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
      console.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
