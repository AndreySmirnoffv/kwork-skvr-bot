import { prisma } from "../services/prisma.js";

export class PaymentModel {
    async insertPayment(data) {
        const { paymentId, chatId, amount, paid, status } = data;

        const user = await prisma.users.findUnique({
            where: { chatId: BigInt(chatId) }
        });

        if (!user) {
            throw new Error(`User with chatId ${chatId} not found`);
        }

        return await prisma.payments.create({
            data: {
                paymentId,
                chatId: BigInt(chatId),
                amount,
                paid,
                status
            }
        });
    }

    async updatePaymentStatus(data) {
        const { status, paymentId, paid } = data;

        if (!paymentId) {
            throw new Error("paymentId is required to update payment status");
        }

        return await prisma.payments.update({
            where: { paymentId },
            data: {
                status,
                paid
            }
        });
    }
}
