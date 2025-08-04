import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from 'src/config';
import { ChangeOrderStatusDto, CreateOrderDto } from './dto';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderWithProducts } from './enums/interface/OrderWithProduct';


@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrderService');
  constructor(
    @Inject(NATS_SERVICE) private readonly productsCliente: ClientProxy,
  ) {
    super();
  }
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async createPaymentSession(order: OrderWithProducts) {
    const paymentSession = await firstValueFrom(
      this.productsCliente.send('create.payment.session', {
       orderId : order.id,
       currency : "usd",
       items: order.OrderItem.map(item =>({
        name : item.name,
        price : item.price,
        quantity: item.quantity
       }))
      }),
    );
    return paymentSession;
  }

  async create(createOrderDto: CreateOrderDto) {
    try {
      const productIds = createOrderDto.items.map((item) => item.productId);
      const ids = [5, 600];
      const products = await firstValueFrom(
        this.productsCliente.send({ cmd: 'validate_product' }, productIds),
      );

      const totalAmount = createOrderDto.items.reduce((acc, orderItem) => {
        const price = products.find(
          (product) => product.id === orderItem.productId,
        ).price;
        return price * orderItem.quantity;
      }, 0);
      const totalItem = createOrderDto.items.reduce((acc, orderitem) => {
        return acc + orderitem.quantity;
      }, 0);
      //creando transaccion de base de datos
      const order = await this.order.create({
        data: {
          totalAmount: totalAmount,
          totalItems: totalItem,
          OrderItem: {
            createMany: {
              data: createOrderDto.items.map((orderItem) => ({
                price:
                  products.find((product) => product.id === orderItem.productId)
                    ?.price ?? 0,
                productId: orderItem.productId,
                quatity: orderItem.quantity,
              })),
            },
          },
        },

        include: {
          OrderItem: true,
        },
      });
      return {
        ...order,
        OrderItem: order.OrderItem.map((orderItem) => ({
          productId: orderItem.productId,
          price: orderItem.price,
          id: orderItem.id,
          quantity: orderItem.quatity, // corregir a quantity aquí
          orderId: orderItem.orderId,
          name:
            products.find((product) => product.id === orderItem.productId)
              ?.name ?? null,
        })),
        paidAt: order.paiAt, // mapea 'paiAt' a 'paidAt'
        createAt: order.createdAt, // mapea 'createdAt' a 'createAt'
        updatedAt: order.updateAt, // mapea 'updateAt' a 'updatedAt'
        // incluir otros campos que tenga 'order'
      };
    } catch (error) {
      console.log('EEROR FUE ', error);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error,
      });
    }
  }

  async changeStatus(changeOrderStatusDto: ChangeOrderStatusDto) {
    const { id, status } = changeOrderStatusDto;
    console.log('DATOOOOOOOOOOOOOS ', id, status);
    const order = await this.findOne(id);
    if (order.status === status) {
      return order;
    }
    return this.order.update({
      where: { id },
      data: { status: status },
    });
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const totalPages = await this.order.count({
      where: {
        status: orderPaginationDto.status,
      },
    });
    const currentPage = orderPaginationDto.page;
    const perPage = orderPaginationDto.limit;
    if (currentPage && perPage) {
      return {
        data: await this.order.findMany({
          skip: (currentPage - 1) * perPage,
          take: perPage,
          where: {
            status: orderPaginationDto.status,
          },
        }),
        meta: {
          total: totalPages,
          page: currentPage,
          lastPage: Math.ceil(totalPages / perPage),
        },
      };
    }

    const dataWhitoutPagination = await this.order.findMany({});
    return dataWhitoutPagination;
  }

  async findOne(id: string) {
    const order = await this.order.findFirst({
      where: { id },
      include: {
        OrderItem: true,
      },
    });

    if (!order) {
      console.log('POR AQUI NO HSY ');
      throw new RpcException({
        message: `Producto con id ${id} not found`,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const productIds = order.OrderItem.map((orderItem) => orderItem.productId);
    const products: any[] = await firstValueFrom(
      this.productsCliente.send({ cmd: 'validate_product' }, productIds),
    );

    return {
      ...order,
      OrderItem: order.OrderItem.map((orderItem) => ({
        ...orderItem,
        name: products.find((product) => product.id === orderItem.productId)
          .name,
      })),
    };
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
