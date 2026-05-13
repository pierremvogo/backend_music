import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { I18nService } from 'nestjs-i18n';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService,
  ) {}

  private generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async register(dto: RegisterDto, lang?: string) {
    if (!dto) {
      throw new BadRequestException(
        this.i18n.translate('auth.USER_DATA_EMPTY', {
          lang,
        }),
      );
    }
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });
    if (existingUser?.email === dto.email) {
      throw new ConflictException(
        this.i18n.translate('auth.EMAIL_ALREADY_USE', {
          lang,
        }),
      );
    }
    if (existingUser?.username === dto.username) {
      throw new ConflictException(
        this.i18n.translate('auth.USERNAME_ALREADY_USE', { lang }),
      );
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const emailToken = crypto.randomInt(1000, 10000).toString();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

    const tagIds = Array.isArray(dto.tagIds)
      ? [...new Set(dto.tagIds.map((x) => String(x)))]
      : [];
    try {
      const createdUser = await this.prisma.$transaction(async (tx) => {
        const userData: Prisma.UserCreateInput = {
          name: dto.name,
          surname: dto.surname,
          username: dto.username,
          email: dto.email,
          password: hashedPassword,
          role: dto.role,

          artistName: dto.artistName,
          genre: dto.genre,

          bio: dto.bio,
          country: dto.country,
          profileImageUrl: dto.profileImageUrl,
          videoIntroUrl: dto.videoIntroUrl,
          miniVideoLoopUrl: dto.miniVideoLoopUrl,
          videoIntroFileName: dto.videoIntroFileName,
          miniVideoLoopFileName: dto.miniVideoLoopFileName,
          profileImageFileName: dto.profileImageFileName,

          twoFactorEnabled: dto.twoFactorEnabled ?? false,
          emailVerificationToken: emailToken,
          emailVerified: false,
          emailTokenExpiresAt: expiresAt,
          isSubscribed: dto.isSubscribed ?? false,
        };
        if (dto.role === 'ARTIST' && tagIds.length > 0) {
          const existingTags = await tx.tag.findMany({
            where: {
              id: { in: tagIds },
            },
            select: { id: true },
          });
          const existingTagIds = new Set(existingTags.map((t) => t.id));
          const validTagIds = tagIds.filter((id) => existingTagIds.has(id));
          if (validTagIds.length === 0) {
            throw new BadRequestException(
              this.i18n.translate('auth.NO_VALID_TAG', { lang }),
            );
          }
          userData.userTags = {
            create: validTagIds.map((tagId) => ({
              tag: {
                connect: { id: tagId },
              },
            })),
          };
        }
        const user = await tx.user.create({
          data: userData,
          select: {
            id: true,
            name: true,
            surname: true,
            username: true,
            email: true,
            role: true,
            artistName: true,
            createdAt: true,
            userTags: {
              select: {
                tagId: true,
              },
            },
          },
        });
        return user;
      });
      await this.mailService.sendEmail(
        dto.email,
        emailToken,
        'verify-email',
        lang!,
      );
      return {
        data: createdUser,
        message: this.i18n.translate('auth.USER_CREATED_SUCCESSFULLY', {
          lang,
        }),
      };
    } catch (error: any) {
      throw new InternalServerErrorException(
        error?.message ?? 'Error while creating user',
      );
    }
  }

  async verifyEmail(
    token: string,
    lang?: string,
  ): Promise<{ message: string }> {
    if (!token) {
      throw new BadRequestException({
        message: this.i18n.translate('auth.MISSING_VERIFICATION_TOKEN', {
          lang,
        }),
      });
    }
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailTokenExpiresAt: {
          gt: new Date(),
        },
      },
    });
    if (!user) {
      throw new BadRequestException({
        message: this.i18n.translate('auth.INVALID_OR_EXPIRED_TOKEN', { lang }),
      });
    }
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailTokenExpiresAt: null,
      },
    });
    return {
      message: this.i18n.translate('auth.EMAIL_VERIFIED_SUCCESSFULLY', {
        lang,
      }),
    };
  }

  async login(dto: LoginDto, lang?: string) {
    if (!dto?.email || dto.email.trim() === '') {
      throw new BadRequestException(
        this.i18n.translate('auth.NO_USER_EMAIL_GIVEN', {
          lang,
        }),
      );
    }
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
      select: {
        id: true,
        name: true,
        surname: true,
        username: true,
        email: true,
        role: true,
        password: true,
        country: true,
        emailVerified: true,
        profileImageUrl: true,
      },
    });
    const errorLogin = this.i18n.translate(
      'auth.EMAIL_AND_PASSWORD_NOT_MATCH',
      {
        lang,
      },
    );
    if (!user) {
      throw new BadRequestException(errorLogin);
    }

    const passwordsMatch = await bcrypt.compare(dto.password, user.password);

    if (!passwordsMatch) {
      throw new BadRequestException(errorLogin);
    }
    if (!user.emailVerified) {
      throw new ForbiddenException(
        this.i18n.translate('auth.EMAIL_NOT_VERIFIED', {
          lang,
        }),
      );
    }
    try {
      const token = await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
      });

      const { password, ...safeUser } = user;

      return {
        user: safeUser,
        token: token,
        error: false,
        message: this.i18n.translate('auth.AUTHENTICATED_SUCCESS', {
          lang,
        }),
      };
    } catch (err: any) {
      throw new InternalServerErrorException(
        err?.message ?? 'Error while logging in',
      );
    }
  }

  async forgotPassword(
    dto: ForgotPasswordDto,
    lang?: string,
  ): Promise<{ message: string }> {
    if (!dto.email) {
      throw new BadRequestException({
        message: this.i18n.translate('auth.EMAIL_IS_REQUIRED', {
          lang,
        }),
      });
    }
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new NotFoundException({
        message: this.i18n.translate('auth.USER_NOT_FOUND', {
          lang,
        }),
      });
    }
    const rawToken = this.generateResetToken();
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: expiresAt,
      },
    });
    await this.mailService.sendEmail(
      user.email,
      rawToken,
      'reset-password',
      lang!,
    );
    return {
      message: this.i18n.translate('auth.RESET_EMAIL_SENT', {
        lang,
      }),
    };
  }

  async resetPassword(token: string, dto: ResetPasswordDto, lang?: string) {
    const tokenHash = this.hashToken(token);

    if (!tokenHash || !dto.newPassword) {
      throw new BadRequestException({
        message: this.i18n.translate('auth.TOKEN_AND_PASSWORD_REQUIRED', {
          lang,
        }),
      });
    }
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: {
          gt: new Date(),
        },
      },
    });
    if (!user) {
      throw new BadRequestException({
        message: this.i18n.translate('auth.INVALID_OR_EXPIRED_TOKEN', {
          lang,
        }),
      });
    }
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        passwordResetTokenHash: null,
      },
    });
    return {
      message: this.i18n.translate('auth.PASSWORD_RESET_SUCCESS', {
        lang,
      }),
    };
  }
}
