import { v4 } from 'uuid';
import { checkout } from '../services/yookassa.js';
import pricesDb from '../db/prices/db.json' with { type: "json" };
import { PaymentModel } from '../models/paymentModel.js';
import { registerQuestions } from './registerQuestions.js';
import { createUser } from './users.js';
import { UserModel } from '../models/UserModel.js';
import { SubModel } from '../models/SubModel.js';
import { saveSubPrice } from './saveSubPrice.js';

const paymentModel = new PaymentModel();
let paymentIntervals = [];

export async function createPayment(bot, chatId, subType) {
    try {
        const { email } = await registerQuestions(bot, chatId)
        await new UserModel().updateUser({ chatId, email })

        const paymentMessage = await bot.sendMessage(
            chatId,
            "Необходимо принять условия оферты и политики обработки персональных данных перед продолжением:",
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "Политика обработки данных", url: "https://disk.yandex.ru/i/XYZ123" }],
                        [{ text: "Оферта", url: "https://disk.yandex.ru/i/6Ht9fMgHzYWBj" }],
                        [{ text: "Принять", callback_data: "accept_terms" }]
                    ],
                },
            }
        );

        console.info(`Creating payment for chatId: ${chatId}, subType: ${subType}`);

        bot.on('callback_query', async (query) => {
            if (query.data === 'accept_terms' && query.message.chat.id === chatId) {
                await bot.deleteMessage(chatId, paymentMessage.message_id);

                const payload = {
                    amount: {
                        value: pricesDb[subType].price,
                        currency: "RUB"
                    },
                    confirmation: {
                        type: "redirect",
                        return_url: "https://google.com"
                    },
                };

                const startDate = new Date();
                const endDate = new Date();
                endDate.setDate(startDate.getDate() + pricesDb[subType].durationInDays);

                const { id, confirmation: { confirmation_url }, status, paid } = await checkout.createPayment(payload, v4());

                const sentMessage = await bot.sendMessage(chatId, "Оплатить можно по кнопке", {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "Оплатить", url: confirmation_url }]
                        ]
                    }
                });

                setTimeout(async () => {
                    await bot.deleteMessage(chatId, sentMessage.message_id);
                    await bot.sendMessage(chatId, "Срок оплаты истек либо ты уже оплатил)")
                }, 600000);

                await paymentModel.insertPayment({ paymentId: id, chatId, amount: pricesDb[subType].price, paid, status });
                console.info(`Payment created: ${id}, status: ${status}, paid: ${paid}`);

                setInterval(() => capturePayment(bot, chatId, id, subType), 3000);
            }
        });
    } catch (error) {
        console.error(`Error creating payment for chatId: ${chatId}, subType: ${subType}, error: ${error.message}`);
        console.error('Error creating payment:', error);
    }
}

export async function capturePayment(bot, chatId, paymentId, data) {
    try {
        console.info(`Capturing payment for paymentId: ${paymentId}, chatId: ${chatId}`);

        const { status, created_at, amount: { value }, paid } = await checkout.getPayment(paymentId);
        const payload = {
            amount: { 
                value,
                currency: "RUB"
            }
        }
        console.info(`Current payment status: ${status}, paymentId: ${paymentId}`);

        if (status === "succeeded") {
            clearInterval(paymentIntervals[paymentId]);
            return delete paymentIntervals[paymentId];

        }else if (status !== "waiting_for_capture" || (Date.now() - new Date(created_at).getTime()) > 600000) {
            clearInterval(paymentIntervals[paymentId]);
            return delete paymentIntervals[paymentId];
        }

        const captureResponse = await checkout.capturePayment(paymentId, payload, v4());
        if (captureResponse.status !== "succeeded") {
            return await bot.sendMessage(chatId, "❌ Не удалось захватить платеж. Попробуйте снова.");
        }

        await paymentModel.updatePaymentStatus({ chatId, status: captureResponse.status, paymentId, amount: value, paid });

        await succeedPayment(bot, chatId, paymentId, data);
    } catch (error) {
        console.error(`Error capturing payment for paymentId: ${paymentId}, chatId: ${chatId}, error:`, error);
        await bot.sendMessage(chatId, "❌ Ошибка при попытке захватить платеж. Попробуйте позже.");
    }
}


export async function succeedPayment(bot, chatId, paymentId, data) {
    try {
        const { status, paid } = await checkout.getPayment(paymentId);

        if (status !== "succeeded") {
            console.warn(`Payment failed: paymentId: ${paymentId}, status: ${status}`);
            return await bot.sendMessage(chatId, "❌ Оплата не прошла. Попробуйте снова.");
        }

        await bot.sendMessage(chatId, "✅ Ваша оплата прошла успешно!");

        await paymentModel.updatePaymentStatus({
            paid,
            paymentId,
            status
        });

        let user = await new UserModel().findUser(chatId);

        if (!user) {
            const userInfo = await registerQuestions(bot, chatId);
            await createUser(chatId, userInfo);
        }

        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        
        let currentSub = await new SubModel().getCurrentSub(chatId);
        
        if (!currentSub) {
            
            console.log(data)

            if (!data) {
                throw new Error('Invalid subscription type');
            }

            await new SubModel().createSub({
                chatId,
                status,
                type: data,
                price: pricesDb[data].price,  
                durationInDays: pricesDb[data].durationInDays,  
                endDate, 
            });
        
            await new UserModel().updateUser({ chatId, email });
        
            return await bot.sendMessage(chatId, `📅 Подписка активирована до ${endDate.toLocaleDateString()}`, {
                reply_markup: {
                    inline_keyboard: [
                        [{ 
                            text: "Подписаться", 
                            url: process.env.CHANNEL_INVITE_LINK 
                        }]
                    ]
                }
            });
        }
        
        currentSub.setMonth(currentSub.getMonth() + 1);

        await new SubModel().updateCurrentSub(chatId, { endDate: currentSub });

        if (user.isBanned){
            await bot.unBanChatMember(process.env.CHANNEL_ID, chatId)
        }
        
        await saveSubPrice(chatId)

        // const { email } = await registerQuestions(bot, chatId)

        // await checkout.createReceipt({
        //     type: "payment",
        //     send: true, 
        //     payment_id: paymentId,
        //     customer: {
        //         email,  
        //     },
        //     items: [
        //         {
        //             description: "Оплата подписки на канал",
        //             quantity: 1,
        //             amount: {
        //                 value: pricesDb[data].price, 
        //                 currency: "RUB"
        //             },
        //             vat_code: 1
        //         }
        //     ],
        // }, v4());
        await bot.unbanChatMember(process.env.CHANNEL_ID, chatId)
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
                 
        
    } catch (error) {
        console.error(`Error succeeding payment for paymentId: ${paymentId}, chatId: ${chatId}, error: ${error.message}`);
        console.error('Error succeeding payment:', error);
    }
}
