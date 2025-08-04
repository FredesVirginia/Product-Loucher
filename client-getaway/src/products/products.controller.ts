import { BadGatewayException, Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PaginationDto } from 'src/common';
import { NATS_SERVICE, PRODUCT_SERVICE } from 'src/config';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';


@Controller('products')
export class ProductsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly productClient : ClientProxy
  ) {}


  @Post()
  createProduct( @Body() createProductDto : CreateProductoDto){
    return this.productClient.send({cmd :'create_product' } , createProductDto)
  }

  @Get()
  findAllProduct(@Query() paginationDto : PaginationDto){
    return this.productClient.send({cmd : 'get_all_product'} , paginationDto)
  }

  @Get(":id")
  async findOne(@Param('id') id : string){
    try {
      const product = await firstValueFrom(
        this.productClient.send({ cmd : "get_id_product" }, {id})
      )
      return  product
    }catch(error){
      throw new RpcException(error)
    }
  }


  @Delete(":id")
  deleteProduct(@Param('id') id : string){
   return this.productClient.send({cmd : 'delete_product'} , {id})
  }


  @Patch(":id")
  updateProduct(@Param('id' , ParseIntPipe) id : number , @Body() updateDro : UpdateProductoDto){
    return this.productClient.send({cmd : 'update_product'} , { 
      id, 
      ...updateDro
    })
  }

}
