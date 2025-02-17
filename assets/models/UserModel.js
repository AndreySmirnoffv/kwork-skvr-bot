import { prisma } from "../services/prisma.js";

export class UserModel{
    async createUser(chatId){

        return await prisma.users.create({
            data: {
                chatId: BigInt(chatId),
            }
        })
    }

    async findUser(chatId){
        return await prisma.users.findFirst({
            where: {chatId}
        })
    }

    async updateUser(data){

        const { chatId, email } = data

        return await prisma.users.update({
            where: { chatId },
            data: { 
                email,
                gotSubOnce: true
            }
        
        })
    }
}