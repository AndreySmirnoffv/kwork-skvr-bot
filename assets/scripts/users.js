import { adminKeyboard } from "../db/keyboard/keyboard.js";
import { UserModel } from "../models/UserModel.js";
import * as fs from "fs";
import * as path from "path";

export async function getUser(bot, msg) {
    const chatId = msg.chat.id;

    const meditationPaths = [
        "Вечерняя медитация.mp3",
        "МАЙНДФУЛНЕС.mp3",
        "Медитация благодарности.mp3",
        "Медитация любящей доброты.mp3",
        "Медитация принятия энергии.mp3",
        "Оздоравливающая медитация.mp3",
        "Утренняя медитация.mp3"
    ].map(file => path.resolve("./assets/db/meditations", file));

    let user = await new UserModel().findUser(chatId);
    console.log(user?.isAdmin)
    if (!user) {
        await createChatIdForUser(chatId);
        user = await new UserModel().findUser(chatId);
    }

    const adminMessage = user?.isAdmin
        ? "Вы Админ и вот что можете сделать"
        : `Приветствую! Я бот проекта Сергея Краснова «Медитации от Психология+». Я помогу тебе оформить подписку в закрытое сообщество, где есть медитации на все случаи жизни. Более того, ты можешь заказать медитацию для своего случая, если подходящей не будет.

Примеры медитаций ниже:
1. Вечерняя медитация
2. МАЙНДФУЛНЕС
3. Медитация благодарности
4. Медитация любящей доброты
5. Медитация принятия энергии
6. Оздоравливающая медитация
7. Утренняя медитация`;

    const replyMarkup = user?.isAdmin ? adminKeyboard : {};

    await bot.sendMessage(chatId, adminMessage, replyMarkup);
    
    if (!user?.isAdmin) {
        await bot.sendMessage(chatId, "Подготаваливаю для тебя файлы ожидай!)")

        const existingFiles = meditationPaths.filter(filePath => fs.existsSync(filePath));

        await Promise.all(existingFiles.map(filePath => {
            const fileStream = fs.createReadStream(filePath);
            return bot.sendAudio(chatId, fileStream);
        }));
    }

    
}


export async function createUser(chatId, userInfo) {
    const { name, phone, email } = userInfo;
    return await new UserModel().updateUser({ chatId, name, phone, email });
}

export async function createChatIdForUser(chatId) {
    return await new UserModel().createUser(chatId);
}

export async function sendMessageToAdmin(bot) {
    return await bot.sendMessage(process.env.ADMIN_CHAT_ID, "hello world");
}
