// stripe.service.ts
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { Session } from 'node_modules/stripe/cjs/resources/Checkout';
import { Refund } from 'node_modules/stripe/cjs/resources/Refunds';
import { PrismaService } from 'src/prisma/prisma.service';

import Stripe from 'stripe';

@Injectable()
export class StripeService {
  constructor(
    @Inject('STRIPE_CLIENT')
    private readonly stripe: InstanceType<typeof Stripe>,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  // ─── Créer une session Checkout ───────────────────────────────────────────
  async createCheckoutSession(
    params: {
      userId: string;
      items: { name: string; price: number; quantity: number }[];
      metadata?: Record<string, string>;
    },
    lang: string,
  ): Promise<Session> {
    const { userId, items, metadata } = params;

    const existingUser = await this.prisma.user.findFirst({
      where: { AND: { id: userId, role: 'FAN' } },
    });

    if (!existingUser) {
      throw new BadRequestException(
        this.i18n.translate('release.NO_USER_FOUND', { lang }),
      );
    }

    return this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment', // ou 'subscription' pour les abonnements
      line_items: items.map((item) => ({
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(item.price * 100), // en centimes
          product_data: { name: item.name },
        },
        quantity: item.quantity,
      })),
      metadata: { userId, ...metadata },
      success_url: `${this.configService.get('STRIPE_SUCCESS_URL')}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: this.configService.get('STRIPE_CANCEL_URL'),
    });
  }

  // ─── Créer un abonnement (mode subscription) ──────────────────────────────
  async createSubscriptionSession(params: {
    userId: string;
    priceId: string; // ID du Price créé dans le dashboard Stripe
    customerEmail: string;
  }): Promise<Session> {
    return this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: params.customerEmail,
      line_items: [{ price: params.priceId, quantity: 1 }],
      metadata: { userId: params.userId },
      success_url: `${this.configService.get('STRIPE_SUCCESS_URL')}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: this.configService.get('STRIPE_CANCEL_URL'),
    });
  }

  // ─── Construire l'événement Webhook (vérification signature) ─────────────
  constructWebhookEvent(payload: Buffer, signature: string): any {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.configService.get('STRIPE_WEBHOOK_SECRET')!,
    );
  }

  // ─── Récupérer une session Checkout ──────────────────────────────────────
  async getSession(sessionId: string): Promise<Session> {
    return this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'customer'],
    });
  }

  // ─── Rembourser un paiement ───────────────────────────────────────────────
  async refund(paymentIntentId: string, amount?: number): Promise<Refund> {
    return this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      ...(amount && { amount: Math.round(amount * 100) }),
    });
  }
}
