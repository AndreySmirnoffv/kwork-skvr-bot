import { SubModel } from '../models/SubModel.js';
import { bot } from '../../index.js'; 

export async function checkExpiredSubscriptions() {
    try {
        const currentDate = new Date();
        
        const expiredSubs = await new SubModel().getExpiredSubscriptions(currentDate);
        
        for (const sub of expiredSubs) {
            const { chatId } = sub; 
            await bot.banChatMember(process.env.CHANNEL_ID, chatId)
            await bot.banChatMember(process.env.CHANNEL_ID, chatId);
            console.log(`User ${chatId} was banned due to expired subscription.`);
        }
    } catch (error) {
        console.error("Error checking expired subscriptions:", error);
    }
}

