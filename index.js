import TelegramBot from "node-telegram-bot-api";
import dotenv from 'dotenv'
import { readFileSync } from "fs";
import { checkExpiredSubscriptions } from "./assets/scripts/checkExpiredSubScriptions.js";

dotenv.config()

export const bot = new TelegramBot(process.env.TOKEN, { polling: true })

const commands = JSON.parse(readFileSync("./assets/db/commands/commands.json", 'utf-8'))

bot.setMyCommands(commands)

setInterval(checkExpiredSubscriptions, 24 * 60 * 60 * 1000);

