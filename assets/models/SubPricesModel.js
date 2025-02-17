import { prisma } from "../services/prisma.js";

export class SubPricesModel {
    async savePricesForUser(data) {
        const { chatId, price, type } = data;

        const existingPrices = await prisma.subscription_prices.count({
            where: { chatId }
        });

        if (existingPrices >= 4) {
            return
        }

        return await prisma.subscription_prices.create({
            data: {
                price,
                type,
                user: {
                    connect: { chatId }, 
                },
            },
        });
    }

    async getPricesForUser(chatId) {
        return await prisma.subscription_prices.findMany({
            where: { chatId },
            select: {
                price: true,
                type: true
            }
        });
    }
}
