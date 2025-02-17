
import prices from '../db/prices/db.json' with { type: "json" };
import { SubPricesModel } from '../models/SubPricesModel.js';

export async function saveSubPrice(chatId) {
    for (const type in prices) {
        console.log(prices[type].price);

        const { price } = prices[type];

        const data = {
            chatId, 
            price,
            type 
        };

        await new SubPricesModel().savePricesForUser(data);
    }
}

