-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'STAFF', 'ADMIN');

-- CreateEnum
CREATE TYPE "SlotState" AS ENUM ('AVAILABLE', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "CardScanningType" AS ENUM ('CHECKIN', 'CHECKOUT');

-- CreateTable
CREATE TABLE "Card" (
    "cardId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID,
    "cardCode" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "lastCheckinTime" TIMESTAMPTZ(6),
    "lastCheckoutTime" TIMESTAMPTZ(6),

    CONSTRAINT "Card_pkey" PRIMARY KEY ("cardId")
);

-- CreateTable
CREATE TABLE "ParkingSlot" (
    "slotId" SMALLINT NOT NULL,
    "state" "SlotState" NOT NULL DEFAULT 'AVAILABLE',

    CONSTRAINT "ParkingSlot_pkey" PRIMARY KEY ("slotId")
);

-- CreateTable
CREATE TABLE "User" (
    "userId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "password" TEXT,
    "refreshTokens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" VARCHAR(255) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "vehicleId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "licensePlate" VARCHAR(255) NOT NULL,
    "userId" UUID NOT NULL,
    "cardId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("vehicleId")
);

-- CreateTable
CREATE TABLE "Video" (
    "videoId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("videoId")
);

-- CreateTable
CREATE TABLE "CheckinLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cardId" UUID NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "type" "CardScanningType" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "CheckinLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_unique_email" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_cardId_key" ON "Vehicle"("cardId");

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "fk_vehicle_card" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE SET NULL ON UPDATE NO ACTION;
