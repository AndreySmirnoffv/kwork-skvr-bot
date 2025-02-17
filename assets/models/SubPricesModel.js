import { prisma } from "../services/prisma.js";

export class SubPricesModel {
    async savePricesForUser(data) {
        const { chatId, price, type } = data;

        return await prisma.subscription_prices.create({
            data: {
                price,
                type,
                user: {
                    connect: { chatId }, // Устанавливаем связь с пользователем по chatId
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
