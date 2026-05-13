import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { I18nService } from 'nestjs-i18n';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { ROLE } from 'src/types/role';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  // async getArtistsForFan(lang?: string) {
  //   try {
  //     const now = new Date();
  //     const artists = await this.prisma.user.findMany({
  //       where: {
  //         role: 'ARTIST',
  //       },
  //       select: {
  //         id: true,
  //         artistName: true,
  //         username: true,
  //         name: true,
  //         surname: true,
  //         profileImageUrl: true,
  //         videoIntroUrl: true,
  //         bio: true,
  //         country: true,
  //         userTags: {
  //           select: {
  //             tag: {
  //               select: {
  //                 name: true,
  //               },
  //             },
  //           },
  //         },
  //         fanSubscriptions: {
  //           select: {
  //             userId: true,
  //             status: true,
  //             endDate: true,
  //           },
  //         },
  //         plans: {
  //           where: {
  //             active: true,
  //           },
  //           select: {
  //             id: true,
  //           },
  //         },
  //       },
  //     });
  //     const data = artists.map((artist) => {
  //       const distinctSubscribers = new Set(
  //         artist.fanSubscriptions.map((sub) => sub.userId),
  //       );
  //       const activeSubscribers = new Set(
  //         artist.fanSubscriptions
  //           .filter(
  //             (sub) =>
  //               sub.status === 'active' && sub.endDate && sub.endDate > now,
  //           )
  //           .map((sub) => sub.userId),
  //       );
  //       return {
  //         id: artist.id,
  //         artistName: artist.artistName,
  //         username: artist.username,
  //         name: artist.name,
  //         surname: artist.surname,
  //         profileImageUrl: artist.profileImageUrl,
  //         videoIntroUrl: artist.videoIntroUrl,
  //         bio: artist.bio,
  //         country: artist.country,

  //         // équivalent du GROUP_CONCAT
  //         tags: artist.userTags.length
  //           ? [...new Set(artist.userTags.map((ut) => ut.tag.name))].join(', ')
  //           : null,

  //         // équivalent COUNT(DISTINCT subscriptions.userId)
  //         subscribersCount: distinctSubscribers.size,

  //         // équivalent COUNT(DISTINCT CASE WHEN ...)
  //         activeSubscribers: activeSubscribers.size,

  //         // équivalent CASE WHEN COUNT(DISTINCT plans.id) > 0 THEN true ELSE false END
  //         hasActivePlan: artist.plans.length > 0,
  //       };
  //     });

  //     return {
  //       message: this.i18n.translate('user.SUCCESSFULLY_GET_ARTIST_LIST', {
  //         lang,
  //       }),
  //       data,
  //     };
  //   } catch (error) {
  //     console.error('getArtistsForFan error:', error);
  //     throw new InternalServerErrorException('Internal server error');
  //   }
  // }

  async findUserByEmail(email: string, lang?: string) {
    try {
      if (!email) {
        throw new BadRequestException({
          message: this.i18n.translate('user.EMAIL_IS_REQUIRED', {
            lang,
          }),
        });
      }
      const user = await this.prisma.user.findFirst({
        where: { email: email },
        select: {
          id: true,
          name: true,
          surname: true,
          username: true,
          email: true,
          role: true,
          artistName: true,
          genre: true,
          bio: true,
          profileImageUrl: true,
          videoIntroUrl: true,
          miniVideoLoopUrl: true,
          country: true,
          isSubscribed: true,
          emailVerified: true,
          twoFactorEnabled: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!user) {
        throw new NotFoundException({
          message: this.i18n.translate('user.USER_NOT_FOUND', {
            lang,
          }),
        });
      }
      return {
        user: user,
        error: false,
        message: this.i18n.translate('user.SUCCESSFULLY_GET_USER_BY_EMAIL', {
          lang,
        }),
      };
    } catch (error) {
      console.error('get user by email error:', error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async findUserById(userId: string, lang?: string) {
    try {
      if (!userId) {
        throw new BadRequestException({
          message: this.i18n.translate('user.NO_USER_ID_GIVEN', {
            lang,
          }),
        });
      }
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
        },
        select: {
          id: true,
          name: true,
          surname: true,
          username: true,
          email: true,
          role: true,
          artistName: true,
          miniVideoLoopUrl: true,
          country: true,
          genre: true,
          bio: true,
          emailVerified: true,
          twoFactorEnabled: true,
          isSubscribed: true,
          profileImageUrl: true,
          videoIntroUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new NotFoundException({
          message: this.i18n.translate('user.USER_NOT_FOUND', {
            lang,
          }),
        });
      }
      return {
        user: user,
        error: false,
        message: this.i18n.translate('user.SUCCESSFULLY_GET_USER_BY_ID', {
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

  async findUserByRole(role: ROLE, lang?: string) {
    try {
      if (!role) {
        throw new BadRequestException({
          message: this.i18n.translate('user.NO_USER_ID_GIVEN', {
            lang,
          }),
        });
      }
      const user = await this.prisma.user.findMany({
        where: {
          role: role,
        },
        select: {
          id: true,
          name: true,
          surname: true,
          username: true,
          email: true,
          role: true,
          artistName: true,
          miniVideoLoopUrl: true,
          country: true,
          genre: true,
          bio: true,
          emailVerified: true,
          twoFactorEnabled: true,
          isSubscribed: true,
          profileImageUrl: true,
          videoIntroUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (user.length === 0) {
        throw new NotFoundException({
          message: this.i18n.translate('user.USER_NOT_FOUND', {
            lang,
          }),
        });
      }
      return {
        user: user,
        error: false,
        message: this.i18n.translate('user.SUCCESSFULLY_GET_USER_BY_ROLE', {
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

  async findAllUser(lang?: string) {
    try {
      const users = await this.prisma.user.findMany({
        orderBy: {
          id: 'desc',
        },
        select: {
          id: true,
          name: true,
          surname: true,
          email: true,
          username: true,
          profileImageUrl: true,
          role: true,
          isSubscribed: true,
          artistName: true,
          genre: true,
          country: true,
          bio: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        data: users,
        message: this.i18n.translate('user.SUCCESSFULLY_GET_ALL_USER', {
          lang,
        }),
      };
    } catch (error) {
      console.error(error);

      throw new InternalServerErrorException('Internal server error');
    }
  }

  async updateUser(userId: string, body: UpdateUserDto, lang?: string) {
    try {
      if (!userId) {
        throw new BadRequestException({
          message: this.i18n.translate('user.NO_USER_ID_GIVEN', {
            lang,
          }),
        });
      }
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!existingUser) {
        throw new NotFoundException(
          this.i18n.translate('user.USER_NOT_FOUND', {
            lang,
          }),
        );
      }
      const updatedData: Record<string, any> = {};
      if (body.name) updatedData.name = body.name;
      if (body.surname) updatedData.surname = body.surname;
      if (body.username) updatedData.username = body.username;
      if (body.email) updatedData.email = body.email;
      if (body.role) updatedData.role = body.role;
      if (body.artistName) updatedData.artistName = body.artistName;
      if (body.genre) updatedData.genre = body.genre;
      if (body.bio) updatedData.bio = body.bio;
      if (body.profileImageUrl)
        updatedData.profileImageUrl = body.profileImageUrl;
      if (body.videoIntroUrl) updatedData.videoIntroUrl = body.videoIntroUrl;
      if (body.miniVideoLoopUrl)
        updatedData.miniVideoLoopUrl = body.miniVideoLoopUrl;
      if (typeof body.twoFactorEnabled === 'boolean') {
        updatedData.twoFactorEnabled = body.twoFactorEnabled;
      }
      if (typeof body.emailVerified === 'boolean') {
        updatedData.emailVerified = body.emailVerified;
      }
      if (typeof body.isSubscribed === 'boolean') {
        updatedData.isSubscribed = body.isSubscribed;
      }
      if (body.newPassword) {
        const oldPassword = body.oldPassword;
        if (!oldPassword) {
          throw new BadRequestException(
            this.i18n.translate('user.OLD_PASSWORD_REQUIRED', {
              lang,
            }),
          );
        }
        const passwordMatches = await bcrypt.compare(
          oldPassword,
          existingUser.password,
        );
        if (!passwordMatches) {
          throw new ForbiddenException(
            this.i18n.translate('user.OLD_PASSWORD_INCORRECT', {
              lang,
            }),
          );
        }
        const hashedPassword = await bcrypt.hash(body.newPassword, 10);
        updatedData.password = hashedPassword;
      }
      if (Object.keys(updatedData).length === 0) {
        throw new BadRequestException('No valid fields provided for update.');
      }
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: updatedData,
        select: {
          id: true,
          name: true,
          surname: true,
          username: true,
          email: true,
          role: true,
          artistName: true,
          genre: true,
          bio: true,
          profileImageUrl: true,
          videoIntroUrl: true,
          isSubscribed: true,
          emailVerified: true,
          twoFactorEnabled: true,
        },
      });
      return {
        data: updatedUser,
        message: this.i18n.translate('user.USER_SUCCESSFULLY_UPDATED', {
          lang,
        }),
      };
    } catch (error) {
      console.error(error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async deleteUser(userId: string, lang?: string) {
    try {
      if (!userId) {
        throw new BadRequestException({
          message: this.i18n.translate('user.NO_USER_ID_GIVEN', {
            lang,
          }),
        });
      }

      const existingUser = await this.prisma.user.findFirst({
        where: { id: userId },
      });

      if (!existingUser) {
        throw new NotFoundException(
          this.i18n.translate('user.USER_NOT_FOUND', {
            lang,
          }),
        );
      }
      await this.prisma.user.delete({
        where: { id: userId },
      });
      return {
        message: this.i18n.translate('user.USER_SUCCESSFULLY_DELETED', {
          lang,
        }),
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
