import { IsEnum, IsUUID } from "class-validator";
import { OrderStatusList } from "../enums/enum.ordes";
import { OrderStatus } from "@prisma/client";

export class ChangeOrderStatusDto{
    @IsUUID()
    id : string; 

    @IsEnum(OrderStatusList , {
        message : `Valid status are ${OrderStatusList}`
    })
    status : OrderStatus
}