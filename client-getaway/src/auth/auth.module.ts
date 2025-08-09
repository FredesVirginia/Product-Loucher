import { NatsModule } from 'src/trsnsport/nats.module';
import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  imports:[NatsModule]
  
})
export class AuthModule {}
