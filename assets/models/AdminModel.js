import { prisma } from "../services/prisma.js";

export class AdminModel{
    async findAll(){
        return await prisma.users.findMany({
            select: {
                chatId: true
            }
        })
    }
}