import TelegramBot from "node-telegram-bot-api";
import dotenv from 'dotenv'
import { readFileSync } from "fs";
import { createPayment } from "./assets/scripts/payments.js";
import { logger } from "./assets/services/logger.js";
import { getUser } from "./assets/scripts/users.js";
import { changePrices, sendMessagesToAll } from "./assets/scripts/admin.js";
import { checkExpiredSubscriptions } from "./assets/scripts/checkExpiredSubScriptions.js";
import prices from './assets/db/prices/db.json' with {type: "json"}
import { SubPricesModel } from "./assets/models/SubPricesModel.js";


dotenv.config()

export const bot = new TelegramBot(process.env.TOKEN, {polling: true})

const commands = JSON.parse(readFileSync("./assets/db/commands/commands.json", 'utf-8'))

bot.setMyCommands(commands)

setInterval(checkExpiredSubscriptions, 24 * 60 * 60 * 1000);


bot.on('message', async msg => {
    console.log(msg)
    if (msg.text == "/start"){
        await getUser(bot, msg)
    }else if(msg.text === "/meditations"){
    await bot.sendMessage(msg.chat.id, `На данный момент в сообществе уже представлены медитации по темам: 

Медитации расслабления 

Оздоровительные медитации 

Подкатегории: 

Медитации для оздоровления кишечника 

Медитации для оздоровления сердца 

Медитации для оздоровления печени 

Медитации для оздоровления легких 

Медитации для оздоровления ног 

Медитации для оздоровления почек 

Для похудения 

От боли 

Медитации для здорового сна 

Mindfulness 

Медитации для работы с тревогой 

Медитации любви к себе 

Медитации для работы с гневом 

Медитации для работы с одиночеством 

Медитации для работы с горем 

Медитации для работы со страхом 

Медитация для пробуждения женской сексуальности 

Подкатегория – привлечение идеального мужчины 

Медитация для пробуждения мужской сексуальности 

Подкатегория – Привлечение идеальной женщины 

Медитации для пробуждения интуиции 

Медитация для развития сенсорики 

Тета медитации 

Динамические медитации 

Медитации для работы с ленью 

Медитации успеха 

Медитации для достижения цели и желаний 

Медитации благодарности 

Медитации прощения 

Медитации омоложения 

Медитации для зарядки энергией 

Медитация для пробуждения харизмы 

Медитации для работы с телесными блоками 

Медитации повышения самооценки 

Медитации уверенности в себе 

Медитации на чакры 

Медитации Випассана 

Медитации исцеления внутреннего ребенка 

Денежные медитации 

Медитации для сепарации 

Проработка психологических травм. 

    
Если ты не нашел/шла подходящей медитации просто напиши мне @Sergeykrasnov80, я запишу и добавляю медитацию в каталог! 
    `)
}else if (msg.text === "/getsubscription") {
    if (!msg.chat || !msg.chat.id) {
        console.error("Ошибка: chatId отсутствует");
        return;
    }

    const userPrices = await new SubPricesModel().getPricesForUser(msg.chat.id);
    
    const message = `Оформить подписку за 1 рубль!

Приглашаю тебя в удивительное путешествие по вселенной самосовершенствования. Тебя ждут медитации на все случаи жизни!

Присоединяйтесь к сообществу прямо сейчас по кнопке ниже 👇

💸 Сегодня вы можете присоединиться к сообществу по следующим ценам:`;

    const inlineKeyboard = userPrices.length > 0
        ? userPrices.map(price => [
            { text: `${price.price} Руб`, callback_data: price.type }
        ])
        
        : [
            [{ text: `${prices.seven_day_sub.price} Руб`, callback_data: "seven_day_sub" }],
            [{ text: `${prices.one_month_sub.price} Руб`, callback_data: "one_month_sub" }],
            [{ text: `${prices.three_months_sub.price} Руб`, callback_data: "three_months_sub" }],
            [{ text: `${prices.six_months_sub.price} Руб`, callback_data: "six_months_sub" }]
        ];
        console.log(userPrices)
    await bot.sendMessage(msg.chat.id, message, {
        reply_markup: {
            inline_keyboard: inlineKeyboard
        }
    });
}})


bot.on('callback_query', async msg => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    const messageId =  msg.message.message_id
    switch (data) {
        case "send_messages_to_all":
            await sendMessagesToAll(bot, chatId);
            break;
        case "accept_terms":
            await bot.answerCallbackQuery(msg.id, { text: "Условия приняты ✅" });
            await bot.deleteMessage(chatId, messageId)
            await bot.sendMessage(chatId, `📅 Подписка продлена до`, {
                reply_markup: {
                    inline_keyboard: [
                        [{ 
                            text: "Подписаться", 
                            url: process.env.CHANNEL_INVITE_LINK 
                        }]
                    ]
                }
            });
            break;

        case "change_prices":
            await bot.deleteMessage(chatId, messageId)
            await changePrices(bot, chatId);
            break;
            
        default:
            await bot.deleteMessage(chatId, messageId)
            await createPayment(bot, chatId, data, msg);
            break;
    }
});


bot.on('polling_error', logger.error)

