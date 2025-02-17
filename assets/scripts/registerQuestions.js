import { waitForText } from "../utils/waitForText.js";

export async function registerQuestions(bot, chatId) {

    await bot.sendMessage(chatId, "Первый Шаг— напиши, пожалуйста, свою почту.");

    const email = await waitForText(bot, chatId);
    
    return email
}
