import { SubModel } from '../models/SubModel.js';
import { bot } from '../../index.js'; 
import { notifyExpiringSubscriptions } from './notifyReminder.js';

export async function checkSubscriptions() {
    try {
        await notifyExpiringSubscriptions();

        const currentDate = new Date();
        const expiredSubs = await new SubModel().getExpiredSubscriptions(currentDate);

        for (const sub of expiredSubs) {
            const { chatId } = sub;
            await bot.banChatMember(process.env.CHANNEL_ID, chatId);
            console.log(`User ${chatId} was banned due to expired subscription.`);
        }
    } catch (error) {
        console.error("Error checking subscriptions:", error);
    }
}

