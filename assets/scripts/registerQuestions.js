import { waitForText } from "../utils/waitForText.js";

export async function registerQuestions(bot, chatId) {

    await bot.sendMessage(chatId, "И последний шаг — напиши, пожалуйста, свою почту.");
    const email = await waitForText(bot, chatId);

    await bot.sendMessage(
        chatId,
        "Необходимо принять условия оферты, политики обработки персональных данных и предоставить согласие на их обработку.",
        {
            reply_markup: {
                inline_keyboard: [[{ text: "Принять", callback_data: "accept_terms" }]],
            },
        }
    );

    return new Promise((resolve) => {
        bot.on("callback_query", async (query) => {
            if (query.data === "accept_terms" && query.message.chat.id === chatId) {
                await bot.answerCallbackQuery(query.id, { text: "Условия приняты ✅" });

                resolve({                        
                    email,
                });
            }
        });
    });
}
