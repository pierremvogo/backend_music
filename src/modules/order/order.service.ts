import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async createOrder(dto: CreateOrderDto, lang?: string) {
    // const existingOrder = await this.prisma.order.findFirst({
    //   where: { paymentId: dto.paymentId },
    // });
    // if (existingOrder) {
    //   throw new ConflictException(
    //     this.i18n.translate('order.ORDER_ALREADY_EXIST', { lang }),
    //   );
    // }
    const createdOrder = await this.prisma.order.create({
      data: {
        paymentId: dto.paymentId,
        status: dto.status,
      },
    });
    if (!createdOrder) {
      throw new BadRequestException(
        this.i18n.translate('order.ERROR_CREATED_ORDER', { lang }),
      );
    }
    return {
      message: this.i18n.translate('order.SUCCESSFULLY_CREATED_ORDER', {
        lang,
      }),
      data: createdOrder,
    };
  }

  async findOrders(lang?: string) {
    const allOrders = await this.prisma.order.findMany({
      orderBy: {
        id: 'desc',
      },
    });
    if (!allOrders) {
      throw new NotFoundException(
        this.i18n.translate('order.ORDER_NOT_FOUND', {
          lang,
        }),
      );
    }
    return {
      data: allOrders,
      message: this.i18n.translate('order.SUCCESSFULLY_GET_ALL_ORDER', {
        lang,
      }),
    };
  }

  async findOrderById(orderId: string, lang?: string) {
    try {
      if (!orderId) {
        throw new BadRequestException(
          this.i18n.translate('order.NO_ORDER_ID_GIVEN', {
            lang,
          }),
        );
      }
      const order = await this.prisma.order.findFirst({
        where: { id: orderId },
      });
      if (!order) {
        throw new NotFoundException(
          this.i18n.translate('order.ORDER_NOT_FOUND', {
            lang,
          }),
        );
      }
      return {
        data: order,
        message: this.i18n.translate('order.SUCCESSFULLY_GET_ORDER', { lang }),
      };
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async updateOrder(orderId: string, dto: UpdateOrderDto, lang?: string) {
    try {
      const { paymentId, status } = dto;

      const existingOrder = await this.prisma.order.findFirst({
        where: { id: orderId },
      });
      if (!existingOrder) {
        throw new NotFoundException(
          this.i18n.translate('order.ORDER_NOT_FOUND', {
            lang,
          }),
        );
      }
      const existingTag = await this.prisma.order.findFirst({
        where: { id: orderId },
      });
      if (!existingTag) {
        throw new NotFoundException(
          this.i18n.translate('order.ORDER_NOT_FOUND', {
            lang,
          }),
        );
      }
      // Mettre à jour le order
      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentId: paymentId, status: status },
        select: { id: true, paymentId: true, status: true },
      });

      return {
        data: updatedOrder,
        message: this.i18n.translate('order.ORDER_SUCCESSFULLY_UPDATED', {
          lang,
        }),
      };
    } catch (error) {
      console.error(error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async deleteOrder(orderId: string, lang?: string) {
    try {
      // Vérifier que le order existe
      const existingOrder = await this.prisma.order.findFirst({
        where: { id: orderId },
      });
      if (!existingOrder) {
        throw new NotFoundException(
          this.i18n.translate('order.ORDER_NOT_FOUND', {
            lang,
          }),
        );
      }
      // Supprimer le order
      await this.prisma.order.delete({ where: { id: orderId } });
      return {
        message: this.i18n.translate('order.SUCCESSFULLY_DELETED_ORDER', {
          lang,
        }),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
