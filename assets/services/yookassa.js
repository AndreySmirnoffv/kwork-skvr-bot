import { YooCheckout } from "@a2seven/yoo-checkout";
import dotenv from 'dotenv'

dotenv.config()

const isProd = process.env.prodStatus === 'true'; 

export const checkout = new YooCheckout({
    shopId: isProd ? Number(process.env.PROD_SHOP_ID) : Number(process.env.TEST_SHOP_ID),
    secretKey: isProd ? String(process.env.PROD_SECRET_KEY) : String(process.env.TEST_SECRET_KEY)
});

