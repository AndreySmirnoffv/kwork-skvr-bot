import { AdminModel } from "../models/AdminModel.js";

export async function sendMessagesToAll(bot, chatId) {
    const users = await new AdminModel().findAll();
    console.log(users);

    for (const user of users) {
        if (user.chatId === chatId) {
            continue
        }

        await bot.sendMessage(user.chatId, "hello world")
    }
}
