import { AdminModel } from "../models/AdminModel.js";
import prices from '../db/prices/db.json' with {type: "json"}
import * as fs from 'fs'
import { waitForText } from "../utils/waitForText.js";

export async function sendMessagesToAll(bot, chatId) {

    await bot.sendMessage(chatId, "Пришлите мне текст который вы хотите отослать пользователю")

    const message = await waitForText(bot, chatId)

    const users = await new AdminModel().findAll();

    console.log(users);

    for (const user of users) {
        if (user.chatId === chatId) {
            continue
        }

        await bot.sendMessage(user.chatId, message)
    }
}

export async function changePrices(bot, chatId) {

    let message = "Вот все доступные подписки для изменения:\n\n";

    for (const [key, value] of Object.entries(prices)) {
        message += `*${key}*\n` + 
                   `Цена: ${value.price} руб.\n` + 
                   `Длительность: ${value.durationInDays} дней\n\n`;
    }

    await bot.sendMessage(chatId, message);

    const subToChange = await waitForText(bot, chatId)

    if (!prices[subToChange]) {
        await bot.sendMessage(chatId, "Ошибка: такая подписка не найдена.");
        return;
    }

    await bot.sendMessage(chatId, "Пришлите мне новую цену для подписки");

    const newPrice = await waitForText(bot, chatId);

    const parsedPrice = parseFloat(newPrice);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return await bot.sendMessage(chatId, "Ошибка: введена неверная цена.");
    
    }

    prices[subToChange].price = parsedPrice;

    fs.writeFileSync("./assets/db/prices/db.json", JSON.stringify(prices, null, '\t'))
    
    await bot.sendMessage(chatId, `Цена подписки *${subToChange.replace(/_/g, ' ')}* успешно обновлена на ${parsedPrice} руб.`);
}
