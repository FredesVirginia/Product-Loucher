import Stripe from 'stripe';
import { envs } from './../config/envs';
import { Injectable, Logger } from '@nestjs/common';
import { PaymentSeccionDto } from './dto/payments-session.dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {
    private readonly stripe = new Stripe(envs.stripe_secret)
    private readonly logger = new Logger("PaymentService")
    async createPaymenstSession(paymentSessionDto : PaymentSeccionDto){

        const {currency , items , orderId} = paymentSessionDto;
        const lineItems = items.map(item => {
            return {
                price_data : {
                    currency : currency,
                    product_data : {
                        name : item.name
                    },
                    unit_amount : Math.round(item.price * 100),
                   
                },
                 quantity : item.quantity
            }
        })
        const seccion = await this.stripe.checkout.sessions.create({
            payment_intent_data : {
                metadata : {
                    orderId : orderId
                }
            } , 

            line_items:lineItems,
            mode : "payment",
            success_url : envs.succes_url,
            cancel_url :  envs.cansel_url

        })

        return {
            canselUrl : seccion.cancel_url,
            successUrl : seccion.success_url,
            url : seccion.url
        }
    }



  async stripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = envs.endpoit_secret_

    let event: Stripe.Event;

    try {
        event = this.stripe.webhooks.constructEvent(
            req['rawBody'],
            sig!,
            endpointSecret
        );
    } catch (err: any) {
        console.log("El error fue", err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ Solo llega aquí si event fue correctamente construido
    console.log(event);

    switch (event.type) {
        case 'charge.succeeded':
            const changeSucceded = event.data.object;
            const payload = {
                stripePaymentId : changeSucceded.id,
                orderId : changeSucceded.metadata.orderId,
                receipUrl : changeSucceded.receipt_url,
            }
            this.logger.log({payload})
            break;
        default:
            console.log(`⚠️ Evento no controlado: ${event.type}`);
    }

    return res.status(200).json({ received: true });
}

}
