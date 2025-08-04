
import 'dotenv/config';
import * as joi from "joi";

interface EnvVars{
    PORT : number;
    SECRET_KEY_STRIPE : string;
    SUCCES_URL : string;
    CANSEL_URL : string;
    ENV_ENDPOIT_SECRET : string;
    NATS_SERVERS: string[];
}

const envsShema = joi.object({
    PORT :  joi.number().required(),
    SECRET_KEY_STRIPE: joi.string().required(),
    SUCCES_URL : joi.string().required(),
    CANSEL_URL : joi.string().required(),
    ENV_ENDPOIT_SECRET : joi.string().required(),
    NATS_SERVERS : joi.array().items(joi.string()).required()
   
}).unknown(true);

const { error , value } = envsShema.validate(
   {
    ... process.env,
      NATS_SERVERS : process.env.NATS_SERVERS?.split(",")
   }
     

);

if(error){
    throw new Error (`Config validation errors ${ error}`)
}

const envVars : EnvVars = value;

export const envs = {
    port : envVars.PORT,
    stripe_secret : envVars.SECRET_KEY_STRIPE,
    succes_url : envVars.SUCCES_URL,
    cansel_url: envVars.CANSEL_URL,
    endpoit_secret_ : envVars.ENV_ENDPOIT_SECRET,
    natsServer: envVars.NATS_SERVERS
    

}