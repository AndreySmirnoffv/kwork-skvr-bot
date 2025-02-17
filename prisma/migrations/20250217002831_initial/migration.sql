-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "chatId" BIGINT NOT NULL,
    "email" TEXT,
    "subscription" BOOLEAN NOT NULL DEFAULT true,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "gotSubOnce" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_prices" (
    "id" BIGSERIAL NOT NULL,
    "chatId" BIGINT NOT NULL,
    "price" BIGINT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "subscription_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" BIGSERIAL NOT NULL,
    "chatId" BIGINT NOT NULL,
    "status" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL,
    "price" BIGINT NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" BIGSERIAL NOT NULL,
    "paymentId" TEXT NOT NULL,
    "chatId" BIGINT NOT NULL,
    "amount" BIGINT NOT NULL,
    "status" TEXT NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_chatId_key" ON "users"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_chatId_key" ON "subscriptions"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_paymentId_key" ON "payments"("paymentId");

-- AddForeignKey
ALTER TABLE "subscription_prices" ADD CONSTRAINT "subscription_prices_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "users"("chatId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "users"("chatId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "users"("chatId") ON DELETE RESTRICT ON UPDATE CASCADE;
