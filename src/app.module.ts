import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './mail/mail.module';
import { UserModule } from './modules/user/user.module';
import {
  I18nModule,
  AcceptLanguageResolver,
  HeaderResolver,
  QueryResolver,
} from 'nestjs-i18n';
import { AlbumModule } from './modules/album/album.module';
import { TrackModule } from './modules/track/track.module';
import { MoodModule } from './modules/mood/mood.module';
import { TagModule } from './modules/tag/tag.module';
import { ReleaseModule } from './modules/release/release.module';
import { SingleModule } from './modules/single/single.module';
import { EpModule } from './modules/ep/ep.module';
import { PlayListModule } from './modules/play-list/play-list.module';
import { EditorPlaylistModule } from './modules/editor-playlist/editor-playlist.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { PaymentModule } from './modules/payment/payment.module';
import { OrderModule } from './modules/order/order.module';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '..', 'i18n'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        { use: HeaderResolver, options: ['x-lang'] },
        AcceptLanguageResolver,
      ],
    }),
    PrismaModule,
    AuthModule,
    AuthModule,
    MailModule,
    UserModule,
    AlbumModule,
    TrackModule,
    MoodModule,
    TagModule,
    ReleaseModule,
    SingleModule,
    EpModule,
    PlayListModule,
    EditorPlaylistModule,
    StripeModule,
    PaymentModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
