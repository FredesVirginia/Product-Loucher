import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { PaginationDto } from 'src/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('products')
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  //@Post()
 @MessagePattern({cmd : 'create_product'})
  create(@Payload() createProductoDto: CreateProductoDto) {
    return this.productoService.create(createProductoDto);
  }

  //@Get()
  @MessagePattern({cmd : 'get_all_product'})
  findAll(@Payload() paginationDto : PaginationDto) {
    
    return this.productoService.findAll(paginationDto);
  }

  // @Get(':id')
  @MessagePattern({cmd : 'get_id_product'})
  findOne(@Payload('id' , ParseIntPipe) id: number) {
    return this.productoService.findOne(id);
  }

  // @Patch(':id')
  @MessagePattern({cmd : 'update_product'})
  update(@Payload() updateProductoDto : UpdateProductoDto) {
    //return this.productoService.update(+id, updateProductoDto);
  
    return this.productoService.update( updateProductoDto.id , updateProductoDto)
  }

  // @Delete(':id')
  @MessagePattern({cmd : 'delete_product'})
  remove(@Payload('id' , ParseIntPipe) id: number) {
    return this.productoService.remove(id);
  }

  @MessagePattern({cmd : "validate_product"})
   validateProduct(@Payload() ids : number[]){
    return this.productoService.validateProduct(ids);
   }
}
