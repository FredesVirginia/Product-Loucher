import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { ChangeOrderStatusDto } from './dto';



@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('createOrder')
  
  async create(@Payload() createOrderDto: CreateOrderDto) {
    console.log("CONTROLLER ORDER MS ")
    const order  = await this.ordersService.create(createOrderDto)
    const  paymentSeccion = await this.ordersService.createPaymentSession(order)
    return {
      paymentSeccion,
      order
    }
  }

  @MessagePattern('findAllOrders')
  findAll(@Payload () orderPaginationDto : OrderPaginationDto) {
    return this.ordersService.findAll(orderPaginationDto);
  }

  @MessagePattern('findOneOrder')
  async findOne(@Payload("id" , ParseUUIDPipe)  id : string) {
    return this.ordersService.findOne(id);
  }

  @MessagePattern('updateOrder')
  update(@Payload() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(updateOrderDto.id, updateOrderDto);
  }

  @MessagePattern('removeOrder')
  remove(@Payload() id: number) {
    return this.ordersService.remove(id);
  }

  @MessagePattern("changeOrderStatus")
  changeOrderStatus(@Payload () changeOrderStatusDto: ChangeOrderStatusDto){
    console.log("pppppppppppppppppppppppppppppppppppppp")
    return this.ordersService.changeStatus(changeOrderStatusDto)
  }
}
