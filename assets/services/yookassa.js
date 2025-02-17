import { YooCheckout } from "@a2seven/yoo-checkout";
import dotenv from 'dotenv'

dotenv.config()

export const checkout = new YooCheckout({
    secretKey: process.env.SECRET_KEY,
    shopId: process.env.SHOP_ID
})