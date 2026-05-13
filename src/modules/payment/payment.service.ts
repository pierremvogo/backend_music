import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { Session } from 'node_modules/stripe/cjs/resources/Checkout';
import { PaymentIntent } from 'node_modules/stripe/cjs/resources/PaymentIntents';
import { Charge } from 'node_modules/stripe/cjs/resources/Charges';
import { Subscription } from 'node_modules/stripe/cjs/resources/Subscriptions';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
  ) {}

  // ─── Initier le checkout ──────────────────────────────────────────────────
  async initiateCheckout(userId: string, dto: CreateCheckoutDto, lang: string) {
    const session = await this.stripeService.createCheckoutSession(
      {
        userId,
        items: dto.items,
        metadata: { orderId: dto.orderId ?? '' },
      },
      lang,
    );

    // Persister la session en base avec le statut PENDING
    await this.prisma.payment.create({
      data: {
        userId,
        stripeSessionId: session.id,
        amount: session.amount_total! / 100,
        currency: session.currency!,
        status: 'PENDING',
      },
    });

    return { url: session.url }; // redirect vers Stripe
  }

  // ─── Traitement du Webhook ────────────────────────────────────────────────
  async handleWebhook(payload: Buffer, signature: string) {
    let event: any;

    try {
      event = this.stripeService.constructWebhookEvent(payload, signature);
    } catch (err: any) {
      this.logger.error(`Webhook signature invalide: ${err.message}`);
      throw new BadRequestException('Webhook signature invalide');
    }

    this.logger.log(`Événement Stripe reçu: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.onCheckoutCompleted(event.data.object as Session);
        break;

      case 'checkout.session.expired':
        await this.onCheckoutExpired(event.data.object as Session);
        break;

      case 'payment_intent.payment_failed':
        await this.onPaymentFailed(event.data.object as PaymentIntent);
        break;

      case 'charge.refunded':
        await this.onRefunded(event.data.object as Charge);
        break;

      case 'customer.subscription.updated':
        await this.onSubscriptionUpdated(event.data.object as Subscription);
        break;

      case 'customer.subscription.deleted':
        await this.onSubscriptionDeleted(event.data.object as Subscription);
        break;

      default:
        this.logger.debug(`Événement non géré: ${event.type}`);
    }

    return { received: true };
  }

  // ─── Handlers des événements ──────────────────────────────────────────────

  private async onCheckoutCompleted(session: Session) {
    await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { stripeSessionId: session.id },
        data: {
          status: 'COMPLETED',
          stripePaymentIntentId: session.payment_intent as string,
        },
      });

      // Ta logique métier ici : activer abonnement, créer commande, etc.
      await tx.order.update({
        where: { id: session.metadata!.orderId },
        data: { status: 'PAID', paymentId: payment.id },
      });
    });

    this.logger.log(`Paiement confirmé: session ${session.id}`);
  }

  private async onCheckoutExpired(session: Session) {
    await this.prisma.payment.update({
      where: { stripeSessionId: session.id },
      data: { status: 'EXPIRED' },
    });
  }

  private async onPaymentFailed(intent: PaymentIntent) {
    await this.prisma.payment.updateMany({
      where: { stripePaymentIntentId: intent.id },
      data: { status: 'FAILED' },
    });
  }

  private async onRefunded(charge: Charge) {
    await this.prisma.payment.updateMany({
      where: { stripePaymentIntentId: charge.payment_intent as string },
      data: { status: 'REFUNDED' },
    });
  }

  private async onSubscriptionUpdated(subscription: Subscription) {
    await this.prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: { status: subscription.status.toUpperCase() },
    });
  }

  private async onSubscriptionDeleted(subscription: Subscription) {
    await this.prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: { status: 'CANCELLED', endsAt: new Date() },
    });
  }

  // ─── Vérification post-redirect ───────────────────────────────────────────
  async verifyPayment(sessionId: string) {
    const session = await this.stripeService.getSession(sessionId);

    const payment = await this.prisma.payment.findUnique({
      where: { stripeSessionId: sessionId },
    });

    return {
      status: session.payment_status,
      amount: session.amount_total! / 100,
      currency: session.currency,
      payment,
    };
  }
}
