/*
  Warnings:

  - Added the required column `inventoryId` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuantityUnit" AS ENUM ('LITRES', 'KILOGRAMS', 'GRAMS', 'UNITS');

-- CreateEnum
CREATE TYPE "RecipeType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER');

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "inventoryId" TEXT NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "quantityUnit" "QuantityUnit" NOT NULL DEFAULT 'UNITS';

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "type" "RecipeType" NOT NULL DEFAULT 'DINNER';

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_userId_key" ON "Inventory"("userId");

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
