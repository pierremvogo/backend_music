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
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { PaymentService } from './payment.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { I18nLang } from 'nestjs-i18n';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('checkout/:userId')
  @ApiOperation({ summary: 'Initier un paiement Stripe Checkout' })
  @ApiParam({
    name: 'userId',
    description: 'ID de l’utilisateur qui initie le paiement',
    example: 'user_123',
  })
  @ApiBody({ type: CreateCheckoutDto })
  @ApiResponse({
    status: 201,
    description: 'Session Checkout créée avec succès',
    schema: {
      example: {
        url: 'https://checkout.stripe.com/c/pay/cs_test_xxx',
      },
    },
  })
  async initiateCheckout(
    @Param('userId') userId: string,
    @Body() dto: CreateCheckoutDto,
    @I18nLang() lang: string,
  ) {
    return this.paymentService.initiateCheckout(userId, dto, lang);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recevoir les événements webhook Stripe' })
  @ApiResponse({
    status: 200,
    description: 'Webhook traité avec succès',
    schema: {
      example: {
        received: true,
      },
    },
  })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentService.handleWebhook(req.rawBody!, signature);
  }

  @Get('verify/:sessionId')
  @ApiOperation({
    summary: 'Vérifier le statut d’un paiement après redirection',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'ID de la session Checkout Stripe',
    example: 'cs_test_xxx',
  })
  @ApiResponse({
    status: 200,
    description: 'Statut du paiement récupéré avec succès',
    schema: {
      example: {
        status: 'paid',
        amount: 49.99,
        currency: 'eur',
        payment: {
          id: 'payment_123',
          userId: 'user_123',
          stripeSessionId: 'cs_test_xxx',
          amount: 49.99,
          currency: 'eur',
          status: 'COMPLETED',
        },
      },
    },
  })
  async verifyPayment(@Param('sessionId') sessionId: string) {
    return this.paymentService.verifyPayment(sessionId);
  }
}
