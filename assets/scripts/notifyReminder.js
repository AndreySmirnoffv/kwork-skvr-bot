import { SubModel } from '../models/SubModel.js';
import { bot } from '../../index.js';

export async function notifyExpiringSubscriptions() {
    try {
        const tomorrowDate = new Date();
        tomorrowDate.setDate(tomorrowDate.getDate() + 1); 

        const expiringSubs = await new SubModel().getExpiringSubscriptions(tomorrowDate);

        for (const sub of expiringSubs) {
            const { chatId } = sub;
            await bot.sendMessage(chatId, "⚠️ Внимание! Ваша подписка истекает завтра. Продлите её, чтобы не потерять доступ.");
            console.log(`Sent expiration warning to user ${chatId}`);
        }
    } catch (error) {
        console.error("Error sending expiration warnings:", error);
    }
}
