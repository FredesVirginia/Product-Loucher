import { OrderStatus, OrderStatusList } from './../enums/enum.ordes';
import { IsEnum, IsOptional } from "class-validator";
import { PaginationDto } from "src/common";


export class OrderPaginationDto extends PaginationDto {
    @IsOptional()
    @IsEnum(OrderStatusList , {
        message : `Valid status are ${OrderStatusList}`
    })
    status : OrderStatus
}