
export const pricesKeyboard = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{ text: "7 Руб", callback_data: "seven_day_sub" }],
            [{ text: "450 Руб", callback_data: "one_month_sub" }],
            [{ text: "1200 Руб", callback_data: "three_months_sub" }],
            [{ text: "2300 Руб", callback_data: "six_months_sub" }]
        ]
    })
}

export const adminKeyboard = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{ text: "Отправить сообщение", callback_data: "send_messages_to_all" }]
        ]
    })
}


