import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule , {
    transport : Transport.NATS,
    options : {
      servers : envs.natsServer
    }
  });
  console.log( )
  const logger = new Logger("OrderMs-Main")
 
   app.useGlobalPipes(
    new ValidationPipe({
      whitelist : true, 
      forbidNonWhitelisted : true
    })
   )
   await app.listen();
  logger.log(`ORDEN CORRIENDO EN EL PUERTO ${process.env.PORT}`)
}
bootstrap();
