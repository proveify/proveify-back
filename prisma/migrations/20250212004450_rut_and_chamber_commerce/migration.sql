/*
  Warnings:

  - Added the required column `chamber_commerce` to the `Providers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rut` to the `Providers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Providers` ADD COLUMN `chamber_commerce` VARCHAR(191) NOT NULL,
    ADD COLUMN `rut` VARCHAR(191) NOT NULL;
