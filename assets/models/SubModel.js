import { prisma } from "../services/prisma.js";

export class SubModel {
    async createSub(data) {
        const { chatId, status, type, price, endDate } = data;

        return await prisma.subscriptions.create({
            data: {
                chatId,
                status,
                type, 
                price,
                startDate: new Date(),
                endDate,
            }
        });
    }

    async getCurrentSub(chatId) {
        let sub = await prisma.subscriptions.findFirst({
            where: { chatId }
        });

        if (!sub) {
            return null;
        }

        return new Date(sub.endDate);
    }

    async updateCurrentSub(chatId, updateData) {
        return await prisma.subscriptions.update({
            where: { chatId },
            data: {
                endDate: updateData.endDate
            }
        });
    }

    async getExpiredSubscriptions(currentDate) {
        return await prisma.subscriptions.findMany({
            where: {
                endDate: {
                    lt: currentDate,
                }
            }
        });
    }

    async getExpiringSubscriptions(tomorrowDate) {
        return await prisma.subscriptions.findMany({
            where: {
                endDate: {
                    gte: new Date(tomorrowDate.setHours(0, 0, 0, 0)), 
                    lt: new Date(tomorrowDate.setHours(23, 59, 59, 999))
                }
            }
        });
    }
}
