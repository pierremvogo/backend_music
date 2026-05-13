import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { I18nLang } from 'nestjs-i18n';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @Post('createOrder')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({ summary: 'Créer un order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiCreatedResponse({
    description: 'Order créé avec succès',
  })
  @ApiConflictResponse({
    description: 'Un Order avec ce nom existe déjà',
  })
  createOrder(@Body() dto: CreateOrderDto, @I18nLang() lang: string) {
    return this.orderService.createOrder(dto, lang);
  }

  @Get('getOrders')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({ summary: 'Récupérer tous les orders' })
  @ApiCreatedResponse({
    description: 'Orders récupérés avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun order trouvé',
  })
  findOrders(@I18nLang() lang: string) {
    return this.orderService.findOrders(lang);
  }

  @Get('getOrderById/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: "Id de l'order",
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({ summary: 'Récupérer un order' })
  @ApiCreatedResponse({
    description: 'Order récupéré avec succès',
  })
  @ApiNotFoundResponse({
    description: 'Aucun order trouvé',
  })
  findOrderById(@Param('id') id: string, @I18nLang() lang: string) {
    return this.orderService.findOrderById(id, lang);
  }

  @Patch('updateOrder/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiOperation({
    summary: 'Mettre à jour un order',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: "Id de l'order",
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOkResponse({
    description: 'Order mis à jour avec succès',
  })
  @ApiBadRequestResponse({
    description: 'Id manquant',
  })
  async updateOrder(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
    @I18nLang() lang: string,
  ) {
    return this.orderService.updateOrder(id, dto, lang);
  }

  @Delete('deleteOrder/:id')
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Langue de la réponse (ex: en, es, fr)',
    required: false,
    example: 'es',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Id du order',
    example: 'f3a8c1d9b7e6...',
  })
  @ApiOperation({
    summary: 'Supprimer un order',
  })
  @ApiOkResponse({
    description: 'Order supprimée avec succès',
  })
  async deleteOrder(@Param('id') id: string, @I18nLang() lang: string) {
    return this.orderService.deleteOrder(id, lang);
  }
}
