import { Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';



@Controller()
export class AuthController {
  
  constructor(@Inject(NATS_SERVICE) private readonly client : ClientProxy){

  }


  @Post("register")
  registerUser() {
    return this.client.send('register user' , {});
  }

  @Post("login")
  loginUser() {
    return this.client.send('auth.register.user',{})
  }

  @Post("verify-token")
  verifyToken() {
    return this.client.send("verify.token" , {})
  }
}
