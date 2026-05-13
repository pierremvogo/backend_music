import { Global, Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Global()
@Module({
  providers: [
    {
      provide: 'STRIPE_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Stripe(configService.get<string>('STRIPE_SECRET_KEY')!, {
          apiVersion: '2026-04-22.dahlia',
        });
      },
      inject: [ConfigService],
    },
    StripeService,
  ],
  exports: ['STRIPE_CLIENT', StripeService],
})
export class StripeModule {}
