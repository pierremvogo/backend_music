import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { StripeService } from './stripe.service';
import { I18nLang } from 'nestjs-i18n';

class CheckoutItemDto {
  name!: string;
  price!: number;
  quantity!: number;
}

class CreateCheckoutSessionDto {
  userId!: string;
  items!: CheckoutItemDto[];
  metadata?: Record<string, string>;
}

class CreateSubscriptionSessionDto {
  userId!: string;
  priceId!: string;
  customerEmail!: string;
}

class RefundDto {
  paymentIntentId!: string;
  amount?: number;
}

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Créer une session Stripe Checkout' })
  @ApiBody({ type: CreateCheckoutSessionDto })
  @ApiResponse({
    status: 201,
    description: 'Session Checkout créée avec succès',
  })
  async createCheckoutSession(
    @Body() body: CreateCheckoutSessionDto,
    @I18nLang() lang: string,
  ) {
    return this.stripeService.createCheckoutSession(body, lang);
  }

  @Post('subscription')
  @ApiOperation({ summary: 'Créer une session Checkout pour abonnement' })
  @ApiBody({ type: CreateSubscriptionSessionDto })
  @ApiResponse({
    status: 201,
    description: 'Session abonnement créée avec succès',
  })
  async createSubscriptionSession(@Body() body: CreateSubscriptionSessionDto) {
    return this.stripeService.createSubscriptionSession(body);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Récupérer une session Checkout Stripe' })
  @ApiParam({
    name: 'sessionId',
    description: 'ID de la session Checkout Stripe',
  })
  @ApiResponse({
    status: 200,
    description: 'Session récupérée avec succès',
  })
  async getSession(@Param('sessionId') sessionId: string) {
    return this.stripeService.getSession(sessionId);
  }

  @Post('refund')
  @ApiOperation({ summary: 'Rembourser un paiement Stripe' })
  @ApiBody({ type: RefundDto })
  @ApiResponse({
    status: 201,
    description: 'Remboursement créé avec succès',
  })
  async refund(@Body() body: RefundDto) {
    return this.stripeService.refund(body.paymentIntentId, body.amount);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recevoir et vérifier les webhooks Stripe' })
  @ApiResponse({
    status: 200,
    description: 'Webhook reçu et vérifié',
  })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const event = this.stripeService.constructWebhookEvent(
      req.rawBody!,
      signature,
    );

    return {
      received: true,
      type: event.type,
    };
  }
}
