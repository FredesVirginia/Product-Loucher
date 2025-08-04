import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { PrismaClient } from 'generated/prisma';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductoService extends PrismaClient implements OnModuleInit {
  
  private readonly logger = new Logger('Producto servicio')
  onModuleInit() {
      this.$connect();
      this.logger.log("BASE DE DATOS CONECTADA")
  }
  
  create(createProductoDto: CreateProductoDto) {
    return this.product.create({
      data: createProductoDto
    })
  }
//PARAMETROS POR QUERY PARA LA PAGINACION
   async findAll(paginationDto : PaginationDto) {
    const { limit  , page} = paginationDto;
    const totalPages = await this.product.count();
    
     if(limit && page){
      return {
        data : await  this.product.findMany({
          skip : ( page -1 ) * limit,
          take : limit
        }), 
        meta : {
          page : page,
          totalPages : totalPages
        }
      }
     }

     return this.product.findMany({})
  }

  async findOne(id: number) {
    const product =await  this.product.findFirst({
      where : {id}
    })

    if(!product){
       throw new RpcException({
        message : `Producto con id ${id} not found`,
        status : HttpStatus.BAD_REQUEST
       })
    }

    return product
  }

  async update(id: number, updateProductoDto: UpdateProductoDto) {
    const { id : _, ...data} = updateProductoDto;
    await this.findOne(id);
    return this.product.update({
      where : {id},
      data : data
    })
  }

  remove(id: number) {
    return `This action removes a #${id} producto`;
  }


  async validateProduct(ids : number[]){
    ids = Array.from(new Set(ids))
    const product = await this.product.findMany({
      where : {
        id : { in : ids}
      }
    })

    if(product.length !== ids.length){
      throw new RpcException({
        message : "Some productos were not found",
        stutus : HttpStatus.BAD_REQUEST
      })
    }

    return product
  }
}
