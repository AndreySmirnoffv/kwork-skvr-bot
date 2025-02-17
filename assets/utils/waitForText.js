export async function waitForText(bot, chatId) {
    return new Promise((resolve, reject) => {
        const onMessage = (msg) => {
            if (msg.chat.id === chatId && msg.text) {
                bot.removeListener('message', onMessage);
                resolve(msg.text);
                bot.removeListener("message", waitForText);            
}
        };

        bot.on('message', onMessage); 
    });
}