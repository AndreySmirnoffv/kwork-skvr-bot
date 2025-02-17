import { adminKeyboard } from "../db/keyboard/keyboard.js";
import { UserModel } from "../models/UserModel.js";

export async function getUser(bot, msg) {
    const chatId = msg.chat.id;

    let user = await new UserModel().findUser(chatId);

    if (!user){
        await createChatIdForUser(chatId)
    }

    const adminMessage = `Приветствую! Я бот проекта Сергея Краснов «Медитации от Психология+».  Я помогу тебе оформить подписку в закрытое сообщество в котором есть медитации на все случаи жизни, более того, ты можешь заказать медитацию для своего случая если подходящей не будет.

Примеры медитаций ниже:

1. https://disk.yandex.ru/d/RZfodSuhbhDL1g/%D0%92%D0%B5%D1%87%D0%B5%D1%80%D0%BD%D1%8F%D1%8F%20%D0%BC%D0%B5%D0%B4%D0%B8%D1%82%D0%B0%D1%86%D0%B8%D1%8F.mp3

2. https://disk.yandex.ru/d/RZfodSuhbhDL1g/%D0%9C%D0%90%D0%99%D0%9D%D0%94%D0%A4%D0%A3%D0%9B%D0%9D%D0%95%D0%A1.mp3

3. https://disk.yandex.ru/d/RZfodSuhbhDL1g/%D0%9C%D0%B5%D0%B4%D0%B8%D1%82%D0%B0%D1%86%D0%B8%D1%8F%20%D0%B1%D0%BB%D0%B0%D0%B3%D0%BE%D0%B4%D0%B0%D1%80%D0%BD%D0%BE%D1%81%D1%82%D0%B8.mp3

4. https://disk.yandex.ru/d/RZfodSuhbhDL1g/%D0%9C%D0%B5%D0%B4%D0%B8%D1%82%D0%B0%D1%86%D0%B8%D1%8F%20%D0%BB%D1%8E%D0%B1%D1%8F%D1%89%D0%B5%D0%B9%20%D0%B4%D0%BE%D0%B1%D1%80%D0%BE%D1%82%D1%8B.mp3

5. https://disk.yandex.ru/d/RZfodSuhbhDL1g/%D0%9C%D0%B5%D0%B4%D0%B8%D1%82%D0%B0%D1%86%D0%B8%D1%8F%20%D0%BF%D1%80%D0%B8%D0%BD%D1%8F%D1%82%D0%B8%D1%8F%20%D1%8D%D0%BD%D0%B5%D1%80%D0%B3%D0%B8%D0%B8.mp3

6. https://disk.yandex.ru/d/RZfodSuhbhDL1g/%D0%9E%D0%B7%D0%B4%D0%BE%D1%80%D0%B0%D0%B2%D0%BB%D0%B8%D0%B2%D0%B0%D1%8E%D1%89%D0%B0%20%D0%BC%D0%B5%D0%B4%D0%B8%D1%82%D0%B0%D1%86%D0%B8%D1%8F.mp3

7. https://disk.yandex.ru/d/RZfodSuhbhDL1g/%D0%A3%D1%82%D1%80%D0%B5%D0%BD%D0%BD%D1%8F%D1%8F%20%D0%BC%D0%B5%D0%B4%D0%B8%D1%82%D0%B0%D1%86%D0%B8%D1%8F.mp3
`;

    const replyMarkup = user && user.isAdmin ? adminKeyboard : {};

    return await bot.sendMessage(chatId, adminMessage, replyMarkup);
}

export async function createUser(chatId, userInfo){

    const {name, phone, email} = userInfo


    return await new UserModel().updateUser({
        chatId,
        name,
        phone,
        email
    })
}

export async function createChatIdForUser(chatId){
    return await new UserModel().createUser(chatId)
}

export async function sendMessageToAdmin(bot) {
    return await bot.sendMessage(process.env.ADMIN_CHAT_ID, "hello world")
    
}
