import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { slugify } from 'src/utils/slugify';
import { UpdateTrackDto } from './dto/update-track.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { TrackStreamDto } from './dto/track-stream.dto';
import { EditorPlayListTrackDto } from './dto/editor-playlist-track.dto';

@Injectable()
export class TrackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}
  generateISRC(
    countryCode: string,
    registrantCode: string,
    year: number,
    serialNumber: number,
  ): string {
    const yearPart = String(year).slice(-2);
    const serialPart = String(serialNumber).padStart(5, '0');

    return `${countryCode.toUpperCase()}${registrantCode.toUpperCase()}${yearPart}${serialPart}`;
  }
  getNextSerialNumber(year: number): Promise<number> {
    const startOfYear = new Date(`${year}-01-01T00:00:00Z`);
    const endOfYear = new Date(`${year}-12-31T23:59:59Z`);
    const result = this.prisma.track.count({
      where: {
        createdAt: {
          gte: startOfYear,
          lt: endOfYear,
        },
      },
    });

    return (result[0]?.count ?? 0) + 1;
  }
  async createTrack(dto: CreateTrackDto, lang?: string) {
    try {
      const year = new Date().getFullYear();
      const serial = await this.getNextSerialNumber(year);
      const isrcCode = this.generateISRC('FR', '6V8', year, serial);
      const {
        title,
        userId,
        moodId,
        audioUrl,
        audioFileName,
        duration,
        // 🆕 champs accessibilité /
        lyrics,
        signLanguageVideoUrl,
        signLanguageFileName,
        brailleFileName,
        brailleFileUrl,
      } = dto;

      const trackSlug = slugify(title);

      const existingTitle = await this.prisma.track.findFirst({
        where: {
          slug: trackSlug,
        },
      });
      if (existingTitle) {
        throw new ConflictException(
          this.i18n.translate('track.TRACK_ALREADY_EXIST', { lang }),
        );
      }
      const existingUser = await this.prisma.user.findFirst({
        where: { AND: { id: userId, role: 'ARTIST' } },
      });

      if (!existingUser) {
        throw new BadRequestException(
          this.i18n.translate('release.NO_USER_FOUND', { lang }),
        );
      }
      if (!existingUser) {
        throw new NotFoundException(
          this.i18n.translate('user.USER_NOT_FOUND', {
            lang,
          }),
        );
      }
      const createdTrack = await this.prisma.track.create({
        data: {
          isrcCode,
          title,
          slug: trackSlug,
          userId,
          moodId,
          audioUrl,
          audioFileName,
          duration,
          lyrics,
          signLanguageVideoUrl,
          signLanguageFileName,
          brailleFileUrl,
          brailleFileName,
        },
      });
      if (!createdTrack) {
        throw new BadRequestException(
          this.i18n.translate('track.ERROR_CREATED_TRACK', { lang }),
        );
      }
      return {
        message: this.i18n.translate('track.SUCCESSFULLY_CREATED_TRACK', {
          lang,
        }),
        data: createdTrack,
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

  async addTrackToRelease(releaseId: string, trackId: string, lang?: string) {
    try {
      return this.prisma.$transaction(async (tx) => {
        const track = await tx.track.findFirstOrThrow({
          where: { id: trackId },
          select: { duration: true },
        });
        const [, updatedRelease] = await Promise.all([
          tx.trackRelease.create({
            data: { trackId, releaseId },
          }),
          tx.release.update({
            where: { id: releaseId },
            data: { duration: { increment: track.duration! } },
          }),
        ]);

        return {
          message: this.i18n.translate(
            'track.SUCCESSFULLY_ADDED_TRACK_TO_RELEASE',
            {
              lang,
            },
          ),
          data: updatedRelease,
        };
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          this.i18n.translate('track.TRACK_ALREADY_ASSOCIATED', { lang }),
        );
      }
    }
  }

  async removeTrackToRelease(
    releaseId: string,
    trackId: string,
    lang?: string,
  ) {
    try {
      return this.prisma.$transaction(async (tx) => {
        await tx.track.findFirstOrThrow({
          where: { id: trackId },
          select: { duration: true },
        });

        await tx.release.findFirstOrThrow({
          where: { id: releaseId },
          select: { duration: true },
        });

        const trackRelease = await this.prisma.trackRelease.findFirstOrThrow({
          where: { AND: { trackId: trackId, releaseId: releaseId } },
        });

        await this.prisma.trackRelease.delete({
          where: { id: trackRelease.id },
        });

        return {
          message: this.i18n.translate(
            'track.SUCCESSFULLY_REMOVED_TRACK_TO_RELEASE',
            {
              lang,
            },
          ),
        };
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async removeTrackToPlaylist(
    playlistId: string,
    trackId: string,
    lang?: string,
  ) {
    try {
      return this.prisma.$transaction(async (tx) => {
        await tx.track.findFirstOrThrow({
          where: { id: trackId },
        });

        await tx.playlist.findFirstOrThrow({
          where: { id: playlistId },
        });

        await this.prisma.trackPlayList.deleteMany({
          where: { AND: { trackId: trackId, playlistId: playlistId } },
        });

        return {
          message: this.i18n.translate(
            'track.SUCCESSFULLY_REMOVED_TRACK_TO_PLAYLIST',
            {
              lang,
            },
          ),
        };
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async addTrackToPlayList(playlistId: string, trackId: string, lang?: string) {
    try {
      return this.prisma.$transaction(async (tx) => {
        const existingPlayList = await this.prisma.playlist.findFirst({
          where: { id: playlistId },
        });
        if (!existingPlayList) {
          throw new NotFoundException(
            this.i18n.translate('track.NO_PLAYLIST_FOUND', { lang }),
          );
        }
        await tx.track.findFirstOrThrow({
          where: { id: trackId },
        });

        const trackplaylist = await tx.trackPlayList.create({
          data: { trackId, playlistId },
        });

        return {
          message: this.i18n.translate(
            'track.SUCCESSFULLY_ADDED_TRACK_TO_PLAYLIST',
            {
              lang,
            },
          ),
          data: trackplaylist,
        };
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          this.i18n.translate('track.TRACK_ALREADY_ASSOCIATED', { lang }),
        );
      }
    }
  }

  async addTrackToEditorPlayList(
    editorPlaylistId: string,
    trackId: string,
    dto: EditorPlayListTrackDto,
    lang?: string,
  ) {
    try {
      return this.prisma.$transaction(async (tx) => {
        const existingEditorPlayList =
          await this.prisma.editorPlaylist.findFirst({
            where: { id: editorPlaylistId },
          });
        if (!existingEditorPlayList) {
          throw new NotFoundException(
            this.i18n.translate('track.NO_EDITORPLAYLIST_FOUND', { lang }),
          );
        }
        await tx.track.findFirstOrThrow({
          where: { id: trackId },
        });

        const existingEditor = await this.prisma.user.findFirst({
          where: { AND: { id: dto.addedByEditorId, role: 'EDITOR' } },
        });
        if (!existingEditor) {
          throw new NotFoundException(
            this.i18n.translate('track.NO_EDITOR_FOUND', { lang }),
          );
        }
        const trackEditorPlaylist = await tx.editorPlaylistTrack.create({
          data: {
            trackId,
            editorPlaylistId,
            position: dto.position,
            addedByEditorId: dto.addedByEditorId,
          },
        });

        return {
          message: this.i18n.translate(
            'track.SUCCESSFULLY_ADDED_TRACK_TO_EDITORPLAYLIST',
            {
              lang,
            },
          ),
          data: trackEditorPlaylist,
        };
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          this.i18n.translate('track.TRACK_ALREADY_ASSOCIATED', { lang }),
        );
      }
    }
  }

  async removeTrackToEditorPlaylist(
    edtorPlaylistId: string,
    trackId: string,
    lang?: string,
  ) {
    try {
      return this.prisma.$transaction(async (tx) => {
        await tx.track.findFirstOrThrow({
          where: { id: trackId },
        });

        await tx.editorPlaylist.findFirstOrThrow({
          where: { id: edtorPlaylistId },
        });

        await this.prisma.editorPlaylistTrack.deleteMany({
          where: {
            AND: { trackId: trackId, editorPlaylistId: edtorPlaylistId },
          },
        });

        return {
          message: this.i18n.translate(
            'track.SUCCESSFULLY_REMOVED_TRACK_TO_EDITORPLAYLIST',
            {
              lang,
            },
          ),
        };
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async streamTrack(
    userId: string,
    trackId: string,
    dto: TrackStreamDto,
    lang?: string,
  ) {
    try {
      const existingUser = await this.prisma.user.findFirst({
        where: { AND: { id: userId, role: 'ARTIST' } },
      });

      if (!existingUser) {
        throw new BadRequestException(
          this.i18n.translate('track.NO_USER_FOUND', { lang }),
        );
      }
      const existingTrack = await this.prisma.track.findFirst({
        where: { id: trackId },
      });
      if (!existingTrack) {
        throw new BadRequestException(
          this.i18n.translate('track.TRACK_NOT_FOUND', { lang }),
        );
      }
      const stream = await this.prisma.trackStream.create({
        data: {
          userId,
          trackId,
          ipAddress: dto.ipAddress,
          city: dto.city,
          device: dto.device,
          country: dto.country,
        },
      });

      if (!stream) {
        throw new BadRequestException(
          this.i18n.translate('track.ERROR_CREATED_STREAM', { lang }),
        );
      }
      return {
        message: this.i18n.translate('track.SUCCESSFULLY_CREATED_STREAM', {
          lang,
        }),
        data: stream,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async findTracks(lang?: string) {
    try {
      const allTracks = await this.prisma.track.findMany({
        orderBy: { id: 'desc' },
        select: {
          id: true,
          title: true,
          moodId: true,
          audioUrl: true,
          isrcCode: true,
          duration: true,
          signLanguageVideoUrl: true,
          lyrics: true,
          brailleFileUrl: true,
          userId: true,
          slug: true,
        },
      });

      // if (allTracks.length === 0) {
      //   throw new NotFoundException(
      //     this.i18n.translate('track.TRACK_NOT_FOUND', {
      //       lang,
      //     }),
      //   );
      // }
      return {
        data: allTracks,
        message: this.i18n.translate('track.SUCCESSFULLY_GET_ALL_TRACK', {
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

  async findTrackById(trackId: string, lang?: string) {
    try {
      if (!trackId) {
        throw new BadRequestException(
          this.i18n.translate('track.NO_TRACK_ID_GIVEN', {
            lang,
          }),
        );
      }
      const track = await this.prisma.track.findFirst({
        where: { id: trackId },
      });
      if (!track) {
        throw new NotFoundException(
          this.i18n.translate('track.TRACK_NOT_FOUND', {
            lang,
          }),
        );
      }
      return {
        data: track,
        message: this.i18n.translate('track.SUCCESSFULLY_GET_TRACK', { lang }),
      };
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

  async findTracksByUserId(userId: string, lang?: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { AND: [{ id: userId }, { role: 'ARTIST' }] },
      });
      if (!user) {
        throw new BadRequestException(
          this.i18n.translate('track.TRACK_NOT_FOUND', {
            lang,
          }),
        );
      }
      const tracks = await this.prisma.track.findMany({
        where: { userId: userId },
        orderBy: { id: 'desc' },
      });

      if (!tracks) {
        throw new NotFoundException(
          this.i18n.translate('track.TRACK_NOT_FOUND', {
            lang,
          }),
        );
      }

      return {
        message: this.i18n.translate(
          'track.SUCCESSFULLY_RETRIEVED_TRACKS_FOR_USER',
          { lang },
        ),
        tracks: tracks,
      };
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

  async findTracksByReleaseId(releaseId: string, lang?: string) {
    try {
      if (!releaseId) {
        throw new BadRequestException(
          this.i18n.translate('track.NO_RELEASE_ID_GIVEN', { lang }),
        );
      }
      const release = await this.prisma.release.findFirst({
        where: { id: releaseId },
      });

      if (!release) {
        throw new NotFoundException(
          this.i18n.translate('track.RELEASE_NOT_FOUND', { lang }),
        );
      }
      const tracksOnRelease = await this.prisma.trackRelease.findMany({
        where: { releaseId: releaseId },
        select: { track: true },
        orderBy: { trackId: 'desc' },
      });
      if (tracksOnRelease.length === 0) {
        throw new NotFoundException(
          this.i18n.translate('track.NO_TRACK_FOUND_FOR_RELEASE', { lang }),
        );
      }
      return {
        message: this.i18n.translate(
          'track.SUCCESSFULLY_GET_TRACKS_FOR_RELEASE',
          { lang },
        ),
        tracks: tracksOnRelease,
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

  async findTracksByPlaylistId(playlistId: string, lang?: string) {
    try {
      if (!playlistId) {
        throw new BadRequestException(
          this.i18n.translate('track.NO_RELEASE_ID_GIVEN', { lang }),
        );
      }
      const playlist = await this.prisma.playlist.findFirst({
        where: { id: playlistId },
      });

      if (!playlist) {
        throw new NotFoundException(
          this.i18n.translate('track.PLAYLIST_NOT_FOUND', { lang }),
        );
      }
      const tracksOnPlaylist = await this.prisma.trackPlayList.findMany({
        where: { playlistId: playlistId },
        select: { track: true },
        orderBy: { trackId: 'desc' },
      });
      if (tracksOnPlaylist.length === 0) {
        throw new NotFoundException(
          this.i18n.translate('track.TRACK_NOT_FOUND', { lang }),
        );
      }
      return {
        message: this.i18n.translate(
          'track.SUCCESSFULLY_GET_TRACKS_FOR_PLAYLIST',
          { lang },
        ),
        tracks: tracksOnPlaylist,
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

  async updateTrack(trackId: string, dto: UpdateTrackDto, lang?: string) {
    try {
      const existingTrack = await this.prisma.track.findFirst({
        where: { id: trackId },
      });
      if (!existingTrack) {
        throw new NotFoundException(
          this.i18n.translate('track.TRACK_NOT_FOUND', {
            lang,
          }),
        );
      }
      const updatedData: Record<string, any> = {};
      if (dto.title) {
        updatedData.title = dto.title;
        updatedData.slug = slugify(dto.title!);
      }
      if (dto.duration) updatedData.duration = dto.duration;
      if (dto.audioUrl) updatedData.audioUrl = dto.audioUrl;
      // 🆕 champs crédits
      if (dto.lyrics) updatedData.lyrics = dto.lyrics;
      if (dto.signLanguageVideoUrl)
        updatedData.signLanguageVideoUrl = dto.signLanguageVideoUrl;
      if (dto.brailleFileUrl) updatedData.brailleFileUrl = dto.brailleFileUrl;
      if (dto.moodId) updatedData.moodId = dto.moodId;
      if (dto.userId) updatedData.userId = dto.userId;
      const updatedTrack = await this.prisma.track.update({
        where: { id: trackId },
        data: updatedData,
      });
      return {
        data: updatedTrack,
        message: this.i18n.translate('track.TRACK_SUCCESSFULLY_UPDATED', {
          lang,
        }),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async deleteTrack(trackId: string, lang?: string) {
    try {
      const existingTrack = await this.prisma.track.findFirst({
        where: { id: trackId },
      });
      if (!existingTrack) {
        throw new NotFoundException(
          this.i18n.translate('track.TRACK_NOT_FOUND', {
            lang,
          }),
        );
      }
      await this.prisma.track.delete({ where: { id: trackId } });
      return {
        message: this.i18n.translate('track.SUCCESSFULLY_DELETED_TRACK', {
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

  async findTopStreamedTracks(limit?: number, lang?: string) {
    try {
      const limits = limit ?? 6;
      // 1) On récupère les IDs des tracks les plus streamées
      const topStreamed = await this.prisma.trackStream.groupBy({
        by: ['trackId'],
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: limits,
      });
      const trackIds = topStreamed.map((item) => item.trackId);
      // Si aucune track streamée n'existe
      if (trackIds.length === 0) {
        return {
          tracks: [],
          message: this.i18n.translate(
            'track.SUCCESSFULLY_GET_TOP_TRACK_STREAM',
            {
              lang,
            },
          ),
        };
      }
      // 2) On récupère les détails complets des tracks
      const tracks = await this.prisma.track.findMany({
        where: {
          id: {
            in: trackIds,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          trackReleases: {
            include: {
              release: {
                select: {
                  id: true,
                  title: true,
                  coverUrl: true,
                  releaseType: true,
                },
              },
            },
          },
        },
      });
      // 3) On reformate la réponse pour ressembler à ton ancien output
      const formattedTracks = trackIds
        .map((trackId) => {
          const track = tracks.find((t) => t.id === trackId);
          const streamInfo = topStreamed.find((s) => s.trackId === trackId);
          if (!track) return null;
          const release = track.trackReleases[0]?.release ?? null;

          let collectionTitle: string | null = null;
          let coverUrl: string | null = null;
          let collectionId: string | null = null;
          let collectionType: string | null = null;
          if (release) {
            collectionTitle = release.title;
            coverUrl = release.coverUrl;
            collectionId = release.id;
            collectionType = release.releaseType;
          }
          return {
            id: track.id,
            title: track.title,
            audioUrl: track.audioUrl,
            duration: track.duration,
            lyrics: track.lyrics,
            signLanguageVideoUrl: track.signLanguageVideoUrl,
            brailleFileUrl: track.brailleFileUrl,
            userId: track.userId,

            streamsCount: streamInfo?._count.id ?? 0,
            artistName: track.user?.name ?? null,

            collectionTitle,
            coverUrl,
            collectionId,
            collectionType,
          };
        })
        .filter(Boolean);
      return {
        tracks: formattedTracks,
        message: this.i18n.translate(
          'track.SUCCESSFULLY_GET_TOP_TRACK_STREAM',
          {
            lang,
          },
        ),
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

  async findTracksByMoodId(moodId: string, lang?: string) {
    try {
      const existingMood = await this.prisma.mood.findFirst({
        where: { id: moodId },
      });
      if (!existingMood) {
        throw new NotFoundException(
          this.i18n.translate('track.MOOD_NOT_FOUND', {
            lang,
          }),
        );
      }
      const tracks = await this.prisma.track.findMany({
        where: { moodId: moodId },
        select: {
          id: true,
          title: true,
          moodId: true,
          audioUrl: true,
          isrcCode: true,
          duration: true,
          signLanguageVideoUrl: true,
          lyrics: true,
          brailleFileUrl: true,
          userId: true,
          slug: true,
        },
      });
      return {
        tracks: tracks,
        message: this.i18n.translate(
          'track.SUCCESSFULLY_RETRIEVED_TRACKS_BY_MOOD',
          {
            lang,
          },
        ),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
